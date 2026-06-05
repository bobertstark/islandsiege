import React, { useEffect } from 'react'
import IGameStateView from 'common/IGameStateView'
import { TurnBanner } from 'components/TurnBanner'
import GameBoard from 'components/GameBoard'

interface Props {
  view: IGameStateView
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}

function reinforceGains(diceBank: IGameStateView['diceBank']): string {
  const parts: string[] = []
  for (const [sym, label] of [
    ['B', 'Black'],
    ['W', 'White'],
    ['G', 'Gray'],
  ] as const) {
    const n = diceBank[sym] ?? 0
    if (n > 0) parts.push(`${label} ×${n}`)
  }
  return parts.join(', ')
}

export const AttackReinforceOrWave2Phase: React.FC<Props> = ({
  view,
  isMyTurn,
  waitingFor,
  dispatch,
}) => {
  const canWave2 = (view.diceBank['T'] ?? 0) > 0
  const canReinforce = (['B', 'W', 'G'] as const).some(
    s => (view.diceBank[s] ?? 0) > 0,
  )
  const neitherPossible = !canWave2 && !canReinforce

  useEffect(() => {
    if (!isMyTurn || !neitherPossible) return
    const timer = setTimeout(() => {
      dispatch({
        type: 'attackReinforceOrWave2',
        payload: { choice: 'reinforce' },
      })
    }, 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, neitherPossible])

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && (
        <div style={{ padding: '16px 0' }}>
          <h2 style={{ marginBottom: 16 }}>Choose your next action</h2>
          {neitherPossible ? (
            <p style={{ color: '#c0392b', fontStyle: 'italic' }}>
              No actions available — advancing…
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() =>
                  dispatch({
                    type: 'attackReinforceOrWave2',
                    payload: { choice: 'wave2' },
                  })
                }
                disabled={!canWave2}
                title={!canWave2 ? 'No T dice remaining' : undefined}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontWeight: 'bold',
                  cursor: canWave2 ? 'pointer' : 'not-allowed',
                  opacity: canWave2 ? 1 : 0.4,
                  background: canWave2 ? '#2980b9' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                }}>
                Second Wave
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: 'attackReinforceOrWave2',
                    payload: { choice: 'reinforce' },
                  })
                }
                disabled={!canReinforce}
                title={!canReinforce ? 'No shell dice remaining' : undefined}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontWeight: 'bold',
                  cursor: canReinforce ? 'pointer' : 'not-allowed',
                  opacity: canReinforce ? 1 : 0.4,
                  background: canReinforce ? '#27ae60' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  fontSize: 15,
                }}>
                Reinforce
                {canReinforce && (
                  <span
                    style={{
                      fontWeight: 'normal',
                      fontSize: 13,
                      marginLeft: 6,
                    }}>
                    ({reinforceGains(view.diceBank)})
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}
