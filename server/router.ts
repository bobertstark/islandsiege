import { Router } from 'express'
import { randomBytes } from 'crypto'
import { createGame, getGame, setGame } from './gameRegistry'
import { broadcastToGame } from './socketHandler'
import { createPlayer } from 'common/player'
import { GamePhases } from 'common/phases'
import { createDeck } from 'common/deck'
import { generateSeed } from 'common/rng'
import { PLAYER_COLORS } from 'common/colors'
import IGameState from 'common/IGameState'

const router = Router()

// GET /api/games/:id/lobby — unauthenticated peek
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

// POST /api/games — open a lobby (no playerCount required)
router.post('/games', (req, res) => {
  const deckState = createDeck()
  const initial: IGameState = {
    playerCount: undefined,
    waitingPlayers: [],
    readyPlayers: [],
    players: [],
    currentPlayerIndex: 0,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    drawnCards: [],
    phase: GamePhases.lobby,
    pending: {},
    shipLocations: {},
    shellReserve: {},
    attackIsOpenWater: false,
    attackRoll: undefined,
    attackRerollsRemaining: 0,
    diceBank: {},
    winningPlayerIndex: undefined,
    rngSeed: generateSeed(),
    log: [],
  }
  const gameId = createGame(initial)
  res.json({ gameId })
})

// POST /api/games/:id/join — add a player; seat if room, otherwise queue
router.post('/games/:id/join', (req, res) => {
  const state = getGame(req.params.id)
  if (!state) {
    res.status(404).json({ error: 'game not found' })
    return
  }
  const { name, color } = req.body ?? {}
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const allPlayers = [...state.players, ...(state.waitingPlayers ?? [])]
  if (allPlayers.some(p => p.name === name)) {
    res.status(409).json({ error: 'name already taken in this game' })
    return
  }

  const takenColors = state.players.map(p => p.color)
  if (color && takenColors.includes(color)) {
    res.status(409).json({ error: 'color already taken' })
    return
  }

  const availableColors = PLAYER_COLORS.filter(
    c => !takenColors.includes(c.value),
  )
  const assignedColor =
    color ??
    availableColors[Math.floor(Math.random() * availableColors.length)]?.value

  const playerId = randomBytes(8).toString('base64url')
  const player = createPlayer(playerId, name, { color: assignedColor })

  const isFirstPlayer =
    state.players.length === 0 && (state.waitingPlayers ?? []).length === 0
  const seated =
    state.playerCount === undefined || state.players.length < state.playerCount

  const logEntry = {
    phase: 'lobbyJoin' as const,
    playerIndex: seated
      ? state.players.length
      : state.players.length + (state.waitingPlayers ?? []).length,
    turn: 0,
    timestamp: new Date().toISOString(),
    data: { playerName: name },
  }

  const updated: IGameState = seated
    ? {
        ...state,
        players: [...state.players, player],
        creatorId: isFirstPlayer ? playerId : state.creatorId,
        phase: GamePhases.lobby,
        log: [...state.log, logEntry],
      }
    : {
        ...state,
        waitingPlayers: [...(state.waitingPlayers ?? []), player],
        creatorId: isFirstPlayer ? playerId : state.creatorId,
        phase: GamePhases.lobby,
        log: [...state.log, logEntry],
      }

  setGame(req.params.id, updated)
  broadcastToGame(req.params.id, updated)

  res.json({
    playerId,
    playerIdx: seated ? state.players.length : undefined,
    waitingIdx: seated ? undefined : (state.waitingPlayers ?? []).length,
    isSeated: seated,
  })
})

export default router
