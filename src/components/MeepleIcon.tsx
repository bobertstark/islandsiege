import React from 'react'

interface MeepleIconProps {
  color?: string
  size?: number
}

const MeepleIcon: React.FC<MeepleIconProps> = ({
  color = '#555',
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Colonist">
    {/* head */}
    <circle cx="10" cy="3.5" r="2.8" />
    {/* body: shoulders, arms with rounded tips, waist, split legs */}
    <path d="M10,5.8 L6,7.5 Q2,7.9 2.5,10.4 Q3,12.5 6,11.6 L6,11.6 L5,19.2 L9,19.2 L10,15 L11,19.2 L15,19.2 L14,11.6 L14,11.6 Q17,12.5 17.5,10.4 Q18,7.9 14,7.5 Z" />
  </svg>
)

export default MeepleIcon
