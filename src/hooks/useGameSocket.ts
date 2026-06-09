import { useCallback, useEffect, useRef, useState } from 'react'
import IGameStateView from 'common/IGameStateView'

const WS_HOST = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`

export function useGameSocket(gameId: string, playerId: string) {
  const [view, setView] = useState<IGameStateView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [kicked, setKicked] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(() => {
    if (!gameId || !playerId) return
    let closed = false
    const ws = new WebSocket(
      `${WS_HOST}/ws?gameId=${gameId}&playerId=${playerId}`,
    )
    wsRef.current = ws
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'state') setView(msg.payload)
      if (msg.type === 'error') setError(msg.payload)
      if (msg.type === 'kicked') setKicked(true)
    }
    ws.onerror = () => {
      if (!closed) setError('Connection error')
    }
    return () => {
      closed = true
      ws.close()
    }
  }, [gameId, playerId])

  const dispatch = useCallback(
    (action: { type: string; payload?: unknown }) => {
      wsRef.current?.send(JSON.stringify({ action }))
    },
    [],
  )

  return { view, dispatch, error, kicked }
}
