import React, { useEffect, useRef, useState } from 'react'
import './Game.css'
import '../shared.css'
import { GamePhases } from 'common/phases'
import IGameStateView from 'common/IGameStateView'
import GameBoard from '../GameBoard'
import { Deck, Discard } from '../Deck'
import { ActionPhase } from './ActionPhase'
import { InitPhase } from './InitPhase'
import { LobbyPhase } from './LobbyPhase'

const WS_HOST = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001`

type Status = 'idle' | 'connected' | 'error'

function useGameSocket(
  gameId: string,
  playerIdx: number,
  playerId: string,
  enabled: boolean,
) {
  const [view, setView] = useState<IGameStateView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled) return
    const ws = new WebSocket(
      `${WS_HOST}/ws?gameId=${gameId}&playerIdx=${playerIdx}&playerId=${playerId}`,
    )
    wsRef.current = ws
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'state') setView(msg.payload)
      if (msg.type === 'error') setError(msg.payload)
    }
    ws.onerror = () => setError('Connection error')
    return () => ws.close()
  }, [enabled, gameId, playerIdx, playerId])

  function dispatch(action: { type: string; payload?: unknown }) {
    wsRef.current?.send(JSON.stringify({ action }))
  }

  return { view, dispatch, error }
}

const Game: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [gameId, setGameId] = useState('')
  const [playerIdx, setPlayerIdx] = useState(0)
  const [playerId, setPlayerId] = useState('')

  const { view, dispatch, error } = useGameSocket(
    gameId,
    playerIdx,
    playerId,
    status === 'connected',
  )

  function handleJoin(gid: string, idx: number, pid: string) {
    setGameId(gid)
    setPlayerIdx(idx)
    setPlayerId(pid)
    setStatus('connected')
  }

  if (status === 'idle') {
    return <InitPhase onJoin={handleJoin} />
  }

  if (error) return <div className="error">Error: {error}</div>
  if (!view) return <div>Connecting…</div>

  const renderPhase = () => {
    switch (view.phase) {
      case GamePhases.lobby:
        return (
          <LobbyPhase
            view={view}
            gameId={gameId}
            playerIdx={playerIdx}
            dispatch={dispatch}
          />
        )
      case GamePhases.action:
        return <ActionPhase state={view as any} dispatch={dispatch} />
      default:
        return (
          <div className="game-container">
            <h1>Island Siege</h1>
            <div className="game-header">
              <Deck count={view.deckCount} onDraw={() => {}} />
              <Discard count={view.discard?.length ?? 0} />
            </div>
            <GameBoard state={view} dispatch={dispatch} />
          </div>
        )
    }
  }

  return renderPhase()
}

export default Game
