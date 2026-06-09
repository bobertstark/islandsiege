import React, { useState } from 'react'
import IFort from 'common/IFort'
import IBuilding from 'common/IBuilding'
import Fort from './Fort'
import Building from './Building'
import PlayerShip from './PlayerShip'

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
      <div style={{ flexShrink: 0 }}>
        <Fort fort={fort} highlighted={hovered} color={color} />
      </div>
      {/* the column stretches to the fort's height; each building takes an even
          share capped at half, so two split the height and a lone building
          stays half-height — no fort growth or measurement needed */}
      {buildings.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
          {buildings.map(building => (
            <div
              key={building.id}
              style={{ flex: 1, minHeight: 0, maxHeight: '50%' }}>
              <Building
                building={building}
                highlighted={hovered}
                compact
                color={color}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FortGroup
