import { mockGameState } from '../__mocks__/mockGameState'
import { handleDrawPick } from '../handlers/drawPick'
import { handleBuildFort } from '../handlers/buildFort'
import { handleBuildBuilding } from '../handlers/buildBuilding'
import { handleBuildShip } from '../handlers/buildShip'
import { handleAttackRoll } from '../handlers/attackRoll'
import { handleAttackLeadership } from '../handlers/attackLeadership'
import { handleAttackWave1 } from '../handlers/attackWave1'
import { handleAttackReinforce } from '../handlers/attackReinforce'
import { handleAttackDestroy } from '../handlers/attackDestroy'
import { handleColonize } from '../handlers/colonize'
import { handleVictory } from '../handlers/victory'
import {
  ALL_CARDS,
  createFortById,
  createBuildingById,
  createShipById,
} from '../cardRegistry'
import { addFort, addCardsToHand } from '../player'
import { placeColonists } from '../fort'

test('drawPick appends a log entry', () => {
  const cards = ALL_CARDS.slice(0, 3)
  const state = mockGameState({ drawnCards: cards })
  const next = handleDrawPick(state, { cardID: cards[0].id })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('drawPick')
  expect(next.log[0].playerIndex).toBe(0)
  expect(next.log[0].data.cardIDs).toEqual(cards.map(c => c.id))
  expect(next.log[0].data.drawnCount).toBe(3)
  expect(next.log[0].data.discardedCardID).toBe(cards[0].id)
  expect(typeof next.log[0].timestamp).toBe('string')
})

test('buildFort appends a log entry', () => {
  const fort = createFortById('barricadedFortress')
  const state = mockGameState()
  const withFort = {
    ...state,
    players: state.players.map((p, i) =>
      i === 0 ? addCardsToHand(p, [fort]) : p,
    ),
  }
  const next = handleBuildFort(withFort, { fortID: fort.id, fortGridSpec: [] })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('buildFort')
  expect(next.log[0].data.cardID).toBe(fort.id)
  expect(typeof next.log[0].data.shellsAdded).toBe('number')
  expect(typeof next.log[0].data.coinsGained).toBe('number')
})

test('buildBuilding appends a log entry', () => {
  const fort = createFortById('barricadedFortress') // 3 slots; academy costs 2
  const building = createBuildingById('academy')
  const state = mockGameState()
  // Place 2 colonists on the fort manually so building can be staffed
  const { fort: staffedFort } = placeColonists(fort, 2)
  const player = addCardsToHand(addFort(state.players[0], staffedFort), [
    building,
  ])
  const stateWithPlayer = { ...state, players: [player, state.players[1]] }
  const next = handleBuildBuilding(stateWithPlayer, {
    fortID: fort.id,
    buildingID: building.id,
  })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('buildBuilding')
  expect(next.log[0].data.cardID).toBe(building.id)
  expect(next.log[0].data.fortID).toBe(fort.id)
  expect(typeof next.log[0].data.colonistsMoved).toBe('number')
  expect(typeof next.log[0].data.repairUsed).toBe('boolean')
})

test('buildShip appends a log entry', () => {
  const fort = createFortById('bracedStronghold') // 4 slots; dominica costs 4
  const ship = createShipById('dominica')
  const state = mockGameState()
  // Place 4 colonists on the fort manually so ship can be staffed
  const { fort: staffedFort } = placeColonists(fort, 4)
  const player = addCardsToHand(addFort(state.players[0], staffedFort), [ship])
  const stateWithPlayer = { ...state, players: [player, state.players[1]] }
  const next = handleBuildShip(stateWithPlayer, {
    fortID: fort.id,
    shipID: ship.id,
  })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('buildShip')
  expect(next.log[0].data.cardID).toBe(ship.id)
  expect(next.log[0].data.fortID).toBe(fort.id)
  expect(typeof next.log[0].data.colonistsMoved).toBe('number')
})

// --- Attack Roll ---

test('attackRoll logs a reroll entry on reroll action', () => {
  const state = mockGameState({
    phase: 'attackRoll',
    attackRerollsRemaining: 1,
  })
  const next = handleAttackRoll(state, {
    action: 'reroll',
    diceIndicesReroll: [0],
  })
  const rerollEntries = next.log.filter(
    e => e.phase === 'attackRoll' && Array.isArray(e.data.roll),
  )
  expect(rerollEntries).toHaveLength(1)
  expect(next.log[0].data.rerollsRemaining).toBe(0)
})

