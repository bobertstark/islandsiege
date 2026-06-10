import React, { useState } from 'react'
import IGameState from 'common/IGameState'
import { DieValue } from 'common/die'
import { deriveAttackFlags } from 'common/cardEffects'

const DIE_OPTIONS: DieValue[] = ['W', 'B', 'G', 'L', 'T']

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevAttackPanel: React.FC<Props> = ({ fullState, updateDraft }) => {
  const [attackerIdx, setAttackerIdx] = useState(0)
  const [targetIdx, setTargetIdx] = useState(
    fullState.players.length > 1 ? 1 : 0,
  )
  const [fortId, setFortId] = useState(
    fullState.players[fullState.players.length > 1 ? 1 : 0]?.forts[0]?.id ?? '',
  )

  const current = fullState.attackRoll ?? []
  const [diceCount, setDiceCount] = useState(Math.max(current.length, 4))
  const dice: DieValue[] = Array.from(
    { length: diceCount },
    (_, i) => current[i] ?? 'B',
  )

  const targetPlayer = fullState.players[targetIdx]
  const forts = targetPlayer?.forts ?? []

  const patchAttack = (
    newAttackerIdx: number,
    newTargetIdx: number,
    newFortId: string,
  ) => {
    const targetForts = fullState.players[newTargetIdx]?.forts ?? []
    const attackFlags = deriveAttackFlags(targetForts, newFortId)
    updateDraft({
      currentPlayerIndex: newAttackerIdx,
      attackIsOpenWater: targetForts.length === 0,
      attackRoll: dice,
      attackRerollsRemaining:
        fullState.players[newAttackerIdx]?.diceRerolls ?? 2,
      shipLocations: {
        ...fullState.shipLocations,
        [newAttackerIdx]: {
          targetPlayerIndex: newTargetIdx,
          fortID: newFortId,
        },
      },
      attackFlags,
    })
  }

  const handleAttackerChange = (idx: number) => {
    setAttackerIdx(idx)
    patchAttack(idx, targetIdx, fortId)
  }

  const handleTargetChange = (idx: number) => {
    const newFortId = fullState.players[idx]?.forts[0]?.id ?? ''
    setTargetIdx(idx)
    setFortId(newFortId)
    patchAttack(attackerIdx, idx, newFortId)
  }

  const handleFortChange = (id: string) => {
    setFortId(id)
    patchAttack(attackerIdx, targetIdx, id)
  }

  const setDie = (idx: number, value: DieValue) => {
    const next = [...dice]
    next[idx] = value
    updateDraft({ attackRoll: next })
  }

  const handleCountChange = (n: number) => {
    const clamped = Math.max(0, Math.min(n, 8))
    setDiceCount(clamped)
    const next: DieValue[] = Array.from(
      { length: clamped },
      (_, i) => dice[i] ?? 'B',
    )
    updateDraft({ attackRoll: next.length > 0 ? next : undefined })
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>Attack Setup</strong>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginTop: 4,
        }}>
        <label>
          attacker{' '}
          <select
            value={attackerIdx}
            onChange={e => handleAttackerChange(parseInt(e.target.value))}>
            {fullState.players.map((p, i) => (
              <option key={p.id} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          target{' '}
          <select
            value={targetIdx}
            onChange={e => handleTargetChange(parseInt(e.target.value))}>
            {fullState.players.map((p, i) => (
              <option key={p.id} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {forts.length > 0 ? (
          <label>
            fort{' '}
            <select
              value={fortId}
              onChange={e => handleFortChange(e.target.value)}>
              {forts.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span style={{ opacity: 0.5, fontSize: 12 }}>
            target has no forts — will be open water
          </span>
        )}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 4,
          }}>
          <label>
            dice{' '}
            <input
              type="number"
              min={0}
              max={8}
              value={diceCount}
              style={{ width: 40 }}
              onChange={e => handleCountChange(parseInt(e.target.value) || 0)}
            />
          </label>
          <label>
            rerolls{' '}
            <input
              type="number"
              min={0}
              max={10}
              defaultValue={fullState.attackRerollsRemaining}
              style={{ width: 40 }}
              onChange={e =>
                updateDraft({
                  attackRerollsRemaining: parseInt(e.target.value) || 0,
                })
              }
            />
          </label>
        </div>
        {diceCount > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {dice.map((face, i) => (
              <select
                key={i}
                value={face}
                onChange={e => setDie(i, e.target.value as DieValue)}
                style={{ width: 50 }}>
                {DIE_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
