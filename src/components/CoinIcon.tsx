import React from 'react'

interface CoinIconProps {
  size?: number
}

const CoinIcon: React.FC<CoinIconProps> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Coin">
    <circle
      cx="10"
      cy="10"
      r="9"
      fill="#f1c40f"
      stroke="#d4a017"
      strokeWidth="1.5"
    />
    <text
      x="10"
      y="14"
      textAnchor="middle"
      fontSize="10"
      fontWeight="bold"
      fill="#7a5c00">
      $
    </text>
  </svg>
)

export default CoinIcon
