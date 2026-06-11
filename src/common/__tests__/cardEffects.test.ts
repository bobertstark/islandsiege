import { handleAttackRoll } from '../handlers/attackRoll'
import { handleAction } from '../handlers/action'
import { handleColonize } from '../handlers/colonize'
import { handleEndTurn } from '../handlers/endTurn'
import { handleAttackLeadership } from '../handlers/attackLeadership'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFort, placeColonists, totalColonists } from 'common/fort'
import {
  createBuildingById,
  createFortById,
  createShipById,
} from 'common/cardRegistry'
import { rerollDice } from 'common/attackRoll'
import { createRng } from 'common/rng'
import { DIE_FACES, DieValue } from 'common/die'
import type IFort from 'common/IFort'
import type IGameState from 'common/IGameState'

function fortWithBuildings(buildingIds: string[]): IFort {
  const fort = createFort({
    id: 'f0',
    name: 'Test Fort',
    description: '',
    gridSpec: [
      [0, 0, 'B'],
      [0, 1, 'B'],
    ],
    slots: 2,
  })
  return { ...fort, buildings: buildingIds.map(createBuildingById) }
}

function attackerState(buildingIds: string[]): IGameState {
  const base = mockGameState({ attackRoll: undefined, rngSeed: 1 })
  const players = [...base.players]
  players[0] = {
    ...players[0],
    attackDice: 2,
    forts: [fortWithBuildings(buildingIds)],
  }
  return { ...base, players }
}

describe('attacker bonus dice (addDieOnAttack)', () => {
  it('bonus face visible in diceBank immediately on init and logs it (armory → G)', () => {
    const next = handleAttackRoll(attackerState(['armory']), { action: 'init' })
    expect(next.attackRoll).toHaveLength(2)
    expect(next.diceBank['G']).toBe(1)
    expect(next.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ bonusDie: 'G', cardID: 'armory' }),
      }),
    )
  })

  it('multiple bonus buildings each appear in diceBank and log (cannonSmith B, cannonballForge W, gunpowderHouse T)', () => {
    const next = handleAttackRoll(
      attackerState(['cannonSmith', 'cannonballForge', 'gunpowderHouse']),
      { action: 'init' },
    )
    expect(next.diceBank['B']).toBe(1)
    expect(next.diceBank['W']).toBe(1)
    expect(next.diceBank['T']).toBe(1)
    expect(next.log.filter(e => e.data.bonusDie)).toHaveLength(3)
  })

  it('no bonus dice when the attacker has no bonus buildings', () => {
    const next = handleAttackRoll(attackerState([]), { action: 'init' })
    expect(next.attackRoll).toHaveLength(2)
    expect(next.log.filter(e => e.data.bonusDie)).toHaveLength(0)
  })

  it('bonus faces persist in diceBank after locking', () => {
    const rolled = handleAttackRoll(attackerState(['armory']), {
      action: 'init',
    })
    const locked = handleAttackRoll(rolled, { action: 'keep' })
    expect(locked.diceBank['G']).toBeGreaterThanOrEqual(1)
  })
})

function defenderState(defenderFortIds: string[]): IGameState {
  const base = mockGameState({ attackRoll: undefined, shipLocations: {} })
  const players = [...base.players]
  players[1] = { ...players[1], forts: defenderFortIds.map(createFortById) }
  return { ...base, players, currentPlayerIndex: 0 }
}

function attack(state: IGameState, fortID: string): IGameState {
  return handleAction(state, {
    actionChosen: 'attack',
    targetPlayerIndex: 1,
    fortID,
  })
}

