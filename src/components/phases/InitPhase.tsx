import React, { useEffect, useRef, useState } from 'react'
import '../shared.css'

interface InitPhaseProps {
  onJoin: (gameId: string, playerId: string) => void
  prefilledGameId?: string
  kickedFromGame?: boolean
}

type PendingAction = { kind: 'create' } | { kind: 'join'; gameId: string }

interface LobbyInfo {
  playerCount: number | null
  players: { name: string }[]
}

export const InitPhase: React.FC<InitPhaseProps> = ({
  onJoin,
  prefilledGameId = '',
  kickedFromGame = false,
}) => {
  const [joinInput, setJoinInput] = useState(prefilledGameId)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    prefilledGameId ? { kind: 'join', gameId: prefilledGameId } : null,
  )
  const [lobbyInfo, setLobbyInfo] = useState<LobbyInfo | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pendingAction) nameRef.current?.focus()
  }, [pendingAction])

  // Fetch lobby info when a join modal opens
  useEffect(() => {
    if (pendingAction?.kind !== 'join') {
      setLobbyInfo(null)
      return
    }
    let cancelled = false
    fetch(`/api/games/${pendingAction.gameId}/lobby`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!cancelled && data)
          setLobbyInfo({
            playerCount: data.playerCount ?? null,
            players: data.players ?? [],
          })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pendingAction])

  async function joinGame(gameId: string, playerName: string) {
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName.trim() }),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? 'Failed to join')
    }
    const { playerId } = await res.json()
    onJoin(gameId, playerId)
  }

  async function confirm() {
    if (!pendingAction || !name.trim()) return
    setLoading(true)
    setError(null)
    try {
      if (pendingAction.kind === 'create') {
        const res = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (!res.ok) throw new Error('Failed to create game')
        const { gameId } = await res.json()
        await joinGame(gameId, name.trim())
      } else {
        await joinGame(pendingAction.gameId, name.trim())
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function dismiss() {
    setPendingAction(null)
    setName('')
    setError(null)
    setLobbyInfo(null)
  }

  const modalTitle =
    pendingAction?.kind === 'create' ? 'Create game' : 'Join game'

  const lobbyStatus =
    lobbyInfo &&
    (lobbyInfo.playerCount !== null
      ? `${lobbyInfo.players.length} / ${lobbyInfo.playerCount} players`
      : `${lobbyInfo.players.length} player${lobbyInfo.players.length !== 1 ? 's' : ''} in lobby`)

  return (
    <div className="start-game-container">
      <h1>Island Siege</h1>
      {kickedFromGame && (
        <p style={{ color: '#c00' }}>You were removed from the game.</p>
      )}
      {!prefilledGameId && (
        <div style={{ marginBottom: 32 }}>
          <h2>Create Game</h2>
          <button onClick={() => setPendingAction({ kind: 'create' })}>
            Create Game
          </button>
        </div>
      )}

      <div>
        <h2>Join Game</h2>
        <input
          type="text"
          placeholder="Game ID"
          value={joinInput}
          onChange={e => setJoinInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && joinInput.trim())
              setPendingAction({ kind: 'join', gameId: joinInput.trim() })
          }}
          className="player-input"
        />
        <button
          onClick={() =>
            setPendingAction({ kind: 'join', gameId: joinInput.trim() })
          }
          disabled={!joinInput.trim()}>
          Join
        </button>
      </div>

      {/* Name popup modal */}
      {pendingAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) dismiss()
          }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '32px 28px',
              minWidth: 300,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
            <h2 style={{ margin: 0 }}>Enter your name</h2>
            {lobbyStatus && (
              <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
                {lobbyStatus}
              </p>
            )}
            {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
            <input
              ref={nameRef}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim() && !loading) confirm()
                if (e.key === 'Escape') dismiss()
              }}
              className="player-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <div
              style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={dismiss} disabled={loading}>
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={loading || !name.trim()}
                style={{
                  background: loading || !name.trim() ? undefined : '#2a9d2a',
                  color: loading || !name.trim() ? undefined : '#fff',
                  borderColor: loading || !name.trim() ? undefined : '#1e7a1e',
                }}>
                {loading ? `${modalTitle}…` : modalTitle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
