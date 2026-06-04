import React, { useState } from 'react'
import '../shared.css'

interface InitPhaseProps {
  onJoin: (gameId: string, playerIdx: number, playerId: string) => void
  prefilledGameId?: string
}

export const InitPhase: React.FC<InitPhaseProps> = ({
  onJoin,
  prefilledGameId = '',
}) => {
  const [name, setName] = useState('')
  const [joinInput, setJoinInput] = useState(prefilledGameId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function join(gameId: string) {
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? 'Failed to join')
    }
    const { playerIdx, playerId } = await res.json()
    onJoin(gameId, playerIdx, playerId)
  }

  async function handleCreate(count: number) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerCount: count }),
      })
      if (!res.ok) throw new Error('Failed to create game')
      const { gameId } = await res.json()
      await join(gameId)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setLoading(true)
    setError(null)
    try {
      await join(joinInput.trim())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const nameOk = name.trim().length > 0

  return (
    <div className="start-game-container">
      <h1>Island Siege</h1>
      <div
        className="player-row"
        style={{ justifyContent: 'center', marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="player-input"
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!prefilledGameId && (
        <div style={{ marginBottom: 32 }}>
          <h2>Create Game</h2>
          {[2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => handleCreate(n)}
              disabled={loading || !nameOk}
              style={{ marginRight: 8 }}>
              {n} Players
            </button>
          ))}
        </div>
      )}
      <div>
        <h2>Join Game</h2>
        <input
          type="text"
          placeholder="Game ID"
          value={joinInput}
          onChange={e => setJoinInput(e.target.value)}
          onKeyDown={e =>
            e.key === 'Enter' && nameOk && !loading && handleJoin()
          }
          className="player-input"
        />
        <button
          onClick={handleJoin}
          disabled={loading || !nameOk || !joinInput.trim()}>
          {loading ? 'Joining…' : 'Join'}
        </button>
      </div>
    </div>
  )
}