describe('defender attack flags', () => {
  function effectLog(s: IGameState) {
    return s.log.filter(e => e.data.defenderEffect)
  }

  it('formidableFortress: rolls 1 fewer die and logs it', () => {
    const s = attack(
      defenderState(['formidableFortress']),
      'formidableFortress',
    )
    expect(s.attackFlags?.attackerDiceMinus).toBe(1)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          defenderEffect: 'diceMinus',
          amount: 1,
        }),
      }),
    )
  })

  it('supportedStronghold: 1 fewer reroll and logs it', () => {
    const s = attack(
      defenderState(['supportedStronghold']),
      'supportedStronghold',
    )
    expect(s.attackFlags?.attackerRerollsMinus).toBe(1)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          defenderEffect: 'rerollsMinus',
          amount: 1,
        }),
      }),
    )
  })

  it.each<[string, DieValue]>([
    ['bracedStronghold', 'L'],
    ['fortifiedStronghold', 'B'],
    ['reinforcedStronghold', 'T'],
  ])('%s: bans rerolling [%s] and logs it', (fortId, face) => {
    const s = attack(defenderState([fortId]), fortId)
    expect(s.attackFlags?.banRerollFaces).toEqual([face])
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        data: expect.objectContaining({ defenderEffect: 'banReroll', face }),
      }),
    )
  })

  it('steepWalledStronghold: must reroll all dice and logs it', () => {
    const s = attack(
      defenderState(['steepWalledStronghold']),
      'steepWalledStronghold',
    )
    expect(s.attackFlags?.mustRerollAll).toBe(true)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ defenderEffect: 'mustRerollAll' }),
      }),
    )
  })

  it('flotillaOutpost: subtracts a die only when another fort is targeted', () => {
    const state = defenderState(['startingFort', 'flotillaOutpost'])
    expect(attack(state, 'startingFort').attackFlags?.attackerDiceMinus).toBe(1)
    expect(
      attack(state, 'flotillaOutpost').attackFlags?.attackerDiceMinus,
    ).toBe(0)
  })

  it('no defensive effect: neutral flags and no effect log entries', () => {
    const s = attack(defenderState(['startingFort']), 'startingFort')
    expect(s.attackFlags).toEqual({
      attackerDiceMinus: 0,
      attackerRerollsMinus: 0,
      banRerollFaces: [],
      mustRerollAll: false,
      skipReinforce: false,
      banShipAbilities: false,
      banBuildingAbilities: false,
    })
    expect(effectLog(s)).toEqual([])
  })

  it('secretFortress: sets skipReinforce and logs it', () => {
    const s = attack(defenderState(['secretFortress']), 'secretFortress')
    expect(s.attackFlags?.skipReinforce).toBe(true)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ defenderEffect: 'skipReinforce' }),
      }),
    )
  })

  it('reefsideFortress: sets banShipAbilities and logs it', () => {
    const s = attack(defenderState(['reefsideFortress']), 'reefsideFortress')
    expect(s.attackFlags?.banShipAbilities).toBe(true)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ defenderEffect: 'banShipAbilities' }),
      }),
    )
  })

  it('secludedFortress: sets banBuildingAbilities and logs it', () => {
    const s = attack(defenderState(['secludedFortress']), 'secludedFortress')
    expect(s.attackFlags?.banBuildingAbilities).toBe(true)
    expect(effectLog(s)).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          defenderEffect: 'banBuildingAbilities',
        }),
      }),
    )
  })
})

