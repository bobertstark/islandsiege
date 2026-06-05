import React, { useState, useRef, useLayoutEffect } from 'react'
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
  const fortRef = useRef<HTMLDivElement>(null)
  const [buildingSize, setBuildingSize] = useState<{
    w: number
    h: number
  } | null>(null)

  useLayoutEffect(() => {
    if (fortRef.current) {
      const w = fortRef.current.offsetWidth / 2
      const h = fortRef.current.offsetHeight / 2
      setBuildingSize(prev =>
        prev?.w === w && prev?.h === h ? prev : { w, h },
      )
    }
  }, [fort.id])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
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
      <div ref={fortRef} style={{ flexShrink: 0 }}>
        <Fort fort={fort} highlighted={hovered} />
      </div>
      {buildings.length > 0 && buildingSize && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            maxHeight: buildingSize.h * 2,
            gap: 4,
          }}>
          {buildings.map(building => (
            <div
              key={building.id}
              style={{ width: buildingSize.w, flexShrink: 0 }}>
              <Building building={building} highlighted={hovered} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FortGroup
