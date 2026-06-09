import React, { useEffect } from 'react'
import IGameStateView from 'common/IGameStateView'
import AttackTargetDisplay from 'components/AttackTargetDisplay'
import ActionInstructions from 'components/ActionInstructions'

interface Props {
  view: IGameStateView
  isMyTurn: boolean
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
    <>
      <ActionInstructions
        title="Choose Next Action"
        description={
          isMyTurn
            ? 'Click the T die to launch a second wave, or reinforce with shell dice.'
            : 'Waiting for the attacker to choose their next action.'
        }
      />
      <AttackTargetDisplay
        view={view}
        onDieClick={
          isMyTurn && canWave2
            ? face => {
                if (face === 'T')
                  dispatch({
                    type: 'attackReinforceOrWave2',
                    payload: { choice: 'wave2' },
                  })
              }
            : undefined
        }
        leftFooter={
          isMyTurn ? (
            neitherPossible ? (
              <p
                style={{ color: '#c0392b', fontStyle: 'italic', marginTop: 8 }}>
                No actions available — advancing…
              </p>
            ) : canReinforce ? (
              <button
                onClick={() =>
                  dispatch({
                    type: 'attackReinforceOrWave2',
                    payload: { choice: 'reinforce' },
                  })
                }
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '8px 0',
                  borderRadius: 6,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  fontSize: 14,
                }}>
                Reinforce
                <span
                  style={{ fontWeight: 'normal', fontSize: 12, marginLeft: 6 }}>
                  ({reinforceGains(view.diceBank)})
                </span>
              </button>
            ) : null
          ) : null
        }
      />
    </>
  )
}
