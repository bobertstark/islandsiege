import React from 'react'

interface TurnBannerProps {
  phase: string
  isMyTurn: boolean
  waitingFor: string[]
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  phase,
  isMyTurn,
  waitingFor,
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 16px',
      background: isMyTurn ? '#e8f5e9' : '#f5f5f5',
      borderBottom: '1px solid #ddd',
      fontWeight: 600,
    }}>
    <span>
      {isMyTurn ? 'Your turn' : `Waiting for ${waitingFor.join(', ')}`}
    </span>
    <span style={{ color: '#666', fontWeight: 400, fontSize: 13 }}>
      Phase: {phase}
    </span>
  </div>
)
