import React from 'react'
import IFort from 'common/IFort'
import FortGrid from './FortGrid'
import TableauCard from './TableauCard'
import Pips from './Pips'

interface FortProps {
  fort: IFort
  // highlighted by an enclosing group (e.g. hover) — fort and its buildings light up together
  highlighted?: boolean
  // owning player's color — tints the colonist meeples
  color?: string
  // interactive grid props — when provided the grid becomes clickable (e.g. wave phases)
  highlights?: [number, number][]
  dims?: [number, number][]
  selectedGroup?: [number, number][]
  onCellClick?: (loc: [number, number]) => void
}

const Fort: React.FC<FortProps> = ({
  fort,
  highlighted,
  color,
  highlights,
  dims,
  selectedGroup,
  onCellClick,
}) => (
  <TableauCard
    title={fort.name}
    description={fort.description}
    highlighted={highlighted}
    above={
      <div className="tableau-card-grid">
        <FortGrid
          grid={fort.grid}
          view="tableau"
          showLabels
          highlights={highlights}
          dims={dims}
          selectedGroup={selectedGroup}
          onCellClick={onCellClick}
        />
      </div>
    }>
    <Pips count={fort.slots} filled={fort.usedSlots} color={color} />
  </TableauCard>
)

export default Fort
