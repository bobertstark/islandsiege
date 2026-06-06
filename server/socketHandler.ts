import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { getGame, setGame } from './gameRegistry'
import { gameReducer } from 'common/gameReducer'
import { redactStateForPlayer } from './redact'
import IGameState from 'common/IGameState'

// gameId → connected sockets
const gameSockets = new Map<string, { ws: WebSocket; playerIdx: number }[]>()

export function attachWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '', 'ws://localhost')
    const gameId = url.searchParams.get('gameId') ?? ''
    const playerIdx = parseInt(url.searchParams.get('playerIdx') ?? '-1', 10)
    const playerId = url.searchParams.get('playerId') ?? ''

    const state = getGame(gameId)
    if (!state || playerIdx < 0 || state.players[playerIdx]?.id !== playerId) {
      ws.close(4001, 'unauthorized')
      return
    }

    if (!gameSockets.has(gameId)) gameSockets.set(gameId, [])
    gameSockets.get(gameId)!.push({ ws, playerIdx })

    // Send the joining player their current view
    send(ws, 'state', redactStateForPlayer(state, playerIdx))

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

      // Actions any player can dispatch regardless of turn order
      const nonTurnActions = new Set(['initDraw', 'startGame', 'setColor'])

      if (
        !nonTurnActions.has(msg.action.type) &&
        current.currentPlayerIndex !== playerIdx
      ) {
        send(ws, 'error', 'not your turn')
        return
      }

      // For startGame, server injects the sender's playerIdx to prevent spoofing
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

      const AUTO_PHASES = new Set([
        'victory',
        'draw',
        'attackReinforce',
        'attackDestroy',
        'endTurn',
      ])
      let result
      try {
        result = gameReducer(current, action as any)
        while (AUTO_PHASES.has(result.phase)) {
          result = gameReducer(result, { type: result.phase as any })
        }
      } catch (err) {
        console.error('[reducer error]', err)
        send(ws, 'error', String(err instanceof Error ? err.message : err))
        return
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

function send(ws: WebSocket, type: string, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }))
  }
}

function broadcastState(gameId: string, state: IGameState): void {
  for (const { ws, playerIdx } of gameSockets.get(gameId) ?? []) {
    send(ws, 'state', redactStateForPlayer(state, playerIdx))
  }
}

export function broadcastToGame(gameId: string, state: IGameState): void {
  broadcastState(gameId, state)
}
