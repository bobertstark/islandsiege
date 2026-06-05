import React from 'react'
import { ALL_CARDS } from 'common/cardRegistry'

interface BuildContext {
  cardID: string
  fortID?: string
}

interface TurnBannerProps {
  phase: string
  isMyTurn: boolean
  waitingFor: string[]
  buildContext?: BuildContext
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
        {isMyTurn ? 'Your turn' : `Waiting for ${waitingFor.join(', ')}`}
      </span>
      <span style={{ color: '#666', fontWeight: 400, fontSize: 13 }}>
        Phase: {phaseLabel}
      </span>
    </div>
  )
}
