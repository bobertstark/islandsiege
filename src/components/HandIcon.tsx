import React from 'react'

interface HandIconProps {
  size?: number
}

const HandIcon: React.FC<HandIconProps> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Cards in hand">
    <rect
      x="3"
      y="8"
      width="5"
      height="9"
      rx="1.5"
      fill="#888"
      transform="rotate(-15 3 8)"
    />
    <rect x="7.5" y="6" width="5" height="9" rx="1.5" fill="#666" />
    <rect
      x="12"
      y="8"
      width="5"
      height="9"
      rx="1.5"
      fill="#888"
      transform="rotate(15 12 8)"
    />
  </svg>
)

export default HandIcon
