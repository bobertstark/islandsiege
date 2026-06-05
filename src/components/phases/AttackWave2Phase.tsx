import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
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
  const remaining = numT - selected.length
  const ready = selected.length === numT

  function handleCellClick(loc: [number, number]) {
    const key = locKey(loc[0], loc[1])
    setSelected(prev => {
      const existingIdx = prev.findIndex(([r, c]) => locKey(r, c) === key)
      if (existingIdx !== -1) {
        return prev.filter((_, i) => i !== existingIdx)
      }
      if (prev.length >= numT) return prev
      return [...prev, loc]
    })
  }

  function handleConfirm() {
    dispatch({
      type: 'attackWave2',
      payload: { attackLocs: selected },
    })
  }

  const allShellLocs: [number, number][] = targetFort
    ? targetFort.grid.flatMap((row, r) =>
        row.flatMap((cell, c) =>
          cell.type === 'shell' && cell.color !== null
            ? ([[r, c]] as [number, number][])
            : [],
        ),
      )
    : []

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
            ? `Select ${numT} shell${numT !== 1 ? 's' : ''} to destroy.`
            : 'Watching the attacker select shells to destroy.'
        }
      />
      <AttackTargetDisplay view={view}>
        <Fort
          fort={targetFort}
          highlights={isMyTurn && !ready ? highlights : undefined}
          selectedGroup={isMyTurn ? selected : undefined}
          onCellClick={isMyTurn ? handleCellClick : undefined}
        />
      </AttackTargetDisplay>
      {isMyTurn && (
        <div style={{ marginTop: 12 }}>
          <p style={{ marginBottom: 8, fontStyle: 'italic', color: '#555' }}>
            {ready
              ? `${numT} shell${numT !== 1 ? 's' : ''} selected — ready to confirm.`
              : `Select ${remaining} more shell${remaining !== 1 ? 's' : ''} to destroy.`}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={handleConfirm}
              disabled={!ready}
              style={{
                padding: '8px 20px',
                background: ready ? '#e74c3c' : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: ready ? 'pointer' : 'not-allowed',
                fontSize: 15,
              }}>
              Confirm Second Wave
            </button>
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                style={{ padding: '8px 14px', cursor: 'pointer' }}>
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
