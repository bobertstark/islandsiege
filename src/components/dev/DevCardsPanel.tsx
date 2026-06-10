import React, { useState } from 'react'
import IGameState from 'common/IGameState'
import {
  ALL_CARDS,
  createFortById,
  createBuildingById,
  createShipById,
} from 'common/cardRegistry'

type Mode = 'hand' | 'tableau'

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevCardsPanel: React.FC<Props> = ({ fullState, updateDraft }) => {
  const [mode, setMode] = useState<Mode>('hand')
  const [playerIdx, setPlayerIdx] = useState(0)
  const [buildingFortIdx, setBuildingFortIdx] = useState(0)

  const player = fullState.players[playerIdx]
  const handIds = new Set(player.hand.map(c => c.id))
  const tableauFortIds = new Set(player.forts.map(f => f.id))
  const tableauShipIds = new Set(player.ships.map(s => s.id))
  const tableauBuildingIds = new Set(
    player.forts.flatMap(f => f.buildings.map(b => b.id)),
  )

  const toggleHand = (cardId: string, checked: boolean) => {
    const nextIds = checked
      ? [...player.hand.map(c => c.id), cardId]
      : player.hand.map(c => c.id).filter(id => id !== cardId)
    const nextHand = nextIds
      .map(id => ALL_CARDS.find(c => c.id === id)!)
      .filter(Boolean)
    updateDraft({
      players: fullState.players.map((p, i) =>
        i === playerIdx ? { ...p, hand: nextHand } : p,
      ),
    })
  }

  const toggleTableau = (cardId: string, checked: boolean) => {
    const card = ALL_CARDS.find(c => c.id === cardId)
    if (!card) return
    const players = fullState.players.map((p, i) => {
      if (i !== playerIdx) return p
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
      // building: add to selected fort, remove from whichever fort holds it
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

  const isTableauChecked = (cardId: string, type: string) => {
    if (type === 'fort') return tableauFortIds.has(cardId)
    if (type === 'ship') return tableauShipIds.has(cardId)
    return tableauBuildingIds.has(cardId)
  }

  const toggle = mode === 'hand' ? toggleHand : toggleTableau
  const isChecked =
    mode === 'hand'
      ? (id: string, _type: string) => handIds.has(id)
      : isTableauChecked

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 6,
        }}>
        <strong>Cards</strong>
        <div
          style={{
            display: 'flex',
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid #555',
          }}>
          {(['hand', 'tableau'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '2px 8px',
                cursor: 'pointer',
                background: mode === m ? '#4a4a7a' : 'transparent',
                color: '#eee',
                border: 'none',
                fontFamily: 'monospace',
                fontSize: 12,
              }}>
              {m === 'hand' ? 'Hand' : 'Tableau'}
            </button>
          ))}
        </div>
      </div>

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

      <div
        style={{
          maxHeight: 150,
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
              }}>
              <span
                style={{
                  opacity: 0.5,
                  fontSize: 11,
                  textTransform: 'uppercase',
                }}>
                {type}
              </span>
              {type === 'building' &&
                mode === 'tableau' &&
                player.forts.length > 0 && (
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
            {ALL_CARDS.filter(c => c.type === type).map(card => (
              <label
                key={card.id}
                style={{ display: 'block', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isChecked(card.id, type)}
                  onChange={e => toggle(card.id, e.target.checked)}
                />{' '}
                {card.name}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
