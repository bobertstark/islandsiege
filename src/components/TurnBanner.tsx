import React from 'react'
import { ALL_CARDS } from 'common/cardRegistry'

interface BuildContext {
  cardID: string
  fortID?: string
}

export interface WaitingForPlayer {
  name: string
  color?: string
}

interface TurnBannerProps {
  phase: string
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  buildContext?: BuildContext
  logOpen: boolean
  onToggleLog: () => void
}

function buildLabel(ctx: BuildContext, phase: string): string {
  const cardName = ALL_CARDS.find(c => c.id === ctx.cardID)?.name ?? ctx.cardID
  if (!ctx.fortID) return `Build ${cardName}`
  const fortName = ALL_CARDS.find(c => c.id === ctx.fortID)?.name ?? ctx.fortID
  const prep = phase === 'buildShip' ? 'from' : 'on'
  return `Build ${cardName} ${prep} ${fortName}`
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  phase,
  isMyTurn,
  waitingFor,
  buildContext,
  logOpen,
  onToggleLog,
}) => {
  const phaseLabel = buildContext ? buildLabel(buildContext, phase) : phase

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
