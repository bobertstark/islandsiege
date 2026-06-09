import React from 'react'

interface BuildingIconProps {
  size?: number
}

const BuildingIcon: React.FC<BuildingIconProps> = ({ size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 56"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Building">
    {/* Chimneys */}
    <rect x="13" y="4" width="5" height="12" fill="#8b7355" />
    <rect x="42" y="4" width="5" height="12" fill="#8b7355" />
    {/* Roof */}
    <polygon points="5,22 30,8 55,22" fill="#7a6040" />
    {/* Main body */}
    <rect
      x="8"
      y="22"
      width="44"
      height="30"
      fill="#d4b896"
      stroke="#8b7355"
      strokeWidth="1"
    />
    {/* Ground line */}
    <line x1="4" y1="52" x2="56" y2="52" stroke="#666" strokeWidth="1.5" />
    {/* Upper-left window */}
    <rect
      x="12"
      y="27"
      width="9"
      height="10"
      fill="#a8d4f5"
      stroke="#555"
      strokeWidth="0.75"
    />
    <line x1="16.5" y1="27" x2="16.5" y2="37" stroke="#555" strokeWidth="0.5" />
    <line x1="12" y1="32" x2="21" y2="32" stroke="#555" strokeWidth="0.5" />
    {/* Upper-right window */}
    <rect
      x="39"
      y="27"
      width="9"
      height="10"
      fill="#a8d4f5"
      stroke="#555"
      strokeWidth="0.75"
    />
    <line x1="43.5" y1="27" x2="43.5" y2="37" stroke="#555" strokeWidth="0.5" />
    <line x1="39" y1="32" x2="48" y2="32" stroke="#555" strokeWidth="0.5" />
    {/* Lower-left window */}
    <rect
      x="12"
      y="39"
      width="9"
      height="11"
      fill="#a8d4f5"
      stroke="#555"
      strokeWidth="0.75"
    />
    <line x1="16.5" y1="39" x2="16.5" y2="50" stroke="#555" strokeWidth="0.5" />
    <line x1="12" y1="44.5" x2="21" y2="44.5" stroke="#555" strokeWidth="0.5" />
    {/* Lower-right window */}
    <rect
      x="39"
      y="39"
      width="9"
      height="11"
      fill="#a8d4f5"
      stroke="#555"
      strokeWidth="0.75"
    />
    <line x1="43.5" y1="39" x2="43.5" y2="50" stroke="#555" strokeWidth="0.5" />
    <line x1="39" y1="44.5" x2="48" y2="44.5" stroke="#555" strokeWidth="0.5" />
    {/* Central door with arch */}
    <path
      d="M25,39 Q30,34 35,39"
      fill="#6b4226"
      stroke="#4a2e1a"
      strokeWidth="1"
    />
    <rect
      x="25"
      y="39"
      width="10"
      height="13"
      fill="#6b4226"
      stroke="#4a2e1a"
      strokeWidth="1"
    />
    {/* Door knob */}
    <circle cx="33.5" cy="46" r="1" fill="#c8a800" />
    {/* Columns */}
    <line x1="17" y1="22" x2="17" y2="52" stroke="#b09070" strokeWidth="1.5" />
    <line x1="43" y1="22" x2="43" y2="52" stroke="#b09070" strokeWidth="1.5" />
  </svg>
)

export default BuildingIcon
