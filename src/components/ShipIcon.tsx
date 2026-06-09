import React from 'react'

interface ShipIconProps {
  size?: number
}

const ShipIcon: React.FC<ShipIconProps> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 56"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ship">
    {/* Pirate flag */}
    <polygon points="29,2 41,6 29,10" fill="#111" />
    {/* Mast */}
    <rect x="28" y="2" width="2" height="34" fill="#7a4f2e" />
    {/* Yard arm */}
    <rect x="14" y="10" width="32" height="1.5" fill="#7a4f2e" />
    {/* Main sail */}
    <path
      d="M15,12 Q30,14 45,12 L43,34 Q30,36 17,34 Z"
      fill="#f0e6cc"
      stroke="#c8ae80"
      strokeWidth="1"
    />
    {/* Sail rope lines */}
    <line x1="18" y1="20" x2="42" y2="20" stroke="#c8ae80" strokeWidth="0.5" />
    <line x1="18" y1="27" x2="42" y2="27" stroke="#c8ae80" strokeWidth="0.5" />
    {/* Deck rail */}
    <rect x="8" y="36" width="44" height="3" rx="1" fill="#8b5e3c" />
    {/* Hull */}
    <path d="M8,39 L52,39 L48,52 Q30,56 12,52 Z" fill="#8b4513" />
    {/* Cannon ports */}
    <circle cx="18" cy="44" r="2" fill="#2a1a0a" />
    <circle cx="30" cy="45" r="2" fill="#2a1a0a" />
    <circle cx="42" cy="44" r="2" fill="#2a1a0a" />
    {/* Water */}
    <path
      d="M4,52 Q14,49 22,52 Q30,55 38,52 Q46,49 56,52"
      stroke="#5b9bd5"
      strokeWidth="2"
      fill="none"
    />
  </svg>
)

export default ShipIcon