describe('defender attack flags — consumption', () => {
  function rollState(overrides: Partial<IGameState>): IGameState {
    const base = mockGameState({ attackRoll: undefined, rngSeed: 1 })
    const players = [...base.players]
    players[0] = { ...players[0], attackDice: 3, diceRerolls: 2 }
    return { ...base, players, currentPlayerIndex: 0, ...overrides }
  }

  it('rolls fewer dice (floored at 1) per attackerDiceMinus', () => {
    const next = handleAttackRoll(
      rollState({
        attackFlags: {
          attackerDiceMinus: 1,
          attackerRerollsMinus: 0,
          banRerollFaces: [],
          mustRerollAll: false,
          skipReinforce: false,
          banShipAbilities: false,
          banBuildingAbilities: false,
        },
      }),
      { action: 'init' },
    )
    expect(next.attackRoll).toHaveLength(2)
  })

  it('floors the dice count at 1 when the penalty exceeds the pool', () => {
    const state = rollState({
      attackFlags: {
        attackerDiceMinus: 5,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: false,
        skipReinforce: false,
        banShipAbilities: false,
        banBuildingAbilities: false,
      },
    })
    state.players[0] = { ...state.players[0], attackDice: 2 }
    expect(handleAttackRoll(state, { action: 'init' }).attackRoll).toHaveLength(
      1,
    )
  })

  it('grants fewer rerolls (floored at 0) per attackerRerollsMinus', () => {
    const next = handleAttackRoll(
      rollState({
        attackFlags: {
          attackerDiceMinus: 0,
          attackerRerollsMinus: 1,
          banRerollFaces: [],
          mustRerollAll: false,
          skipReinforce: false,
          banShipAbilities: false,
          banBuildingAbilities: false,
        },
      }),
      { action: 'init' },
    )
    expect(next.attackRerollsRemaining).toBe(1)
  })

  it('does not reroll dice showing a banned face', () => {
    const roll: DieValue[] = ['L', 'B', 'W']
    const state = rollState({
      attackRoll: roll,
      attackRerollsRemaining: 1,
      attackFlags: {
        attackerDiceMinus: 0,
        attackerRerollsMinus: 0,
        banRerollFaces: ['L'],
        mustRerollAll: false,
        skipReinforce: false,
        banShipAbilities: false,
        banBuildingAbilities: false,
      },
    })
    const next = handleAttackRoll(state, {
      action: 'reroll',
      diceIndicesReroll: [0, 1, 2],
    })
    const rng = createRng(1)
    const expected = rerollDice(roll, [1, 2], rng.next.bind(rng))
    expect(next.attackRoll![0]).toBe('L')
    expect(next.attackRoll).toEqual(expected)
  })

  it('rerolls every die when mustRerollAll, ignoring the selection', () => {
    const roll: DieValue[] = ['B', 'B', 'B']
    const state = rollState({
      attackRoll: roll,
      attackRerollsRemaining: 1,
      attackFlags: {
        attackerDiceMinus: 0,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: true,
        skipReinforce: false,
        banShipAbilities: false,
        banBuildingAbilities: false,
      },
    })
    const next = handleAttackRoll(state, {
      action: 'reroll',
      diceIndicesReroll: [0],
    })
    const rng = createRng(1)
    const expected = rerollDice(roll, [0, 1, 2], rng.next.bind(rng))
    expect(next.attackRoll).toEqual(expected)
  })
})

describe('endTurn', () => {
  it('clears attackFlags', () => {
    const state = mockGameState({
      attackFlags: {
        attackerDiceMinus: 1,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: false,
        skipReinforce: false,
        banShipAbilities: false,
        banBuildingAbilities: false,
      },
    })
    expect(handleEndTurn(state).attackFlags).toBeUndefined()
  })
})

describe('ship leadership abilities', () => {
  function leadershipState(attackerShipIds: string[]): IGameState {
    const base = mockGameState({
      diceBank: { B: 1, L: 3 },
      shipLocations: { 0: { targetPlayerIndex: 1, fortID: 'startingFort' } },
    })
    const players = [...base.players]
    players[0] = { ...players[0], ships: attackerShipIds.map(createShipById) }
    const targetFort = placeColonists(createFortById('startingFort'), 2).fort
    players[1] = { ...players[1], forts: [targetFort] }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it.each<[string, DieValue]>([
    ['raven', 'B'],
    ['sisterCatarina', 'G'],
    ['stDaniel', 'W'],
    ['victory', 'T'],
  ])('%s: spends 1L, adds [%s] to diceBank, and logs it', (shipId, face) => {
    const s = handleAttackLeadership(leadershipState([shipId]), {
      effect: 'addDie',
      face,
    })
    expect(s.diceBank['L']).toBe(2)
    expect(s.diceBank[face]).toBe((face === 'B' ? 1 : 0) + 1)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ effect: 'addDie', face, lSpent: 1 }),
      }),
    )
  })

  it('magnifique: spends 1L, gives attacker 1 coin, and logs it', () => {
    const state = leadershipState(['magnifique'])
    const s = handleAttackLeadership(state, { effect: 'gainCoin' })
    expect(s.diceBank['L']).toBe(2)
    expect(s.players[0].coins).toBe(state.players[0].coins + 1)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({ effect: 'gainCoin', lSpent: 1 }),
      }),
    )
  })

  it('dominica: spends 1L, removes 1 colonist from target fort, and logs it', () => {
    const state = leadershipState(['dominica'])
    const s = handleAttackLeadership(state, { effect: 'returnFortColonist' })
    expect(s.diceBank['L']).toBe(2)
    const targetFort = s.players[1].forts.find(f => f.id === 'startingFort')!
    expect(totalColonists(targetFort)).toBe(1)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          effect: 'returnFortColonist',
          lSpent: 1,
        }),
      }),
    )
  })

  it('throws when the player has no ship with the requested ability', () => {
    const state = leadershipState([])
    expect(() =>
      handleAttackLeadership(state, { effect: 'addDie', face: 'B' }),
    ).toThrow()
  })
})

