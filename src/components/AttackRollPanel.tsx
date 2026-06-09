import React, { useEffect, useState } from 'react'
import { DieValue } from 'common/die'
import Die from './Die'

interface AttackRollPanelProps {
  dice: DieValue[]
  rerollsRemaining: number
  dispatch: (action: { type: string; payload?: unknown }) => void
  readonly?: boolean
}

const AttackRollPanel: React.FC<AttackRollPanelProps> = ({
  dice,
  rerollsRemaining,
  dispatch,
  readonly = false,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [dieKeys, setDieKeys] = useState<number[]>(() => dice.map(() => 0))

  useEffect(() => {
    setDieKeys(dice.map(() => 0))
  }, [dice.length])

  function toggleDie(idx: number) {
    if (readonly) return
    setSelectedIndices(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function handleReroll() {
    setDieKeys(prev => prev.map((k, i) => (selectedIndices.has(i) ? k + 1 : k)))
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
  const allSelected = dice.length > 0 && selectedIndices.size === dice.length

  function toggleSelectAll() {
    setSelectedIndices(allSelected ? new Set() : new Set(dice.map((_, i) => i)))
  }

  return (
    <div style={{ padding: '16px 20px' }}>
      {!readonly && (
        <>
          <span style={{ fontSize: 13, color: '#555' }}>
            Rerolls remaining: {rerollsRemaining}
          </span>
          <button
            onClick={toggleSelectAll}
            style={{
              display: 'block',
              marginTop: 4,
              marginBottom: 8,
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid #bbb',
              background: '#fff',
              cursor: 'pointer',
              fontSize: 11,
            }}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </>
      )}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          margin: '0 0 12px',
        }}>
        {dice.map((face, idx) => (
          <Die
            key={`${idx}-${dieKeys[idx] ?? 0}`}
            face={face}
            selected={!readonly && selectedIndices.has(idx)}
            onClick={readonly ? undefined : () => toggleDie(idx)}
            readonly={readonly}
          />
        ))}
      </div>
      {!readonly && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleReroll}
            disabled={!canReroll}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid #bbb',
              background: canReroll ? '#fff' : '#f0f0f0',
              color: canReroll ? '#000' : '#aaa',
              cursor: canReroll ? 'pointer' : 'not-allowed',
              fontSize: 13,
            }}>
            Reroll Selected
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 20px',
              borderRadius: 6,
              border: 'none',
              background: '#27ae60',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}>
            Confirm
          </button>
        </div>
      )}
    </div>
  )
}

export default AttackRollPanel
