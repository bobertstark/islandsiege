import React, { useState, useEffect } from 'react'
import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'
import { DieValue } from 'common/die'
import { deriveAttackFlags } from 'common/cardEffects'

const ALL_PHASES: Phase[] = [
  'lobby',
  'initDraw',
  'victory',
  'colonize',
  'action',
  'draw',
  'drawPick',
  'buildFort',
  'buildBuilding',
  'buildShip',
  'attackRoll',
  'attackLeadership',
  'attackWave1',
  'attackReinforceOrWave2',
  'attackReinforce',
  'attackWave2',
  'attackDestroy',
  'endTurn',
  'gameOver',
]

const DIE_OPTIONS: DieValue[] = ['W', 'B', 'G', 'L', 'T']

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevPhasePanel: React.FC<Props> = ({ fullState, updateDraft }) => {
  const firstOtherPlayer = (attackerIdx: number) =>
    fullState.players.findIndex((_, i) => i !== attackerIdx)

  const defaultDefender = firstOtherPlayer(fullState.currentPlayerIndex)
  const [defenderIdx, setDefenderIdx] = useState(
    defaultDefender >= 0 ? defaultDefender : 0,
  )
  const [fortId, setFortId] = useState(
    fullState.players[defaultDefender >= 0 ? defaultDefender : 0]?.forts[0]
      ?.id ?? '',
  )
  const [dice, setDice] = useState<DieValue[]>(
    () =>
      (fullState.attackRoll as DieValue[] | undefined) ??
      (Array(3).fill('B') as DieValue[]),
  )
  const [rerolls, setRerolls] = useState(fullState.attackRerollsRemaining || 2)

  useEffect(() => {
    const next =
      (fullState.attackRoll as DieValue[] | undefined) ??
      (Array(3).fill('B') as DieValue[])
    setDice(prev =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullState.attackRoll])

  useEffect(() => {
    setRerolls(r => {
      const next = fullState.attackRerollsRemaining || 2
      return r === next ? r : next
    })
  }, [fullState.attackRerollsRemaining])

  // If the active player changes to match the current defender, pick a new defender.
  useEffect(() => {
    if (defenderIdx === fullState.currentPlayerIndex) {
      const next = firstOtherPlayer(fullState.currentPlayerIndex)
      if (next >= 0) {
        const newFortId = fullState.players[next]?.forts[0]?.id ?? ''
        setDefenderIdx(next)
        setFortId(newFortId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullState.currentPlayerIndex])

  const isAttackPhase = fullState.phase.startsWith('attack')

  // When the phase first enters an attack phase, push the local panel state
  // (defender, fort, dice, rerolls) into the draft so shipLocations and
  // attackIsOpenWater are correct even if the user hasn't touched the dropdowns.
  useEffect(() => {
    if (isAttackPhase) {
      patchAttack(defenderIdx, fortId, dice, rerolls)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAttackPhase])

  const patchAttack = (
    newDefenderIdx: number,
    newFortId: string,
    newDice: DieValue[],
    newRerolls: number,
  ) => {
    const targetForts = fullState.players[newDefenderIdx]?.forts ?? []
    const attackFlags = deriveAttackFlags(targetForts, newFortId)
    updateDraft({
      attackIsOpenWater: targetForts.length === 0,
      attackRoll: newDice,
      attackRerollsRemaining: newRerolls,
      shipLocations: {
        ...fullState.shipLocations,
        [fullState.currentPlayerIndex]: {
          targetPlayerIndex: newDefenderIdx,
          fortID: newFortId,
        },
      },
      attackFlags,
    })
  }

  const handleDefenderChange = (idx: number) => {
    const newFortId = fullState.players[idx]?.forts[0]?.id ?? ''
    setDefenderIdx(idx)
    setFortId(newFortId)
    patchAttack(idx, newFortId, dice, rerolls)
  }

  const handleFortChange = (id: string) => {
    setFortId(id)
    patchAttack(defenderIdx, id, dice, rerolls)
  }

  const handleDiceCountChange = (n: number) => {
    const clamped = Math.max(0, Math.min(n, 8))
    const next: DieValue[] = Array.from(
      { length: clamped },
      (_, i) => dice[i] ?? 'B',
    )
    setDice(next)
    patchAttack(defenderIdx, fortId, next, rerolls)
  }

  const handleDieChange = (idx: number, value: DieValue) => {
    const next = [...dice]
    next[idx] = value
    setDice(next)
    updateDraft({ attackRoll: next })
  }

  const handleRerollsChange = (n: number) => {
    setRerolls(n)
    updateDraft({ attackRerollsRemaining: n })
  }

  const forts = fullState.players[defenderIdx]?.forts ?? []

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>Phase</strong>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        <label>
          phase{' '}
          <select
            value={fullState.phase}
            onChange={e => updateDraft({ phase: e.target.value as Phase })}>
            {ALL_PHASES.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div
          style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
          <span style={{ opacity: 0.6, fontSize: 11 }}>active player</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {fullState.players.map((p, i) => (
              <button
                key={p.id}
                onClick={() => updateDraft({ currentPlayerIndex: i })}
                style={{
                  padding: '2px 8px',
                  cursor: 'pointer',
                  background:
                    fullState.currentPlayerIndex === i
                      ? '#4a4a7a'
                      : 'transparent',
                  color: '#eee',
                  border: '1px solid #555',
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}>
                {p.name}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              updateDraft({
                shipLocations: {
                  ...fullState.shipLocations,
                  [fullState.currentPlayerIndex]: {},
                },
              })
            }
            style={{
              padding: '1px 6px',
              cursor: 'pointer',
              background: 'transparent',
              color: '#f88',
              border: '1px solid #844',
              borderRadius: 3,
              fontFamily: 'monospace',
              fontSize: 11,
            }}>
            reset ship loc
          </button>
        </div>
      </div>
      {isAttackPhase && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 8,
            borderLeft: '2px solid #444',
          }}>
          <span style={{ opacity: 0.6, fontSize: 11, marginBottom: 4 }}>
            attack
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label>
              defender{' '}
              <select
                value={defenderIdx}
                onChange={e => handleDefenderChange(parseInt(e.target.value))}>
                {fullState.players
                  .filter((_, i) => i !== fullState.currentPlayerIndex)
                  .map((p, _, arr) => {
                    const i = fullState.players.indexOf(p)
                    return (
                      <option key={p.id} value={i}>
                        {p.name}
                      </option>
                    )
                  })}
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
                no forts — open water
              </span>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label>
                dice{' '}
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={dice.length}
                  style={{ width: 40 }}
                  onChange={e =>
                    handleDiceCountChange(parseInt(e.target.value) || 0)
                  }
                />
              </label>
              <label>
                rerolls{' '}
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={rerolls}
                  style={{ width: 40 }}
                  onChange={e =>
                    handleRerollsChange(parseInt(e.target.value) || 0)
                  }
                />
              </label>
            </div>
            {dice.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {dice.map((face, i) => (
                  <select
                    key={i}
                    value={face}
                    onChange={e =>
                      handleDieChange(i, e.target.value as DieValue)
                    }
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
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ opacity: 0.6, fontSize: 11 }}>bank</span>
              {DIE_OPTIONS.map(face => (
                <label
                  key={face}
                  style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <span style={{ fontSize: 11 }}>{face}</span>
                  <input
                    type="number"
                    min={0}
                    value={fullState.diceBank[face] ?? 0}
                    style={{ width: 32 }}
                    onChange={e =>
                      updateDraft({
                        diceBank: {
                          ...fullState.diceBank,
                          [face]: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
