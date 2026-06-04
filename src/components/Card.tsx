import React from 'react'
import type ICard from 'common/ICard'
import './shared.css'

interface CardProps {
  card: ICard
  selected?: boolean
  onClick?: (cardID: string) => void
}

// TODO: Color coordinate card types for easier visual digest
const Card: React.FC<CardProps> = ({ card, selected, onClick }) => (
  <div
    className={`card${selected ? ' selected' : ''}`}
    onClick={() => onClick?.(card.id)}>
    <div className="card-title">{card.name}</div>
    <div className="card-type">{card.type}</div>
    {card.gridSpec && (
      <div className="card-grid">
        <strong>Grid:</strong> {JSON.stringify(card.gridSpec)}
      </div>
    )}
    {typeof card.slots === 'number' && (
      <div>
        <strong>Slots:</strong> {card.slots}
      </div>
    )}
    {typeof card.cost === 'number' && (
      <div className="card-cost">
        <strong>Cost:</strong> {card.cost}
      </div>
    )}
    {typeof card.coins === 'number' && (
      <div>
        <strong>Coins:</strong> {card.coins}
      </div>
    )}
    <div className="card-description">{card.description}</div>
  </div>
)

export default Card
