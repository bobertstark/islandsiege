import React, { useEffect, useState } from 'react'
import { DieValue } from 'common/die'
import Die from './Die'

interface AttackRollPanelProps {
  dice: DieValue[]
  rerollsRemaining: number
  dispatch: (action: { type: string; payload?: unknown }) => void
  readonly?: boolean
  banRerollFaces?: DieValue[]
}

const AttackRollPanel: React.FC<AttackRollPanelProps> = ({
  dice,
  rerollsRemaining,
  dispatch,
  readonly = false,
  banRerollFaces = [],
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [dieKeys, setDieKeys] = useState<number[]>(() => dice.map(() => 0))

  useEffect(() => {
    setDieKeys(dice.map(() => 0))
  }, [dice.length])

  function toggleDie(idx: number) {
    if (readonly) return
    if (banRerollFaces.includes(dice[idx])) return
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
  const selectableIndices = dice
    .map((face, i) => i)
    .filter(i => !banRerollFaces.includes(dice[i]))
  const allSelected =
    selectableIndices.length > 0 &&
    selectableIndices.every(i => selectedIndices.has(i))

  function toggleSelectAll() {
    setSelectedIndices(allSelected ? new Set() : new Set(selectableIndices))
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
        {dice.map((face, idx) => {
          const isBanned = !readonly && banRerollFaces.includes(face)
          const die = (
            <Die
              key={`${idx}-${dieKeys[idx] ?? 0}`}
              face={face}
              selected={!readonly && selectedIndices.has(idx)}
              onClick={readonly || isBanned ? undefined : () => toggleDie(idx)}
              readonly={readonly || isBanned}
            />
          )
          if (!isBanned) return die
          return (
            <div
              key={`${idx}-${dieKeys[idx] ?? 0}`}
              style={{ position: 'relative', display: 'inline-flex' }}>
              <div style={{ opacity: 0.4, pointerEvents: 'none' }}>{die}</div>
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  fontSize: 10,
                  lineHeight: 1,
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  borderRadius: '0 6px 0 4px',
                  padding: '1px 3px',
                }}>
                🔒
              </span>
            </div>
          )
        })}
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
            Finalize
          </button>
        </div>
      )}
    </div>
  )
}

export default AttackRollPanel
