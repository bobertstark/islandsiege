import { Router } from 'express'
import { randomBytes } from 'crypto'
import { createGame, getGame, setGame } from './gameRegistry'
import { broadcastToGame } from './socketHandler'
import { createPlayer } from 'common/player'
import { GamePhases } from 'common/phases'
import { createDeck } from 'common/deck'
import { generateSeed } from 'common/rng'
import IGameState from 'common/IGameState'

const router = Router()

// GET /api/games/:id/lobby — unauthenticated peek: player count + joined players
router.get('/games/:id/lobby', (req, res) => {
  const state = getGame(req.params.id)
  if (!state) {
    res.status(404).json({ error: 'game not found' })
    return
  }
  res.json({
    playerCount: state.playerCount,
    players: state.players.map(p => ({ name: p.name, color: p.color ?? null })),
  })
})

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
    phase: GamePhases.lobby,
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

// POST /api/games/:id/join — add a named player; transition to lobby once full
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
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const takenNames = state.players.map(p => p.name)
  if (takenNames.includes(name)) {
    res.status(409).json({ error: 'name already taken in this game' })
    return
  }

  if (color) {
    const takenColors = state.players.map(p => p.color)
    if (takenColors.includes(color)) {
      res.status(409).json({ error: 'color already taken' })
      return
    }
  }

  const playerId = randomBytes(8).toString('base64url')
  const player = createPlayer(playerId, name, { color: color ?? undefined })
  const updated: IGameState = {
    ...state,
    players: [...state.players, player],
    phase: GamePhases.lobby,
  }

  setGame(req.params.id, updated)
  broadcastToGame(req.params.id, updated)
  res.json({ playerIdx: state.players.length, playerId })
})

export default router
