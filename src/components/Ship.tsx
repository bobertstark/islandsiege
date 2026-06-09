import React from 'react'
import IShip from 'common/IShip'
import TableauCard from './TableauCard'
import Pips from './Pips'

interface ShipProps {
  ship: IShip
  preview?: boolean
  highlighted?: boolean
  fill?: boolean
  // owning player's color — tints the colonist meeples
  color?: string
}

const Ship: React.FC<ShipProps> = ({
  ship,
  preview,
  highlighted,
  fill,
  color,
}) => (
  <TableauCard
    title={ship.name}
    description={ship.description}
    highlighted={highlighted}
    fill={fill}>
    {preview ? (
      <div className="tableau-card-cost">Cost: {ship.cost} colonists</div>
    ) : (
      <Pips count={ship.colonists} color={color} />
    )}
  </TableauCard>
)

export default Ship
