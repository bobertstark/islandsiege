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
}

const FortGroup: React.FC<FortGroupProps> = ({
  fort,
  buildings,
  attackingShips,
}) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        padding: 6,
        borderRadius: 8,
        border: hovered ? '1px solid #aac' : '1px solid transparent',
        background: hovered ? '#f0f4ff' : 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
      <Fort fort={fort} />
      {buildings.map(building => (
        <Building key={building.id} building={building} />
      ))}
      {attackingShips.map((ship, i) => (
        <div
          key={i}
          title={`${ship.attackerName}'s ship`}
          style={{ display: 'flex', alignItems: 'center' }}>
          <PlayerShip color={ship.color} size={28} />
        </div>
      ))}
    </div>
  )
}

export default FortGroup
