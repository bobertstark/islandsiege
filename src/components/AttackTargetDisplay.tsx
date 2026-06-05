import React from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor } from 'common/colors'
import Fort from './Fort'
import { DiceBankDisplay } from './DiceBankDisplay'

interface AttackTargetDisplayProps {
  view: IGameStateView
  // optional children replace the default <Fort> (e.g. interactive Fort for wave phases)
  children?: React.ReactNode
  // forwarded to DiceBankDisplay for phases that need color selection (Wave1)
  selectedColor?: ShellColor | null
  onDiceColorSelect?: (color: ShellColor) => void
}

const AttackTargetDisplay: React.FC<AttackTargetDisplayProps> = ({
  view,
  children,
  selectedColor,
  onDiceColorSelect,
}) => {
  const shipLoc = view.shipLocations[view.currentPlayerIndex]
  const targetPlayer =
    shipLoc?.targetPlayerIndex !== undefined
      ? view.players[shipLoc.targetPlayerIndex]
      : undefined
  const targetFort = targetPlayer?.forts.find(f => f.id === shipLoc?.fortID)

  if (!targetFort && !view.attackIsOpenWater) return null

  return (
    <div style={{ padding: '8px 20px' }}>
      <DiceBankDisplay
        bank={view.diceBank}
        selectedColor={selectedColor}
        onSelect={onDiceColorSelect}
      />
      <p style={{ margin: '6px 0' }}>
        Attacking{' '}
        <strong style={{ color: targetPlayer?.color }}>
          {targetPlayer?.name ?? 'Open Waters'}
        </strong>
      </p>
      {targetFort && (children ?? <Fort fort={targetFort} />)}
    </div>
  )
}

// Hook for phases that need direct access to the resolved fort/player
export function useAttackTarget(view: IGameStateView) {
  const shipLoc = view.shipLocations[view.currentPlayerIndex]
  const targetPlayer =
    shipLoc?.targetPlayerIndex !== undefined
      ? view.players[shipLoc.targetPlayerIndex]
      : undefined
  const targetFort = targetPlayer?.forts.find(f => f.id === shipLoc?.fortID)
  return { targetPlayer, targetFort }
}

export default AttackTargetDisplay
