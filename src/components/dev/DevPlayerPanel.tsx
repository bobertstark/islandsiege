import React, { useState } from 'react'
import IGameState from 'common/IGameState'
import { ShellColor } from 'common/colors'
import {
  ALL_CARDS,
  createFortById,
  createBuildingById,
  createShipById,
} from 'common/cardRegistry'

const SHELL_COLORS: { color: ShellColor; symbol: string }[] = [
  { color: 'black', symbol: 'B' },
  { color: 'white', symbol: 'W' },
  { color: 'gray', symbol: 'G' },
]

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: '2px 8px',
  cursor: 'pointer',
  background: active ? '#4a4a7a' : 'transparent',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 3,
  fontFamily: 'monospace',
  fontSize: 12,
})

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevPlayerPanel: React.FC<Props> = ({ fullState, updateDraft }) => {
  const [playerIdx, setPlayerIdx] = useState(0)
  const [buildingFortIdx, setBuildingFortIdx] = useState(0)

  const safeIdx = Math.min(playerIdx, fullState.players.length - 1)
  const player = fullState.players[safeIdx]

  const updatePlayer = (patch: Partial<(typeof fullState.players)[0]>) => {
    updateDraft({
      players: fullState.players.map((p, i) =>
        i === safeIdx ? { ...p, ...patch } : p,
      ),
    })
  }

  const toggleHand = (cardId: string, checked: boolean) => {
    const nextIds = checked
      ? [...player.hand.map(c => c.id), cardId]
      : player.hand.map(c => c.id).filter(id => id !== cardId)
    const nextHand = nextIds
      .map(id => ALL_CARDS.find(c => c.id === id)!)
      .filter(Boolean)
    updatePlayer({ hand: nextHand })
  }

  const toggleTableau = (cardId: string, checked: boolean) => {
    const card = ALL_CARDS.find(c => c.id === cardId)
    if (!card) return
    const players = fullState.players.map((p, i) => {
      if (i !== safeIdx) return p
      if (card.type === 'fort') {
        return checked
          ? { ...p, forts: [...p.forts, createFortById(cardId)] }
          : { ...p, forts: p.forts.filter(f => f.id !== cardId) }
      }
      if (card.type === 'ship') {
        return checked
          ? { ...p, ships: [...p.ships, createShipById(cardId)] }
          : { ...p, ships: p.ships.filter(s => s.id !== cardId) }
      }
      if (checked) {
        const forts = p.forts.map((f, fi) =>
          fi === buildingFortIdx
            ? { ...f, buildings: [...f.buildings, createBuildingById(cardId)] }
            : f,
        )
        return { ...p, forts }
      } else {
        const forts = p.forts.map(f => ({
          ...f,
          buildings: f.buildings.filter(b => b.id !== cardId),
        }))
        return { ...p, forts }
      }
    })
    updateDraft({ players })
  }

  const setFortColonists = (fortIdx: number, count: number) => {
    const fort = player.forts[fortIdx]
    const clamped = Math.max(0, Math.min(count, fort.slots))
    const players = fullState.players.map((p, i) => {
      if (i !== safeIdx) return p
      const forts = p.forts.map((f, fi) =>
        fi === fortIdx
          ? { ...f, openSlots: f.slots - clamped, usedSlots: clamped }
          : f,
      )
      return { ...p, forts }
    })
    updateDraft({ players })
  }

  const handIds = new Set(player.hand.map(c => c.id))
  const tableauFortIds = new Set(player.forts.map(f => f.id))
  const tableauShipIds = new Set(player.ships.map(s => s.id))
  const tableauBuildingIds = new Set(
    player.forts.flatMap(f => f.buildings.map(b => b.id)),
  )

  const isTableauChecked = (cardId: string, type: string): boolean => {
    if (type === 'fort') return tableauFortIds.has(cardId)
    if (type === 'ship') return tableauShipIds.has(cardId)
    return tableauBuildingIds.has(cardId)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>Player Info</strong>
      <div style={{ marginTop: 4 }}>
        {/* Player tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
          {fullState.players.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPlayerIdx(i)}
              style={TAB_STYLE(safeIdx === i)}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Resources */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 8,
          }}>
          <label>
            colonists{' '}
            <input
              type="number"
              min={0}
              value={player.colonists}
              style={{ width: 40 }}
              onChange={e =>
                updatePlayer({ colonists: parseInt(e.target.value) || 0 })
              }
            />
          </label>
          <label>
            coins{' '}
            <input
              type="number"
              min={0}
              value={player.coins}
              style={{ width: 40 }}
              onChange={e =>
                updatePlayer({ coins: parseInt(e.target.value) || 0 })
              }
            />
          </label>
          <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ opacity: 0.5, fontSize: 11 }}>shells</span>
            {SHELL_COLORS.map(({ color, symbol }) => (
              <label key={color}>
                {symbol}{' '}
                <input
                  type="number"
                  min={0}
                  value={player.shells[color] ?? 0}
                  style={{ width: 35 }}
                  onChange={e =>
                    updatePlayer({
                      shells: {
                        ...player.shells,
                        [color]: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </label>
            ))}
          </span>
        </div>

        {/* Card list */}
        <div
          style={{
            maxHeight: 180,
            overflowY: 'auto',
            border: '1px solid #444',
            padding: '4px 6px',
          }}>
          {(['fort', 'building', 'ship'] as const).map(type => (
            <div key={type}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  marginBottom: 2,
                }}>
                <span
                  style={{
                    opacity: 0.5,
                    fontSize: 11,
                    textTransform: 'uppercase',
                  }}>
                  {type}
                </span>
                {type === 'building' && player.forts.length > 0 && (
                  <select
                    value={buildingFortIdx}
                    onChange={e => setBuildingFortIdx(parseInt(e.target.value))}
                    style={{ fontSize: 11, padding: '0 2px' }}>
                    {player.forts.map((f, i) => (
                      <option key={f.id} value={i}>
                        → {f.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {ALL_CARDS.filter(c => c.type === type).map(card => {
                const inHand = handIds.has(card.id)
                const inTableau = isTableauChecked(card.id, type)
                const fortEntry =
                  type === 'fort'
                    ? player.forts.find(f => f.id === card.id)
                    : undefined
                const fortEntryIdx =
                  fortEntry !== undefined
                    ? player.forts.findIndex(f => f.id === card.id)
                    : -1
                return (
                  <div
                    key={card.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 28px 28px 70px',
                      gap: 4,
                      alignItems: 'center',
                      padding: '1px 0',
                    }}>
                    <span
                      style={{
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                      {card.name}
                    </span>
                    <label
                      style={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}>
                      <input
                        type="checkbox"
                        checked={inHand}
                        onChange={e => toggleHand(card.id, e.target.checked)}
                      />
                      <span style={{ fontSize: 10, opacity: 0.6 }}>H</span>
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}>
                      <input
                        type="checkbox"
                        checked={inTableau}
                        onChange={e => toggleTableau(card.id, e.target.checked)}
                      />
                      <span style={{ fontSize: 10, opacity: 0.6 }}>T</span>
                    </label>
                    {type === 'fort' && inTableau && fortEntry && (
                      <label
                        style={{
                          display: 'flex',
                          gap: 2,
                          alignItems: 'center',
                        }}>
                        <input
                          type="number"
                          min={0}
                          max={fortEntry.slots}
                          value={fortEntry.usedSlots}
                          style={{ width: 36 }}
                          onChange={e =>
                            setFortColonists(
                              fortEntryIdx,
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                        <span style={{ fontSize: 10, opacity: 0.5 }}>
                          /{fortEntry.slots}
                        </span>
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
