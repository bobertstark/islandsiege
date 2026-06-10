import React, { useState } from 'react'
import IGameState from 'common/IGameState'

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevTableauPanel: React.FC<Props> = ({
  fullState,
  updateDraft,
}) => {
  const [playerIdx, setPlayerIdx] = useState(0)

  const player = fullState.players[playerIdx]

  const setFortColonists = (fortIdx: number, count: number) => {
    const fort = player.forts[fortIdx]
    const clamped = Math.max(0, Math.min(count, fort.slots))
    const players = fullState.players.map((p, i) => {
      if (i !== playerIdx) return p
      const forts = p.forts.map((f, fi) =>
        fi === fortIdx
          ? { ...f, openSlots: f.slots - clamped, usedSlots: clamped }
          : f,
      )
      return { ...p, forts }
    })
    updateDraft({ players })
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>Tableau</strong>
      <div style={{ marginTop: 4 }}>
        <select
          value={playerIdx}
          onChange={e => setPlayerIdx(parseInt(e.target.value))}
          style={{ marginBottom: 6 }}>
          {fullState.players.map((p, i) => (
            <option key={p.id} value={i}>
              {p.name}
            </option>
          ))}
        </select>
        {player.forts.length === 0 && (
          <div style={{ opacity: 0.5, fontSize: 12 }}>no forts</div>
        )}
        {player.forts.map((fort, fi) => (
          <div key={fort.id}>
            <label>
              {fort.name} colonists (max {fort.slots}){' '}
              <input
                type="number"
                min={0}
                max={fort.slots}
                defaultValue={fort.usedSlots}
                style={{ width: 50 }}
                onChange={e =>
                  setFortColonists(fi, parseInt(e.target.value) || 0)
                }
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
