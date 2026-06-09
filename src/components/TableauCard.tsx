import React from 'react'
import DescriptionText from 'components/DescriptionText'
import './styles.css'

interface TableauCardProps {
  title: string
  description: string
  // forts/buildings highlight as a group; ships individually
  highlighted?: boolean
  // full width, half height — buildings stacked beside their fort
  compact?: boolean
  // stretch to the row height (e.g. ships matching fort height)
  fill?: boolean
  // content rendered before the description (e.g. fort grid)
  above?: React.ReactNode
  // body after the description (pips, cost, …)
  children?: React.ReactNode
}

// Shared chrome for the in-play cards (Fort, Ship, Building): border/layout via
// .tableau-card, a title, the description block, then card-specific children.
const TableauCard: React.FC<TableauCardProps> = ({
  title,
  description,
  highlighted,
  compact,
  fill,
  above,
  children,
}) => {
  const cls = [
    'tableau-card',
    highlighted && 'highlighted',
    compact && 'compact',
    fill && 'fill',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
      <strong>{title}</strong>
      {above}
      <div className="tableau-card-description">
        <DescriptionText text={description} />
      </div>
      {children}
    </div>
  )
}

export default TableauCard
