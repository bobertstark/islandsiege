import { applyOnBuildEffect } from '../handlers/onBuildEffects'
import { handleBuildBuilding } from '../handlers/buildBuilding'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFortById, createBuildingById } from 'common/cardRegistry'
import { placeColonists } from 'common/fort'
import type IGameState from 'common/IGameState'

// A builder (player 0) holding `buildingID` in hand, with a fort that has
// enough colonists to afford it.
function builderState(buildingID: string): IGameState {
  const base = mockGameState({})
  const cost = createBuildingById(buildingID).cost
  const fort = placeColonists(createFortById('startingFort'), cost).fort
  const players = [...base.players]
  players[0] = {
    ...players[0],
    forts: [fort],
    hand: [...players[0].hand, createBuildingById(buildingID) as never],
  }
  return { ...base, players, currentPlayerIndex: 0 }
}

describe('applyOnBuildEffect — no effect', () => {
  it('returns state unchanged for a building with no on-build effect (armory)', () => {
    const state = builderState('armory')
    expect(applyOnBuildEffect(state, 0, 'armory')).toBe(state)
  })

  it('handleBuildBuilding still builds an effect-less building and reaches endTurn', () => {
    const state = builderState('armory')
    const next = handleBuildBuilding(state, {
      fortID: 'startingFort',
      buildingID: 'armory',
    })
    expect(next.phase).toBe('endTurn')
    expect(next.players[0].forts[0].buildings.map(b => b.id)).toContain(
      'armory',
    )
  })
})

import { totalColonists } from 'common/fort'

describe('prison — returnOpponentFortColonist', () => {
  function prisonState(): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    players[0] = { ...players[0], colonists: 0 }
    const oppFort = placeColonists(createFortById('startingFort'), 2).fort
    players[1] = { ...players[1], colonists: 0, forts: [oppFort] }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('returns 1 colonist from each opponent fort and credits the opponent pool', () => {
    const before = prisonState()
    const fortBefore = totalColonists(before.players[1].forts[0])
    const s = applyOnBuildEffect(before, 0, 'prison')
    expect(totalColonists(s.players[1].forts[0])).toBe(fortBefore - 1)
    expect(s.players[1].colonists).toBe(1)
  })

  it('skips empty opponent forts and leaves the builder untouched', () => {
    const before = prisonState()
    before.players[1] = {
      ...before.players[1],
      forts: [createFortById('startingFort')], // no colonists
    }
    const s = applyOnBuildEffect(before, 0, 'prison')
    expect(s.players[1].colonists).toBe(0)
    expect(s.players[0].colonists).toBe(0)
  })

  it('logs the effect', () => {
    const s = applyOnBuildEffect(prisonState(), 0, 'prison')
    expect(s.log).toContainEqual(
      expect.objectContaining({
        phase: 'buildBuilding',
        data: expect.objectContaining({
          onBuild: 'returnOpponentFortColonist',
        }),
      }),
    )
  })
})

import { createRng } from 'common/rng'
import { ALL_CARDS } from 'common/cardRegistry'