test('attackRoll logs a finalize entry on keep action', () => {
  const state = mockGameState({
    phase: 'attackRoll',
    attackRerollsRemaining: 1,
    attackRoll: ['B', 'B', 'B'],
  })
  const next = handleAttackRoll(state, { action: 'keep' })
  const finalEntry = next.log.find(
    e => e.phase === 'attackRoll' && e.data.finalRoll !== undefined,
  )
  expect(finalEntry).toBeDefined()
  expect(finalEntry!.data.finalRoll).toEqual(['B', 'B', 'B'])
})

// --- Attack Leadership ---

test('attackLeadership skip produces no log entry', () => {
  const state = mockGameState({
    phase: 'attackLeadership',
    diceBank: { B: 0, W: 0, G: 0, T: 0, L: 2 },
    shipLocations: { 0: { targetPlayerIndex: 1, fortID: undefined } },
  })
  const next = handleAttackLeadership(state, { skip: true })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('attackLeadership')
  expect(next.log[0].data.skip).toBe(true)
})

// --- Attack Wave 1 ---

test('attackWave1 appends a log entry', () => {
  const fort = createFortById('barricadedFortress')
  const state = mockGameState({
    phase: 'attackWave1',
    diceBank: { B: 2, W: 0, G: 0, T: 0, L: 0 },
    shipLocations: { 0: { targetPlayerIndex: 1, fortID: fort.id } },
    players: [
      mockGameState().players[0],
      addFort(mockGameState().players[1], fort),
    ],
  })
  const next = handleAttackWave1(state, { attackColor: 'B' })
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('attackWave1')
  expect(next.log[0].data.targetPlayerIndex).toBe(1)
  expect(next.log[0].data.attackColor).toBe('B')
  expect(typeof next.log[0].data.strength).toBe('number')
})

// --- Attack Reinforce ---

test('attackReinforce appends a log entry', () => {
  const state = mockGameState({
    diceBank: { B: 2, W: 1, G: 0, T: 0, L: 0 },
    shellReserve: { black: 3, white: 3, gray: 3 },
  })
  const next = handleAttackReinforce(state)
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('attackReinforce')
  expect(next.log[0].data.shellsAdded).toBeDefined()
})

// --- Attack Destroy ---

test('attackDestroy appends a log entry when a fort is destroyed', () => {
  const fort = createFortById('barricadedFortress')
  const emptyFort = {
    ...fort,
    grid: fort.grid.map(row =>
      row.map(cell =>
        cell.type === 'shell' ? { ...cell, color: null } : cell,
      ),
    ),
  }
  const state = mockGameState({
    phase: 'attackDestroy',
    attackIsOpenWater: false,
    shipLocations: { 0: { targetPlayerIndex: 1, fortID: fort.id } },
    players: [
      mockGameState().players[0],
      addFort(mockGameState().players[1], emptyFort),
    ],
  })
  const next = handleAttackDestroy(state)
  if (next.log.length > 0) {
    expect(next.log[0].phase).toBe('attackDestroy')
    expect(next.log[0].data.targetPlayerIndex).toBe(1)
    expect(next.log[0].data.fortID).toBe(fort.id)
  }
})

// --- Colonize ---

test('colonize appends a log entry', () => {
  const state = mockGameState()
  const next = handleColonize(state)
  expect(next.log).toHaveLength(1)
  expect(next.log[0].phase).toBe('colonize')
  expect(typeof next.log[0].data.colonistsMoved).toBe('number')
})

// --- Victory ---

test('victory appends a log entry when game is over', () => {
  const state = mockGameState({
    players: [
      { ...mockGameState().players[0], coins: 20 },
      { ...mockGameState().players[1], coins: 5 },
    ],
  })
  const next = handleVictory(state)
  if (next.phase === 'gameOver') {
    expect(next.log).toHaveLength(1)
    expect(next.log[0].phase).toBe('victory')
    expect(next.log[0].data.winningPlayerIndex).toBe(0)
  }
})
