import React from 'react'
import Card from './Card'
import ICard from 'common/ICard'
import './shared.css'

interface HandProps {
  cards: ICard[]
  onCardSelect?: (cardID: string) => void
  selectedCardID?: string
}

const Hand: React.FC<HandProps> = ({ cards, onCardSelect, selectedCardID }) => (
  <div className="hand">
    {cards.map(card => (
      <Card
        key={card.id}
        card={card}
        selected={selectedCardID === card.id}
        onClick={onCardSelect}
      />
    ))}
  </div>
)

export default Hand
