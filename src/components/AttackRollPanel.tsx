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

  return (
    <div style={{ padding: '16px 20px' }}>
      {!readonly && <p>Rerolls remaining: {rerollsRemaining}</p>}
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
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
