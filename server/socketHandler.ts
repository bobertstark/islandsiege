import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { getGame, setGame } from './gameRegistry'
import { gameReducer } from 'common/gameReducer'
import { redactStateForPlayer, redactStateForWaiting } from './redact'
import IGameState from 'common/IGameState'

// gameId → connected sockets (identified by playerId, not cached index)
const gameSockets = new Map<string, { ws: WebSocket; playerId: string }[]>()

export function attachWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '', 'ws://localhost')
    const gameId = url.searchParams.get('gameId') ?? ''
    const playerId = url.searchParams.get('playerId') ?? ''

    const state = getGame(gameId)
    const seated = state?.players.findIndex(p => p.id === playerId) ?? -1
    const waiting =
      seated < 0
        ? (state?.waitingPlayers ?? []).findIndex(p => p.id === playerId)
        : -1

    if (!state || (seated < 0 && waiting < 0)) {
      ws.close(4001, 'unauthorized')
      return
    }

    if (!gameSockets.has(gameId)) gameSockets.set(gameId, [])
    gameSockets.get(gameId)!.push({ ws, playerId })

    if (seated >= 0) {
      send(ws, 'state', redactStateForPlayer(state, seated))
    } else {
      send(ws, 'state', redactStateForWaiting(state, waiting))
    }

    ws.on('message', raw => {
      let msg: { action: { type: string; payload?: unknown } }
      try {
        msg = JSON.parse(String(raw))
      } catch {
        return
      }
      if (!msg.action?.type) return

      const current = getGame(gameId)
      if (!current) return

      const playerIdx = current.players.findIndex(p => p.id === playerId)
      const isCreator = current.creatorId === playerId

      // Waiting (unseated) players may not dispatch any actions
      if (playerIdx < 0) {
        send(ws, 'error', 'not seated')
        return
      }

      // Lobby-only creator actions handled here, not via reducer
      if (msg.action.type === 'kickPlayer') {
        if (!isCreator) {
          send(ws, 'error', 'only the creator can kick')
          return
        }
        const payload = msg.action.payload as any
        let targetId: string | undefined = payload?.playerId
        if (!targetId && payload?.playerIdx !== undefined) {
          const idx = payload.playerIdx as number
          if (idx >= 0) {
            targetId = current.players[idx]?.id
          } else {
            // negative index → waiting player: -(i+1) → i
            const waitIdx = -(idx + 1)
            targetId = (current.waitingPlayers ?? [])[waitIdx]?.id
          }
        }
        if (!targetId) return
        handleKick(gameId, current, targetId)
        return
      }

      if (msg.action.type === 'setPlayerCount') {
        if (!isCreator) {
          send(ws, 'error', 'only the creator can set player count')
          return
        }
        const count = (msg.action.payload as any)?.playerCount as number
        if (!count || count < 2 || count > 4) {
          send(ws, 'error', 'playerCount must be 2–4')
          return
        }
        handleSetPlayerCount(gameId, current, count)
        return
      }

      if (msg.action.type === 'unready') {
        const unreadyEntry = {
          phase: 'lobbyUnready' as const,
          playerIndex: playerIdx,
          turn: 0,
          timestamp: new Date().toISOString(),
          data: {},
        }
        const updated = {
          ...current,
          readyPlayers: (current.readyPlayers ?? []).filter(
            i => i !== playerIdx,
          ),
          log: [...current.log, unreadyEntry],
        }
        setGame(gameId, updated)
        broadcastState(gameId, updated)
        return
      }

      // Actions any seated player can dispatch regardless of turn order
      const nonTurnActions = new Set(['initDraw', 'startGame', 'setColor'])

      if (
        !nonTurnActions.has(msg.action.type) &&
        current.currentPlayerIndex !== playerIdx
      ) {
        send(ws, 'error', 'not your turn')
        return
      }

      const action =
        msg.action.type === 'startGame'
          ? { type: 'startGame' as const, payload: { playerIdx } }
          : msg.action.type === 'setColor'
            ? {
                type: 'setColor' as const,
                payload: {
                  playerIdx,
                  color: (msg.action.payload as any)?.color,
                },
              }
            : msg.action.type === 'initDraw'
              ? {
                  type: 'initDraw' as const,
                  payload: {
                    playerIdx,
                    cardID: (msg.action.payload as any)?.cardID,
                  },
                }
              : msg.action

      // Append lobbyReady log entry before reducer runs startGame
      let stateBeforeReduce = current
      if (msg.action.type === 'startGame') {
        const readyEntry = {
          phase: 'lobbyReady' as const,
          playerIndex: playerIdx,
          turn: 0,
          timestamp: new Date().toISOString(),
          data: {},
        }
        stateBeforeReduce = { ...current, log: [...current.log, readyEntry] }
      }

      const AUTO_PHASES = new Set([
        'victory',
        'draw',
        'attackReinforce',
        'attackDestroy',
        'endTurn',
      ])
      let result
      try {
        result = gameReducer(stateBeforeReduce, action as any)
        while (AUTO_PHASES.has(result.phase)) {
          result = gameReducer(result, { type: result.phase as any })
        }
      } catch (err) {
        console.error('[reducer error]', err)
        send(ws, 'error', String(err instanceof Error ? err.message : err))
        return
      }

      // If game just transitioned out of lobby, append lobbyStart
      if (current.phase === 'lobby' && result.phase !== 'lobby') {
        const startEntry = {
          phase: 'lobbyStart' as const,
          playerIndex: playerIdx,
          turn: 0,
          timestamp: new Date().toISOString(),
          data: {},
        }
        result = { ...result, log: [...result.log, startEntry] }
      }

      setGame(gameId, result)
      broadcastState(gameId, result)
    })

    ws.on('close', () => {
      const sockets = gameSockets.get(gameId)
      if (!sockets) return
      const idx = sockets.findIndex(s => s.ws === ws)
      if (idx !== -1) sockets.splice(idx, 1)
    })
  })
}

