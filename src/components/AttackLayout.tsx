import React from 'react'

interface AttackLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  children?: React.ReactNode
}

// Two-column wrapper shared across all attack phases.
// left: dice panel (roll panel or dice bank)
// right: target fort (rendered as a tableau card)
// children: action controls rendered below the columns
const AttackLayout: React.FC<AttackLayoutProps> = ({
  left,
  right,
  children,
}) => (
  <div>
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ minWidth: 180 }}>{left}</div>
      <div style={{ flex: 1 }}>{right}</div>
    </div>
    {children && <div style={{ marginTop: 12 }}>{children}</div>}
  </div>
)

export default AttackLayout
