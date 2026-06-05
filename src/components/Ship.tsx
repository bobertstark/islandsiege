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
    <div>
      <DescriptionText text={ship.description} />
    </div>
    <div>Coins: {ship.coins}</div>
    {preview ? (
      <div>Cost: {ship.cost} colonists</div>
    ) : (
      <div>Colonists: {ship.colonists}</div>
    )}
  </div>
)

export default Ship
