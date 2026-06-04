import { useEffect, useRef, useState } from 'react'
import IGameStateView from 'common/IGameStateView'

const WS_HOST = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001`

export function useGameSocket(
  gameId: string,
  playerIdx: number,
  playerId: string,
) {
  const [view, setView] = useState<IGameStateView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(() => {
    if (!gameId || !playerId) return
    let closed = false
    const ws = new WebSocket(
      `${WS_HOST}/ws?gameId=${gameId}&playerIdx=${playerIdx}&playerId=${playerId}`,
    )
    wsRef.current = ws
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'state') setView(msg.payload)
      if (msg.type === 'error') setError(msg.payload)
    }
    ws.onerror = () => {
      if (!closed) setError('Connection error')
    }
    return () => {
      closed = true
      ws.close()
    }
  }, [gameId, playerIdx, playerId])

  function dispatch(action: { type: string; payload?: unknown }) {
    wsRef.current?.send(JSON.stringify({ action }))
  }

  return { view, dispatch, error }
}
