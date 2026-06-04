import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { PLAYER_COLORS } from 'common/colors'
import ColorPicker from 'components/ColorPicker'
import '../shared.css'

interface LobbyPhaseProps {
  view: IGameStateView
  gameId: string
  playerIdx: number
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const LobbyPhase: React.FC<LobbyPhaseProps> = ({
  view,
  gameId,
  playerIdx,
  dispatch,
}) => {
  const allJoined =
    view.playerCount !== undefined && view.players.length >= view.playerCount
  const isReady = view.readyPlayers.includes(playerIdx)
  const [copied, setCopied] = useState(false)
  const joinUrl = `${window.location.origin}/?join=${gameId}`

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const takenColors = view.players
    .filter((_, i) => i !== playerIdx)
    .map(p => p.color)
    .filter(Boolean) as string[]

  return (
    <div className="start-game-container">
      <h1>Island Siege — Lobby</h1>
      <p>
        Game ID: <strong>{gameId}</strong>
        <button onClick={copyLink} style={{ marginLeft: 12 }}>
          {copied ? 'Copied!' : 'Copy invite link'}
        </button>
      </p>
      <h3>
        Players ({view.players.length}/{view.playerCount ?? '?'})
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {view.players.map((p, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 12,
            }}>
            <span style={{ width: 20, textAlign: 'center', color: 'green' }}>
              {view.readyPlayers.includes(i) ? '✓' : ''}
            </span>
            <span style={{ minWidth: 120 }}>{p.name}</span>
            {i === playerIdx ? (
              <ColorPicker
                allColors={PLAYER_COLORS}
                selectedColor={p.color ?? ''}
                disabledColors={takenColors}
                onSelect={color =>
                  dispatch({ type: 'setColor', payload: { color } })
                }
              />
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: p.color ?? '#ccc',
                  border: '1px solid #888',
                }}
              />
            )}
          </li>
        ))}
        {view.playerCount !== undefined &&
          Array.from({ length: view.playerCount - view.players.length }).map(
            (_, i) => (
              <li
                key={`empty-${i}`}
                style={{ color: '#888', marginBottom: 12 }}>
                Waiting for player…
              </li>
            ),
          )}
      </ul>
      <button
        onClick={() => dispatch({ type: 'startGame' })}
        disabled={!allJoined || isReady}>
        {isReady ? 'Waiting for others…' : 'Ready'}
      </button>
    </div>
  )
}