function handleKick(gameId: string, state: IGameState, targetId: string): void {
  const seatedIdx = state.players.findIndex(p => p.id === targetId)
  const waitingIdx = (state.waitingPlayers ?? []).findIndex(
    p => p.id === targetId,
  )

  if (seatedIdx < 0 && waitingIdx < 0) return

  const targetName =
    seatedIdx >= 0
      ? state.players[seatedIdx].name
      : (state.waitingPlayers ?? [])[waitingIdx].name

  const kickEntry = {
    phase: 'lobbyKick' as const,
    playerIndex: seatedIdx >= 0 ? seatedIdx : -1,
    turn: 0,
    timestamp: new Date().toISOString(),
    data: { kickedName: targetName },
  }

  let updated: IGameState
  if (seatedIdx >= 0) {
    const newPlayers = state.players.filter((_, i) => i !== seatedIdx)
    const waiting = state.waitingPlayers ?? []
    const promoted = waiting[0]
    const newWaiting = waiting.slice(1)
    updated = {
      ...state,
      players: promoted ? [...newPlayers, promoted] : newPlayers,
      waitingPlayers: newWaiting,
      readyPlayers: state.readyPlayers.filter(i => i !== seatedIdx),
      log: [...state.log, kickEntry],
    }
  } else {
    updated = {
      ...state,
      waitingPlayers: (state.waitingPlayers ?? []).filter(
        (_, i) => i !== waitingIdx,
      ),
      log: [...state.log, kickEntry],
    }
  }

  setGame(gameId, updated)
  broadcastState(gameId, updated)
}

function handleSetPlayerCount(
  gameId: string,
  state: IGameState,
  count: number,
): void {
  let players = [...state.players]
  let waiting = [...(state.waitingPlayers ?? [])]

  if (count < players.length) {
    // Move excess seated players (from the tail) to the front of the queue
    const excess = players.splice(count)
    waiting = [...excess, ...waiting]
  } else if (count > players.length) {
    // Promote from queue to fill seats
    const needed = count - players.length
    const promoted = waiting.splice(0, needed)
    players = [...players, ...promoted]
  }

  const updated: IGameState = {
    ...state,
    playerCount: count,
    players,
    waitingPlayers: waiting,
    readyPlayers: state.readyPlayers.filter(i => i < players.length),
  }
  setGame(gameId, updated)
  broadcastState(gameId, updated)
}

function send(ws: WebSocket, type: string, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }))
  }
}

function broadcastState(gameId: string, state: IGameState): void {
  for (const { ws, playerId } of gameSockets.get(gameId) ?? []) {
    const playerIdx = state.players.findIndex(p => p.id === playerId)
    const waitingIdx =
      playerIdx < 0
        ? (state.waitingPlayers ?? []).findIndex(p => p.id === playerId)
        : -1

    if (playerIdx >= 0) {
      send(ws, 'state', redactStateForPlayer(state, playerIdx))
    } else if (waitingIdx >= 0) {
      send(ws, 'state', redactStateForWaiting(state, waitingIdx))
    } else {
      // Player was kicked — notify and close
      send(ws, 'kicked', {})
      ws.close()
    }
  }
}

export function broadcastToGame(gameId: string, state: IGameState): void {
  broadcastState(gameId, state)
}
