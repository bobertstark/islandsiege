import React, { useEffect, useRef, useState } from 'react'
import '../shared.css'

interface InitPhaseProps {
  onJoin: (gameId: string, playerId: string) => void
  prefilledGameId?: string
}

type PendingAction = { kind: 'create' } | { kind: 'join'; gameId: string }

export const InitPhase: React.FC<InitPhaseProps> = ({
  onJoin,
  prefilledGameId = '',
}) => {
  const [joinInput, setJoinInput] = useState(prefilledGameId)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    // pre-fill join flow when arriving via invite link
    prefilledGameId ? { kind: 'join', gameId: prefilledGameId } : null,
  )
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (pendingAction) nameRef.current?.focus()
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
  }

  const modalTitle =
    pendingAction?.kind === 'create' ? 'Create game' : 'Join game'

  return (
    <div className="start-game-container">
      <h1>Island Siege</h1>
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
            <h2 style={{ margin: 0 }}>{modalTitle}</h2>
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
              <button onClick={confirm} disabled={loading || !name.trim()}>
                {loading ? `${modalTitle}…` : modalTitle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