describe('persistent prohibitions', () => {
  function withOpponentBuilding(buildingId: string): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    players[1] = {
      ...players[1],
      forts: [
        {
          ...createFortById('startingFort'),
          buildings: [createBuildingById(buildingId)],
        },
      ],
    }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('governorsMansion bans opponents from drawing', () => {
    expect(() =>
      handleAction(withOpponentBuilding('governorsMansion'), {
        actionChosen: 'draw',
      }),
    ).toThrow()
  })

  it('tradeCompany bans opponents from building buildings', () => {
    expect(() =>
      handleAction(withOpponentBuilding('tradeCompany'), {
        actionChosen: 'buildBuilding',
      }),
    ).toThrow()
  })

  it('watchtower bans opponents from building ships', () => {
    expect(() =>
      handleAction(withOpponentBuilding('watchtower'), {
        actionChosen: 'buildShip',
      }),
    ).toThrow()
  })

  it('does not restrict the building owner', () => {
    const state = {
      ...withOpponentBuilding('governorsMansion'),
      currentPlayerIndex: 1,
    }
    expect(handleAction(state, { actionChosen: 'draw' }).phase).toBe('draw')
  })

  it('allows the action when no opponent has the prohibition building', () => {
    const state = { ...mockGameState({}), currentPlayerIndex: 0 }
    expect(handleAction(state, { actionChosen: 'draw' }).phase).toBe('draw')
  })
})

describe('prison — banFortColonistGain', () => {
  function colonizeState(opponentHasPrison: boolean): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    players[0] = {
      ...players[0],
      colonists: 3,
      forts: [createFortById('startingFort')],
    }
    players[1] = {
      ...players[1],
      forts: opponentHasPrison
        ? [
            {
              ...createFortById('startingFort'),
              buildings: [createBuildingById('prison')],
            },
          ]
        : [createFortById('startingFort')],
    }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('normally moves colonists onto forts during colonize', () => {
    const s = handleColonize(colonizeState(false))
    expect(s.players[0].colonists).toBeLessThan(3)
  })

  it('suppresses fort colonist gain and logs it when an opponent has prison', () => {
    const s = handleColonize(colonizeState(true))
    expect(s.players[0].colonists).toBe(3)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        phase: 'colonize',
        data: expect.objectContaining({ prohibited: 'banFortColonistGain' }),
      }),
    )
  })
})

