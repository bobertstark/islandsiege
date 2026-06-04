import React from 'react'
import IShip from 'common/IShip'

interface ShipProps {
  ship: IShip
}

const Ship: React.FC<ShipProps> = ({ ship }) => (
  <div
    style={{
      border: '1px solid #55a',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
    }}>
    <strong>{ship.name}</strong>
    <div>Description: {ship.description}</div>
    <div>Coins: {ship.coins}</div>
    <div>Colonists: {ship.colonists}</div>
  </div>
)

export default Ship
