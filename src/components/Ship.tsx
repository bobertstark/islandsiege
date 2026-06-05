import React from 'react'
import IShip from 'common/IShip'
import DescriptionText from 'components/DescriptionText'

interface ShipProps {
  ship: IShip
  preview?: boolean
}

const Ship: React.FC<ShipProps> = ({ ship, preview }) => (
  <div
    style={{
      border: '1px solid #55a',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    }}>
    <strong>{ship.name}</strong>
    <div style={{ fontSize: 13, color: '#555', margin: '4px 0' }}>
      <DescriptionText text={ship.description} />
    </div>
    {preview ? (
      <div style={{ fontSize: 13 }}>Cost: {ship.cost} colonists</div>
    ) : (
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {Array.from({ length: ship.colonists }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '2px solid #888',
              background: '#f1c40f',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    )}
  </div>
)

export default Ship
