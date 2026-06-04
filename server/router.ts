import { Router } from 'express'
import { randomBytes } from 'crypto'
import { createGame, getGame, setGame } from './gameRegistry'
import { createPlayer } from 'common/player'
import { gameReducer } from 'common/gameReducer'
import { GamePhases } from 'common/phases'
import { createDeck } from 'common/deck'
import { generateSeed } from 'common/rng'
import IGameState from 'common/IGameState'

const router = Router()

// POST /api/games — open a lobby for playerCount players
router.post('/games', (req, res) => {
  const playerCount = parseInt(req.body?.playerCount, 10)
  if (!playerCount || playerCount < 2 || playerCount > 4) {
    res.status(400).json({ error: 'playerCount must be 2–4' })
    return
  }
  const deckState = createDeck()
  const initial: IGameState = {
    playerCount,
    readyPlayers: [],
    players: [],
    currentPlayerIndex: 0,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    phase: GamePhases.initGame,
    pending: {},
    shipLocations: {},
    shellReserve: {},
    attackIsOpenWater: false,
    attackRoll: undefined,
    attackRerollsRemaining: 0,
    attackValueCounts: {},
    winningPlayerIndex: undefined,
    rngSeed: generateSeed(),
  }
  const gameId = createGame(initial)
  res.json({ gameId })
})

// POST /api/games/:id/join — add a named player; start game when lobby is full
router.post('/games/:id/join', (req, res) => {
  const state = getGame(req.params.id)
  if (!state) {
    res.status(404).json({ error: 'game not found' })
    return
  }
  if (state.players.length >= state.playerCount) {
    res.status(409).json({ error: 'game is full' })
    return
  }
  const { name, color } = req.body ?? {}
  if (!name || !color) {
    res.status(400).json({ error: 'name and color are required' })
    return
  }

  const takenColors = state.players.map(p => p.color)
  if (takenColors.includes(color)) {
    res.status(409).json({ error: 'color already taken' })
    return
  }

  const playerId = randomBytes(8).toString('base64url')
  const player = createPlayer(playerId, name, { color })
  const updated: IGameState = {
    ...state,
    players: [...state.players, player],
  }

  let final: IGameState
  if (updated.players.length === updated.playerCount) {
    // Run initGame to deal cards and pick first player; then restore stable player IDs
    const stableIds = updated.players.map(p => p.id)
    const initialized = gameReducer(updated, {
      type: GamePhases.initGame,
      payload: {
        playerNames: updated.players.map(p => p.name),
        playerColors: updated.players.map(p => p.color ?? ''),
      },
    })
    // handleInitGame recreates players with idx-based ids; restore the original tokens
    final = {
      ...initialized,
      players: initialized.players.map((p, i) => ({ ...p, id: stableIds[i] })),
    }
  } else {
    final = updated
  }

  setGame(req.params.id, final)
  res.json({ playerIdx: state.players.length, playerId })
})

export default router
