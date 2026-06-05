import React from 'react'
import type ICard from 'common/ICard'
import { createFortGrid } from 'common/fortGrid'
import FortGrid from 'components/FortGrid'
import DescriptionText from 'components/DescriptionText'
import './shared.css'

interface CardProps {
  card: ICard
  selected?: boolean
  onClick?: (cardID: string) => void
}

// TODO: Color coordinate card types for easier visual digest
const Card: React.FC<CardProps> = ({ card, selected, onClick }) => {
  const fortGrid = card.gridSpec ? createFortGrid(card.gridSpec) : undefined

  return (
    <div
      className={`card${selected ? ' selected' : ''}`}
      onClick={() => onClick?.(card.id)}>
      <div className="card-title">{card.name}</div>
      <div className="card-type">{card.type}</div>
      {fortGrid && (
        <div
          style={{
            margin: '8px 0',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <FortGrid grid={fortGrid} view="hand" showLabels />
        </div>
      )}
      {typeof card.slots === 'number' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            margin: '6px 0',
          }}>
          {Array.from({ length: card.slots }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #888',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          ))}
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
      <div className="card-description">
        <DescriptionText text={card.description} />
      </div>
    </div>
  )
}

export default Card
