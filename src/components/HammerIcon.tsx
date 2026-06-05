// Hammer icon from Lucide (https://lucide.dev) — MIT License
import React from 'react'

interface HammerIconProps {
  size?: number
  color?: string
}

const HammerIcon: React.FC<HammerIconProps> = ({
  size = 20,
  color = '#7f5a2e',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Repair">
    <path
      d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"
      stroke="#7f5a2e"
      fill="#7f5a2e"
    />
    <path d="m18 15 4-4" stroke="#95a5a6" fill="#95a5a6" />
    <path
      d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"
      stroke="#95a5a6"
      fill="#95a5a6"
    />
  </svg>
)

export default HammerIcon
