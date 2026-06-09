import React from 'react'
import IBuilding from 'common/IBuilding'
import TableauCard from './TableauCard'
import Pips from './Pips'

interface BuildingProps {
  building: IBuilding
  preview?: boolean
  highlighted?: boolean
  // full width, half height — stacked beside its fort
  compact?: boolean
  // owning player's color — tints the colonist meeples
  color?: string
}

const Building: React.FC<BuildingProps> = ({
  building,
  preview,
  highlighted,
  compact,
  color,
}) => (
  <TableauCard
    title={building.name}
    description={building.description}
    highlighted={highlighted}
    compact={compact}>
    {preview ? (
      <div className="tableau-card-cost">Cost: {building.cost} colonists</div>
    ) : (
      <Pips count={building.colonists} color={color} />
    )}
  </TableauCard>
)

export default Building
