import React, { useEffect, useRef, useState } from 'react'
import { PLAYER_COLORS } from 'common/colors'
import './Game.css'
import '../shared.css'
import { GamePhases } from 'common/phases'
import IGameStateView from 'common/IGameStateView'
import GameBoard from '../GameBoard'
import { Deck, Discard } from '../Deck'
import { ActionPhase } from './ActionPhase'
import { InitPhase } from './InitPhase'

const API = '' // relative — proxied by CRA in dev
const WS_HOST = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001`

type Status = 'idle' | 'joining' | 'connected' | 'error'

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
  const [setupError, setSetupError] = useState<string | null>(null)
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [playerColors, setPlayerColors] = useState([
    PLAYER_COLORS[0].value,
    PLAYER_COLORS[1].value,
  ])

  const { view, dispatch, error } = useGameSocket(
    gameId,
    playerIdx,
    playerId,
    status === 'connected',
  )

  async function handleStartGame(names: string[], colors: string[]) {
    setStatus('joining')
    setSetupError(null)
    try {
      const createRes = await fetch(`${API}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerCount: names.length }),
      })
      if (!createRes.ok) throw new Error('Failed to create game')
      const { gameId: gid } = await createRes.json()

      // Join each player sequentially
      let myIdx = 0
      let myId = ''
      for (let i = 0; i < names.length; i++) {
        const joinRes = await fetch(`${API}/api/games/${gid}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: names[i], color: colors[i] }),
        })
        if (!joinRes.ok) throw new Error(`Failed to join as player ${i + 1}`)
        const { playerIdx: idx, playerId: pid } = await joinRes.json()
        // For now (local hotseat), connect as the first player
        if (i === 0) {
          myIdx = idx
          myId = pid
        }
      }

      setGameId(gid)
      setPlayerIdx(myIdx)
      setPlayerId(myId)
      setStatus('connected')
    } catch (e) {
      setSetupError(String(e))
      setStatus('idle')
    }
  }

  if (status === 'idle' || status === 'joining') {
    return (
      <InitPhase
        playerNames={playerNames}
        setPlayerNames={setPlayerNames}
        playerColors={playerColors}
        setPlayerColors={setPlayerColors}
        handleStartGame={handleStartGame}
        loading={status === 'joining'}
        error={setupError}
      />
    )
  }

  const combinedError = error || setupError
  if (combinedError) return <div className="error">Error: {combinedError}</div>
  if (!view) return <div>Connecting…</div>

  const renderPhase = () => {
    switch (view.phase) {
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
