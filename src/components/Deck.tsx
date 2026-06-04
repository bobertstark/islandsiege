import React from 'react'
import './shared.css'

interface DeckProps {
  count: number
  onDraw?: () => void
}

export const Deck: React.FC<DeckProps> = ({ count, onDraw }) => (
  <div
    onClick={onDraw}
    className={`deck deck-main${onDraw ? ' clickable' : ''}`}>
    <div>Deck</div>
    <div className="deck-count">{count}</div>
  </div>
)

interface DiscardProps {
  count: number
}

export const Discard: React.FC<DiscardProps> = ({ count }) => (
  <div className="deck deck-discard">
    <div>Discard</div>
    <div className="deck-count">{count}</div>
  </div>
)