describe('governorsMansion — discardOpponentCard', () => {
  function mansionState(handIds: string[], seed = 7): IGameState {
    const base = mockGameState({ rngSeed: seed })
    const players = [...base.players]
    players[1] = {
      ...players[1],
      hand: handIds.map(id => ALL_CARDS.find(c => c.id === id)!),
    }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('discards the RNG-selected card from the chosen opponent to the shared discard', () => {
    const handIds = ['armory', 'cannonSmith', 'prison']
    const state = mansionState(handIds)
    const expectedIdx = Math.floor(
      createRng(state.rngSeed).next() * handIds.length,
    )
    const expectedCard = state.players[1].hand[expectedIdx]

    const s = applyOnBuildEffect(state, 0, 'governorsMansion', {
      targetPlayerIndex: 1,
    })

    expect(s.players[1].hand).toHaveLength(2)
    expect(s.players[1].hand.map(c => c.id)).not.toContain(expectedCard.id)
    expect(s.discard.map(c => c.id)).toContain(expectedCard.id)
    expect(s.rngSeed).not.toBe(state.rngSeed)
  })

  it('auto-targets the sole opponent when none is provided (2-player)', () => {
    const s = applyOnBuildEffect(
      mansionState(['armory']),
      0,
      'governorsMansion',
    )
    expect(s.players[1].hand).toHaveLength(0)
    expect(s.discard.map(c => c.id)).toContain('armory')
  })

  it('skips when the target hand is empty', () => {
    const state = mansionState([])
    const s = applyOnBuildEffect(state, 0, 'governorsMansion', {
      targetPlayerIndex: 1,
    })
    expect(s).toBe(state)
  })

  it('logs the discard with the chosen opponent and card', () => {
    const s = applyOnBuildEffect(
      mansionState(['armory']),
      0,
      'governorsMansion',
      {
        targetPlayerIndex: 1,
      },
    )
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          onBuild: 'discardOpponentCard',
          targetPlayerIndex: 1,
          cardID: 'armory',
        }),
      }),
    )
  })
})

import { addBuilding } from 'common/fort'

describe('tradeCompany — destroyOpponentBuilding', () => {
  function tradeState(): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    // Use addBuilding so armory.colonists is populated (cost=2), ensuring
    // destroyBuilding returns those colonists to the pool.
    const oppFort = addBuilding(
      placeColonists(createFortById('startingFort'), 2).fort,
      createBuildingById('armory'),
    )
    players[1] = { ...players[1], colonists: 0, forts: [oppFort] }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('destroys the chosen building, sends its card to discard, frees colonists', () => {
    const before = tradeState()
    const s = applyOnBuildEffect(before, 0, 'tradeCompany', {
      targetPlayerIndex: 1,
      buildingID: 'armory',
    })
    expect(s.players[1].forts[0].buildings).toHaveLength(0)
    expect(s.discard.map(c => c.id)).toContain('armory')
    expect(s.players[1].colonists).toBeGreaterThan(0)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          onBuild: 'destroyOpponentBuilding',
          targetPlayerIndex: 1,
          buildingID: 'armory',
        }),
      }),
    )
  })

  it('skips when no building target is provided (no valid target existed)', () => {
    const before = tradeState()
    const s = applyOnBuildEffect(before, 0, 'tradeCompany')
    expect(s).toBe(before)
  })

  it('throws when the named building is not on the target opponent', () => {
    const before = tradeState()
    expect(() =>
      applyOnBuildEffect(before, 0, 'tradeCompany', {
        targetPlayerIndex: 1,
        buildingID: 'cannonSmith',
      }),
    ).toThrow()
  })
})

import { createShipById } from 'common/cardRegistry'
import { addColonists as shipAddColonists } from 'common/ship'

describe('watchtower — destroyOpponentShip', () => {
  function watchtowerState(): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    const ship = shipAddColonists(createShipById('raven'), 1)
    players[1] = { ...players[1], colonists: 0, ships: [ship] }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('destroys the chosen ship, sends its card to discard, frees colonists', () => {
    const before = watchtowerState()
    const s = applyOnBuildEffect(before, 0, 'watchtower', {
      targetPlayerIndex: 1,
      shipID: 'raven',
    })
    expect(s.players[1].ships).toHaveLength(0)
    expect(s.discard.map(c => c.id)).toContain('raven')
    expect(s.players[1].colonists).toBe(1)
    expect(s.log).toContainEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          onBuild: 'destroyOpponentShip',
          targetPlayerIndex: 1,
          shipID: 'raven',
        }),
      }),
    )
  })

  it('skips when no ship target is provided', () => {
    const before = watchtowerState()
    expect(applyOnBuildEffect(before, 0, 'watchtower')).toBe(before)
  })

  it('throws when the named ship is not on the target opponent', () => {
    const before = watchtowerState()
    expect(() =>
      applyOnBuildEffect(before, 0, 'watchtower', {
        targetPlayerIndex: 1,
        shipID: 'victory',
      }),
    ).toThrow()
  })
})

