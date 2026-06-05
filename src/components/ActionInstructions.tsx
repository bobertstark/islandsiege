import React from 'react'

interface ActionInstructionsProps {
  title: string
  description?: string
}

const ActionInstructions: React.FC<ActionInstructionsProps> = ({
  title,
  description,
}) => (
  <div style={{ marginBottom: 12 }}>
    <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>{title}</h3>
    {description && (
      <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{description}</p>
    )}
  </div>
)

export default ActionInstructions
