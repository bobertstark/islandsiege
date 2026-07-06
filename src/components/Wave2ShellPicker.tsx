import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { shellInfo } from 'common/fortGrid'
import Fort from 'components/Fort'
import AttackTargetDisplay, {
  useAttackTarget,
} from 'components/AttackTargetDisplay'

interface Props {
  view: IGameStateView
  // Whether the viewer is the one choosing (attacker in standard wave 2,
  // defender for guardedFortress). Non-choosers see the static board.
  active: boolean
  onConfirm: (attackLocs: [number, number][]) => void
}

function locKey(r: number, c: number) {
  return `${r},${c}`
}

// Shell-selection board shared by the standard second wave attack and the
// defender-driven guardedFortress variant; they differ only in who is active
// and what action the confirm dispatches.
const Wave2ShellPicker: React.FC<Props> = ({ view, active, onConfirm }) => {
  const { targetFort } = useAttackTarget(view)
  const [selected, setSelected] = useState<[number, number][]>([])

  const numT = view.diceBank['T'] ?? 0
  const allShellLocs: [number, number][] = targetFort
    ? shellInfo(targetFort.grid)
        .filter(s => s.color !== null)
        .map(s => s.loc)
    : []

  // Can't select more cells than exist — if T > available cells, all cells count as ready.
  const required = Math.min(numT, allShellLocs.length)
  const remaining = required - selected.length
  const ready = selected.length === required

  function handleCellClick(loc: [number, number]) {
    const key = locKey(loc[0], loc[1])
    setSelected(prev => {
      const existingIdx = prev.findIndex(([r, c]) => locKey(r, c) === key)
      if (existingIdx !== -1) return prev.filter((_, i) => i !== existingIdx)
      if (prev.length >= required) return prev
      return [...prev, loc]
    })
  }

  if (!targetFort) return null

  const selectedKeys = new Set(selected.map(([r, c]) => locKey(r, c)))
  const highlights = allShellLocs.filter(
    ([r, c]) => !selectedKeys.has(locKey(r, c)),
  )

  return (
    <AttackTargetDisplay
      view={view}
      leftFooter={
        active ? (
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
              onClick={() => onConfirm(selected)}
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
        highlights={active && !ready ? highlights : undefined}
        selectedGroup={active ? selected : undefined}
        onCellClick={active ? handleCellClick : undefined}
      />
    </AttackTargetDisplay>
  )
}

export default Wave2ShellPicker
