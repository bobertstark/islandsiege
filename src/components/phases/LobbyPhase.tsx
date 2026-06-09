import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { PLAYER_COLORS } from 'common/colors'
import ColorPicker from 'components/ColorPicker'
import GameLog from 'components/GameLog'
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
  const isCreator = view.isCreator
  const isSeated = view.isSeated
  const isReady = view.readyPlayers.includes(playerIdx)
  const seatsLocked =
    view.playerCount !== undefined && view.players.length >= view.playerCount
  const allSeatedReady =
    seatsLocked &&
    view.players.length > 0 &&
    view.players.every((_, i) => view.readyPlayers.includes(i))
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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 40 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1>Island Siege — Lobby</h1>
          <p>
            Game ID: <strong>{gameId}</strong>
            <button onClick={copyLink} style={{ marginLeft: 12 }}>
              {copied ? 'Copied!' : 'Copy invite link'}
            </button>
          </p>

          {/* Seat count selector — creator only */}
          <div style={{ marginBottom: 20 }}>
            <strong>Seats: </strong>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() =>
                  dispatch({
                    type: 'setPlayerCount',
                    payload: { playerCount: n },
                  })
                }
                disabled={!isCreator}
                style={{
                  marginRight: 6,
                  fontWeight: view.playerCount === n ? 700 : 400,
                  outline: view.playerCount === n ? '2px solid #333' : 'none',
                }}>
                {n}
              </button>
            ))}
            {view.playerCount === undefined && (
              <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                {isCreator
                  ? 'pick a seat count to start'
                  : 'waiting for host to set seats'}
              </span>
            )}
          </div>

          {/* Seated players */}
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
                <span
                  style={{ width: 20, textAlign: 'center', color: 'green' }}>
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
                {i === playerIdx && isSeated && (
                  <button
                    onClick={() =>
                      dispatch({ type: isReady ? 'unready' : 'startGame' })
                    }
                    disabled={!seatsLocked}
                    title={
                      !seatsLocked ? 'Waiting for lobby to fill' : undefined
                    }
                    style={{ marginLeft: 'auto', fontSize: 12 }}>
                    {isReady ? 'Unready' : 'Ready'}
                  </button>
                )}
                {isCreator && i !== playerIdx && (
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'kickPlayer',
                        payload: { playerIdx: i },
                      })
                    }
                    style={{ marginLeft: 'auto', fontSize: 12 }}>
                    Kick
                  </button>
                )}
              </li>
            ))}
            {view.playerCount !== undefined &&
              Array.from({
                length: view.playerCount - view.players.length,
              }).map((_, i) => (
                <li
                  key={`empty-${i}`}
                  style={{ color: '#888', marginBottom: 12 }}>
                  Waiting for player…
                </li>
              ))}
          </ul>

          {/* Waiting queue */}
          {view.waitingPlayers.length > 0 && (
            <>
              <h3>Queue ({view.waitingPlayers.length})</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {view.waitingPlayers.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                      color: '#666',
                    }}>
                    <span
                      style={{ width: 20, textAlign: 'right', flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    <span style={{ minWidth: 120 }}>{p.name}</span>
                    {isCreator && (
                      <button
                        onClick={() =>
                          dispatch({
                            type: 'kickPlayer',
                            payload: { playerIdx: -(i + 1) },
                          })
                        }
                        style={{ marginLeft: 'auto', fontSize: 12 }}>
                        Kick
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Spectator / queue notice */}
          {!isSeated && (
            <p style={{ color: '#888', fontStyle: 'italic' }}>
              {view.queuePosition !== undefined
                ? `You're in the queue — position ${view.queuePosition}. You'll be seated when a slot opens.`
                : 'Spectating'}
            </p>
          )}
        </div>
      </div>

      {/* Game log sidebar */}
      <GameLog log={view.log} players={view.players} />
    </div>
  )
}
