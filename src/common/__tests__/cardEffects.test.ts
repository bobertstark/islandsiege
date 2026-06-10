import { handleAttackRoll } from '../handlers/attackRoll'
import { handleAction } from '../handlers/action'
import { handleEndTurn } from '../handlers/endTurn'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFort } from 'common/fort'
import { createBuildingById, createFortById } from 'common/cardRegistry'
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
  it('appends one bonus die per in-play addDieOnAttack building', () => {
    const next = handleAttackRoll(attackerState(['armory']), { action: 'init' })
    expect(next.attackRoll).toHaveLength(3)
    expect(next.attackRoll!.slice(0, 2).every(d => DIE_FACES.includes(d))).toBe(
      true,
    )
    expect(next.attackRoll![2]).toBe('G')
  })

  it('appends the face matching each building (cannonSmith → B, cannonballForge → W, gunpowderHouse → T)', () => {
    const next = handleAttackRoll(
      attackerState(['cannonSmith', 'cannonballForge', 'gunpowderHouse']),
      { action: 'init' },
    )
    expect(next.attackRoll).toHaveLength(5)
    expect(next.attackRoll!.slice(2)).toEqual(['B', 'W', 'T'])
  })

  it('adds no extra dice when the attacker has no bonus buildings', () => {
    const next = handleAttackRoll(attackerState([]), { action: 'init' })
    expect(next.attackRoll).toHaveLength(2)
  })

  it('keeps bonus dice fixed when a reroll requests their indices', () => {
    const rolled = handleAttackRoll(attackerState(['armory']), {
      action: 'init',
    })
    const next = handleAttackRoll(rolled, {
      action: 'reroll',
      diceIndicesReroll: [0, 1, 2],
    })
    // index 2 is the armory bonus and must survive the reroll
    expect(next.attackRoll![2]).toBe('G')
    expect(next.attackRoll).toHaveLength(3)
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
    })
    expect(effectLog(s)).toEqual([])
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
      },
    })
    expect(handleEndTurn(state).attackFlags).toBeUndefined()
  })
})
