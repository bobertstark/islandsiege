import React from 'react'

interface PlayerShipProps {
  color?: string
  size?: number
}

const PlayerShip: React.FC<PlayerShipProps> = ({
  color = '#555',
  size = 32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ship">
    <rect x="8" y="16" width="16" height="6" rx="3" fill={color} />
    <polygon points="16,4 20,16 12,16" fill={color} />
    <rect x="14" y="10" width="4" height="6" fill={color} />
  </svg>
)

export default PlayerShip
