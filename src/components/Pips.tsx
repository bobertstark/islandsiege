import React from 'react'
import MeepleIcon from './MeepleIcon'
import './styles.css'

interface PipsProps {
  count: number
  // number of filled pips; defaults to all filled. When given, the unfilled
  // pips render as empty slots with Occupied/Empty titles (fort slots).
  filled?: number
  // colonist (meeple) color — the owning player's color
  color?: string
}

// Colonist pips shared by Fort (slots), Ship and Building (cost). Filled pips
// show a colonist meeple over the slot; unfilled pips are empty slot outlines.
const Pips: React.FC<PipsProps> = ({ count, filled, color }) => {
  const filledCount = filled ?? count
  const labeled = filled !== undefined

  return (
    <div className="tableau-card-pips">
      {Array.from({ length: count }).map((_, i) => {
        const isFilled = i < filledCount
        return (
          <div
            key={i}
            className={`tableau-card-pip${isFilled ? ' filled' : ''}`}
            title={labeled ? (isFilled ? 'Occupied' : 'Empty') : undefined}>
            {isFilled && <MeepleIcon size={14} color={color} />}
          </div>
        )
      })}
    </div>
  )
}

export default Pips