import { handleAction } from '../handlers/action'

describe('silverSmelter — convertColonistsToCoins', () => {
  function smelterState(): IGameState {
    const base = mockGameState({})
    const players = [...base.players]
    const fortA = {
      ...placeColonists(createFortById('startingFort'), 3).fort,
      id: 'fortA',
    }
    const fortB = {
      ...placeColonists(createFortById('startingFort'), 2).fort,
      id: 'fortB',
    }
    players[0] = { ...players[0], coins: 0, forts: [fortA, fortB] }
    return { ...base, players, currentPlayerIndex: 0 }
  }

  it('removes specified colonists from each listed fort and credits the builder', () => {
    const before = smelterState()
    const s = applyOnBuildEffect(before, 0, 'silverSmelter', {
      fortColonistRemovals: { fortA: 2, fortB: 1 },
    })
    expect(s.players[0].coins).toBe(3)
    expect(s.players[0].forts[0].usedSlots).toBe(1)
    expect(s.players[0].forts[1].usedSlots).toBe(1)
  })

  it('leaves unlisted forts untouched', () => {
    const before = smelterState()
    const s = applyOnBuildEffect(before, 0, 'silverSmelter', {
      fortColonistRemovals: { fortA: 1 },
    })
    expect(s.players[0].forts[1].usedSlots).toBe(2)
  })

  it('returns state unchanged when removals map is empty', () => {
    const before = smelterState()
    expect(
      applyOnBuildEffect(before, 0, 'silverSmelter', {
        fortColonistRemovals: {},
      }),
    ).toBe(before)
  })

  it('returns state unchanged when effectTarget is absent', () => {
    const before = smelterState()
    expect(applyOnBuildEffect(before, 0, 'silverSmelter')).toBe(before)
  })

  it('throws when count exceeds usedSlots', () => {
    const before = smelterState()
    expect(() =>
      applyOnBuildEffect(before, 0, 'silverSmelter', {
        fortColonistRemovals: { fortA: 99 },
      }),
    ).toThrow()
  })

  it('throws when fortID does not belong to builder', () => {
    const before = smelterState()
    expect(() =>
      applyOnBuildEffect(before, 0, 'silverSmelter', {
        fortColonistRemovals: { nonexistent: 1 },
      }),
    ).toThrow()
  })

  it('logs the effect with coinsGained and removals', () => {
    const before = smelterState()
    const s = applyOnBuildEffect(before, 0, 'silverSmelter', {
      fortColonistRemovals: { fortA: 2 },
    })
    expect(s.log).toContainEqual(
      expect.objectContaining({
        phase: 'buildBuilding',
        data: expect.objectContaining({
          onBuild: 'convertColonistsToCoins',
          coinsGained: 2,
        }),
      }),
    )
  })
})

describe('handleAction forwards effectTarget to buildBuilding', () => {
  it('resolves governorsMansion against the chosen opponent end-to-end', () => {
    const base = mockGameState({})
    const cost = createBuildingById('governorsMansion').cost
    const fort = placeColonists(createFortById('startingFort'), cost).fort
    const players = [...base.players]
    players[0] = {
      ...players[0],
      forts: [fort],
      hand: [
        ...players[0].hand,
        createBuildingById('governorsMansion') as never,
      ],
    }
    players[1] = {
      ...players[1],
      hand: [ALL_CARDS.find(c => c.id === 'armory')!],
    }
    const state = { ...base, players, currentPlayerIndex: 0 }

    const next = handleAction(state, {
      actionChosen: 'buildBuilding',
      cardID: 'governorsMansion',
      fortID: 'startingFort',
      effectTarget: { targetPlayerIndex: 1 },
    })

    expect(next.phase).toBe('endTurn')
    expect(next.discard.map(c => c.id)).toContain('armory')
  })
})
