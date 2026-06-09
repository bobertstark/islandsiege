import React from 'react'

export interface WaitingForPlayer {
  name: string
  color?: string
}

interface TurnBannerProps {
  phase: string
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  logOpen: boolean
  onToggleLog: () => void
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  phase,
  isMyTurn,
  waitingFor,
  logOpen,
  onToggleLog,
}) => {
  const phaseLabel = phase

  return (
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
        {isMyTurn ? (
          'Your turn'
        ) : (
          <>
            Waiting for{' '}
            {waitingFor.map((p, i) => (
              <React.Fragment key={p.name}>
                {i > 0 && ', '}
                <span style={{ color: p.color }}>{p.name}</span>
              </React.Fragment>
            ))}
          </>
        )}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#666', fontWeight: 400, fontSize: 13 }}>
          Phase: {phaseLabel}
        </span>
        <button
          onClick={onToggleLog}
          style={{
            fontSize: 12,
            padding: '2px 10px',
            border: '1px solid #bbb',
            borderRadius: 4,
            background: logOpen ? '#e0e0e0' : '#fff',
            cursor: 'pointer',
          }}>
          {logOpen ? 'Hide Log' : 'Log'}
        </button>
      </div>
    </div>
  )
}
