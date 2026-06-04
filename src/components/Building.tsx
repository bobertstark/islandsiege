import React from 'react'
import IBuilding from 'common/IBuilding'

interface BuildingProps {
  building: IBuilding
}

const Building: React.FC<BuildingProps> = ({ building }) => (
  <div
    style={{
      border: '1px solid #aaa',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    }}>
    <strong>{building.name}</strong>
    <div>Description: {building.description}</div>
    <div>Coins: {building.coins}</div>
    <div>Colonists: {building.colonists}</div>
    <div>Repair Color: {building.repairColor}</div>
  </div>
)

export default Building