describe('reefsideFortress — banShipAbilities', () => {
  function withBanShips(attackerShipIds: string[]): IGameState {
    const base = mockGameState({
      diceBank: { L: 4 },
      shipLocations: { 0: { targetPlayerIndex: 1, fortID: 'startingFort' } },
    })
    const players = [...base.players]
    players[0] = { ...players[0], ships: attackerShipIds.map(createShipById) }
    const targetFort = placeColonists(createFortById('startingFort'), 2).fort
    players[1] = {
      ...players[1],
      forts: [targetFort],
      ships: [createShipById('raven')],
    }
    return {
      ...base,
      players,
      currentPlayerIndex: 0,
      attackFlags: {
        attackerDiceMinus: 0,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: false,
        skipReinforce: false,
        banShipAbilities: true,
        banBuildingAbilities: false,
      },
    }
  }

  it('throws when attempting a ship-granted ability (raven addDie)', () => {
    expect(() =>
      handleAttackLeadership(withBanShips(['raven']), {
        effect: 'addDie',
        face: 'B',
      }),
    ).toThrow()
  })

  it('innate destroyShip (cost 2L) still works when banShipAbilities is set', () => {
    const s = handleAttackLeadership(withBanShips([]), {
      effect: 'destroyShip',
      shipID: 'raven',
    })
    expect(s.players[1].ships).toHaveLength(0)
  })
})

describe('secludedFortress — banBuildingAbilities', () => {
  function withBanBuildings(buildingIds: string[]): IGameState {
    return {
      ...attackerState(buildingIds),
      attackFlags: {
        attackerDiceMinus: 0,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: false,
        skipReinforce: false,
        banShipAbilities: false,
        banBuildingAbilities: true,
      },
    }
  }

  it('suppresses armory bonus die on init when banBuildingAbilities is set', () => {
    const next = handleAttackRoll(withBanBuildings(['armory']), {
      action: 'init',
    })
    expect(next.diceBank['G']).toBeUndefined()
    expect(next.log.filter(e => e.data.bonusDie)).toHaveLength(0)
  })

  it('suppresses bonus dice in the final bank on keep', () => {
    // Use a controlled roll with no G so we can assert G is absent after keep
    const state: IGameState = {
      ...withBanBuildings(['armory']),
      attackRoll: ['L', 'B', 'W'],
      attackRerollsRemaining: 0,
    }
    const kept = handleAttackRoll(state, { action: 'keep' })
    expect(kept.diceBank['G']).toBeUndefined()
  })

  it('bonus dice still appear when flag is false', () => {
    const next = handleAttackRoll(attackerState(['armory']), { action: 'init' })
    expect(next.diceBank['G']).toBe(1)
  })
})

describe('coveOutpost — returnAttackerShipColonist', () => {
  function coveState(shipColonists: number): IGameState {
    const base = defenderState(['coveOutpost'])
    const players = [...base.players]
    const ship = { ...createShipById('raven'), colonists: shipColonists }
    players[0] = { ...players[0], ships: [ship] }
    return { ...base, players }
  }

  it('removes 1 colonist from the first ship with colonists and logs it', () => {
    const s = attack(coveState(2), 'coveOutpost')
    expect(s.players[0].ships[0].colonists).toBe(1)
    const effectLog = s.log.filter(e => e.data.defenderEffect)
    expect(effectLog).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          defenderEffect: 'returnAttackerShipColonist',
          shipID: 'raven',
        }),
      }),
    )
  })

  it('skips the effect when no ship has colonists', () => {
    const s = attack(coveState(0), 'coveOutpost')
    expect(s.players[0].ships[0].colonists).toBe(0)
    expect(s.log.filter(e => e.data.defenderEffect)).toHaveLength(0)
  })
})

describe('saboteurOutpost — saboteurDestroyCube', () => {
  function saboteurState(supplyColonists: number): IGameState {
    const base = defenderState(['saboteurOutpost'])
    const players = [...base.players]
    players[0] = { ...players[0], colonists: supplyColonists }
    return { ...base, players }
  }

  it('removes 1 colonist from attacker supply and logs it', () => {
    const s = attack(saboteurState(3), 'saboteurOutpost')
    expect(s.players[0].colonists).toBe(2)
    const effectLog = s.log.filter(e => e.data.defenderEffect)
    expect(effectLog).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          defenderEffect: 'saboteurDestroyCube',
        }),
      }),
    )
  })

  it('skips the effect when supply is already 0', () => {
    const s = attack(saboteurState(0), 'saboteurOutpost')
    expect(s.players[0].colonists).toBe(0)
    expect(s.log.filter(e => e.data.defenderEffect)).toHaveLength(0)
  })
})
