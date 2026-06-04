import React from 'react'

type ActionChoice =
  | 'draw'
  | 'buildFort'
  | 'buildBuilding'
  | 'buildShip'
  | 'attack'

interface ActionSelectorProps {
  onSelect: (action: ActionChoice) => void
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ onSelect }) => (
  <div style={{ margin: '24px 0' }}>
    <h2>Choose your action:</h2>
    <button onClick={() => onSelect('draw')}>Draw</button>
    <button onClick={() => onSelect('buildFort')}>Build Fort</button>
    <button onClick={() => onSelect('buildBuilding')}>Build Building</button>
    <button onClick={() => onSelect('buildShip')}>Build Ship</button>
    <button onClick={() => onSelect('attack')}>Attack</button>
  </div>
)

export default ActionSelector
