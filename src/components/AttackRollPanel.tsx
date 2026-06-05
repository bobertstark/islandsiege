import React, { useState } from 'react'
import { DieValue, DIE_STYLE } from 'common/die'

interface AttackRollPanelProps {
  dice: DieValue[]
  rerollsRemaining: number
  dispatch: (action: { type: string; payload?: unknown }) => void
  readonly?: boolean
}

const DIE_LABEL: Record<DieValue, string> = {
  W: 'White',
  B: 'Black',
  G: 'Gray',
  L: 'Leadership',
  T: 'Target',
}

const AttackRollPanel: React.FC<AttackRollPanelProps> = ({
  dice,
  rerollsRemaining,
  dispatch,
  readonly = false,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())

  function toggleDie(idx: number) {
    if (readonly) return
    setSelectedIndices(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function handleReroll() {
    dispatch({
      type: 'attackRoll',
      payload: {
        action: 'reroll',
        diceIndicesReroll: [...selectedIndices],
      },
    })
    setSelectedIndices(new Set())
  }

  function handleConfirm() {
    dispatch({ type: 'attackRoll', payload: { action: 'keep' } })
  }

  const canReroll = rerollsRemaining > 0 && selectedIndices.size > 0

  return (
    <div style={{ padding: '16px 20px' }}>
      {!readonly && <p>Rerolls remaining: {rerollsRemaining}</p>}
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
        {dice.map((face, idx) => {
          const s = DIE_STYLE[face]
          const selected = !readonly && selectedIndices.has(idx)
          return (
            <div
              key={idx}
              onClick={() => toggleDie(idx)}
              title={DIE_LABEL[face]}
              style={{
                width: 48,
                height: 48,
                fontWeight: 'bold',
                fontSize: 18,
                cursor: readonly ? 'default' : 'pointer',
                border: selected ? '3px solid #e74c3c' : '2px solid #555',
                borderRadius: 8,
                background: s.bg,
                color: s.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                outline: selected ? '2px solid #e74c3c' : 'none',
                outlineOffset: 2,
                userSelect: 'none',
              }}>
              {face}
            </div>
          )
        })}
      </div>
      {!readonly && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleReroll} disabled={!canReroll}>
            Reroll
          </button>
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}
    </div>
  )
}

export default AttackRollPanel
