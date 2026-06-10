import React from 'react'
import IBuilding from 'common/IBuilding'
import TableauCard from './TableauCard'
import Pips from './Pips'
import BuildingIcon from './BuildingIcon'

interface BuildingProps {
  building: IBuilding
  preview?: boolean
  highlighted?: boolean
  compact?: boolean
  fill?: boolean
  // owning player's color — tints the colonist meeples
  color?: string
}

const Building: React.FC<BuildingProps> = ({
  building,
  preview,
  highlighted,
  compact,
  fill,
  color,
}) => (
  <TableauCard
    title={building.name}
    description={building.description}
    highlighted={highlighted}
    compact={compact}
    fill={fill}
    above={<BuildingIcon width={80} />}>
    {preview ? (
      <div className="tableau-card-cost">Cost: {building.cost} colonists</div>
    ) : (
      <Pips count={building.colonists} color={color} />
    )}
  </TableauCard>
)

export default Building
