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

      if (current.currentPlayerIndex !== playerIdx) {
        send(ws, 'error', 'not your turn')
        return
      }

      const next = gameReducer(current, msg.action as any)
      setGame(gameId, next)
      broadcastState(gameId, next)
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
