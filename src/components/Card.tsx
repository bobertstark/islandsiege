import React from 'react'
import { Card as CardType, FortCard, BuildingCard, ShipCard } from 'game/Card'
import './shared.css'

interface CardProps {
  card: CardType
  selected?: boolean
  onClick?: (cardID: string) => void
}

const Card: React.FC<CardProps> = ({ card, selected, onClick }) => (
  <div
    className={`card${selected ? ' selected' : ''}`}
    onClick={() => onClick?.(card.id)}>
    <div className="card-title">{card.name}</div>
    <div className="card-type">{card.type}</div>
    {card.type === 'fort' && (
      <>
        <div className="card-grid">
          <strong>Grid:</strong>{' '}
          {Array.isArray((card as FortCard).gridSpec)
            ? JSON.stringify((card as FortCard).gridSpec)
            : 'N/A'}
        </div>
        <div>
          <strong>Slots:</strong> {(card as FortCard).slots}
        </div>
      </>
    )}
    {(card.type === 'ship' || card.type === 'building') && (
      <div className="card-cost">
        <strong>Cost:</strong> {(card as ShipCard | BuildingCard).cost}
      </div>
    )}
    <div className="card-description">{(card as any).description}</div>
  </div>
)

export default Card
