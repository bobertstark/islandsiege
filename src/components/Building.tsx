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
    <div>
      <DescriptionText text={building.description} />
    </div>
    <div>Coins: {building.coins}</div>
    {preview ? (
      <div>Cost: {building.cost} colonists</div>
    ) : (
      <div>Colonists: {building.colonists}</div>
    )}
    <div>Repair Color: {building.repairColor}</div>
  </div>
)

export default Building
