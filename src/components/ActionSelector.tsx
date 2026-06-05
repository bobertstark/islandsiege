import React, { useState } from 'react'
import type { IPlayerView } from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import {
  createFortById,
  createBuildingById,
  createShipById,
} from 'common/cardRegistry'
import Fort from 'components/Fort'
import Building from 'components/Building'
import Ship from 'components/Ship'

interface ActionSelectorProps {
  player: IPlayerView
  onSelect: (action: string, cardID?: string) => void
}

function buildableBuildings(hand: ICard[], forts: IFort[]): ICard[] {
  return hand.filter(
    c =>
      c.type === 'building' &&
      c.cost !== undefined &&
      forts.some(f => f.usedSlots >= c.cost!),
  )
}

function buildableShips(hand: ICard[], forts: IFort[]): ICard[] {
  return hand.filter(
    c =>
      c.type === 'ship' &&
      c.cost !== undefined &&
      forts.some(f => f.usedSlots >= c.cost!),
  )
}

const ActionSelector: React.FC<ActionSelectorProps> = ({
  player,
  onSelect,
}) => {
  const [showFortPicker, setShowFortPicker] = useState(false)
  const [showBuildingPicker, setShowBuildingPicker] = useState(false)
  const [showShipPicker, setShowShipPicker] = useState(false)

  const hand = Array.isArray(player.hand) ? player.hand : []
  const forts = player.forts

  const fortCards = hand.filter(c => c.type === 'fort')
  const buildingCards = buildableBuildings(hand, forts)
  const shipCards = buildableShips(hand, forts)

  function pick(action: string, cardID: string) {
    setShowFortPicker(false)
    setShowBuildingPicker(false)
    setShowShipPicker(false)
    onSelect(action, cardID)
  }

  return (
    <div style={{ margin: '24px 0' }}>
      <h2>Choose your action:</h2>
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => onSelect('attack')}>Attack</button>
        <button onClick={() => onSelect('draw')}>Draw</button>
        {fortCards.length > 0 && (
          <button onClick={() => setShowFortPicker(v => !v)}>
            Build Fort{showFortPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {buildingCards.length > 0 && (
          <button onClick={() => setShowBuildingPicker(v => !v)}>
            Build Building{showBuildingPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {shipCards.length > 0 && (
          <button onClick={() => setShowShipPicker(v => !v)}>
            Build Ship{showShipPicker ? ' ▲' : ' ▼'}
          </button>
        )}
      </div>

      {showFortPicker && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {fortCards.map(card => (
            <div
              key={card.id}
              onClick={() => pick('buildFort', card.id)}
              style={{ cursor: 'pointer' }}>
              <Fort fort={createFortById(card.id)} />
            </div>
          ))}
        </div>
      )}

      {showBuildingPicker && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {buildingCards.map(card => (
            <div
              key={card.id}
              onClick={() => pick('buildBuilding', card.id)}
              style={{ cursor: 'pointer' }}>
              <Building building={createBuildingById(card.id)} preview />
            </div>
          ))}
        </div>
      )}

      {showShipPicker && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {shipCards.map(card => (
            <div
              key={card.id}
              onClick={() => pick('buildShip', card.id)}
              style={{ cursor: 'pointer' }}>
              <Ship ship={createShipById(card.id)} preview />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActionSelector
