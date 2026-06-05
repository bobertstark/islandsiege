import React from 'react'
import IBuilding from 'common/IBuilding'
import DescriptionText from 'components/DescriptionText'

interface BuildingProps {
  building: IBuilding
  preview?: boolean
}

const Building: React.FC<BuildingProps> = ({ building, preview }) => (
  <div
    style={{
      border: '1px solid #aaa',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    }}>
    <strong>{building.name}</strong>
    <div style={{ fontSize: 13, color: '#555', margin: '4px 0' }}>
      <DescriptionText text={building.description} />
    </div>
    {preview ? (
      <div style={{ fontSize: 13 }}>Cost: {building.cost} colonists</div>
    ) : (
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {Array.from({ length: building.colonists }).map((_, i) => (
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

export default Building
