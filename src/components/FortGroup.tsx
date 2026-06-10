import React, { useState } from 'react'
import IFort from 'common/IFort'
import IBuilding from 'common/IBuilding'
import Fort from './Fort'
import Building from './Building'
import PlayerShip from './PlayerShip'
import CardInfoPopover from './CardInfoPopover'
import { fortTooltip, buildingTooltip } from './cardTooltip'

interface AttackingShip {
  color?: string
  attackerName: string
}

interface FortGroupProps {
  fort: IFort
  buildings: IBuilding[]
  attackingShips: AttackingShip[]
  // owning player's color — tints the colonist meeples
  color?: string
}

const FortGroup: React.FC<FortGroupProps> = ({
  fort,
  buildings,
  attackingShips,
  color,
}) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 6,
        padding: 6,
      }}>
      {/* attacking ships overlay the fort's top-left corner so they stay tied
          to it without consuming layout space and shifting the fort sideways */}
      {attackingShips.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: -2,
            left: -2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 1,
          }}>
          {attackingShips.map((ship, i) => (
            <div key={i} title={`${ship.attackerName}'s ship`}>
              <PlayerShip color={ship.color} size={28} />
            </div>
          ))}
        </div>
      )}
      {/* the fort defines the group height */}
      <CardInfoPopover info={fortTooltip(fort)} style={{ flexShrink: 0 }}>
        <Fort fort={fort} highlighted={hovered} color={color} />
      </CardInfoPopover>
      {buildings.map(building => (
        <CardInfoPopover
          key={building.id}
          info={buildingTooltip(building)}
          style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <Building
            building={building}
            highlighted={hovered}
            fill
            color={color}
          />
        </CardInfoPopover>
      ))}
    </div>
  )
}

export default FortGroup
