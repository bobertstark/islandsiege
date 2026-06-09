import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { shellInfo } from 'common/fortGrid'
import Fort from 'components/Fort'
import ActionInstructions from 'components/ActionInstructions'
import AttackTargetDisplay, {
  useAttackTarget,
} from 'components/AttackTargetDisplay'

interface Props {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

function locKey(r: number, c: number) {
  return `${r},${c}`
}

export const AttackWave2Phase: React.FC<Props> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const [selected, setSelected] = useState<[number, number][]>([])

  const { targetFort } = useAttackTarget(view)

  const numT = view.diceBank['T'] ?? 0

  const allShellLocs: [number, number][] = targetFort
    ? shellInfo(targetFort.grid)
        .filter(s => s.color !== null)
        .map(s => s.loc)
    : []

  // Can't select more cells than exist — if T > available cells, all cells count as ready
  const required = Math.min(numT, allShellLocs.length)
  const remaining = required - selected.length
  const ready = selected.length === required

  function handleCellClick(loc: [number, number]) {
    const key = locKey(loc[0], loc[1])
    setSelected(prev => {
      const existingIdx = prev.findIndex(([r, c]) => locKey(r, c) === key)
      if (existingIdx !== -1) {
        return prev.filter((_, i) => i !== existingIdx)
      }
      if (prev.length >= required) return prev
      return [...prev, loc]
    })
  }

  function handleConfirm() {
    dispatch({
      type: 'attackWave2',
      payload: { attackLocs: selected },
    })
  }

  const selectedKeys = new Set(selected.map(([r, c]) => locKey(r, c)))
  const highlights = allShellLocs.filter(
    ([r, c]) => !selectedKeys.has(locKey(r, c)),
  )

  if (!targetFort) return null

  return (
    <div style={{ margin: '16px 0' }}>
      <ActionInstructions
        title="Second Wave Attack"
        description={
          isMyTurn
            ? `Select ${required} shell${required !== 1 ? 's' : ''} to destroy.`
            : 'Watching the attacker select shells to destroy.'
        }
      />
      <AttackTargetDisplay
        view={view}
        leftFooter={
          isMyTurn ? (
            <>
              <p
                style={{
                  margin: '8px 0 6px',
                  fontStyle: 'italic',
                  color: '#555',
                  fontSize: 13,
                }}>
                {ready
                  ? `${required} shell${required !== 1 ? 's' : ''} selected — ready to confirm.`
                  : `Select ${remaining} more shell${remaining !== 1 ? 's' : ''}.`}
              </p>
              <button
                onClick={handleConfirm}
                disabled={!ready}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  background: ready ? '#e74c3c' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 'bold',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                }}>
                Confirm Second Wave
              </button>
            </>
          ) : undefined
        }>
        <Fort
          fort={targetFort}
          highlights={isMyTurn && !ready ? highlights : undefined}
          selectedGroup={isMyTurn ? selected : undefined}
          onCellClick={isMyTurn ? handleCellClick : undefined}
        />
      </AttackTargetDisplay>
    </div>
  )
}
