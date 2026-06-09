import React from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor } from 'common/colors'
import { DieValue } from 'common/die'
import Fort from './Fort'
import Ship from './Ship'
import { DiceBankDisplay } from './DiceBankDisplay'
import AttackLayout from './AttackLayout'

interface AttackTargetDisplayProps {
  view: IGameStateView
  // optional children replace the default <Fort> (e.g. interactive Fort for wave phases)
  children?: React.ReactNode
  selectedColor?: ShellColor | null
  onDieClick?: (face: DieValue) => void
  leftFooter?: React.ReactNode
}

interface DiceBankPanelProps {
  bank: IGameStateView['diceBank']
  selectedColor?: ShellColor | null
  onDieClick?: (face: DieValue) => void
  style?: React.CSSProperties
}

export const DiceBankPanel: React.FC<DiceBankPanelProps> = ({
  bank,
  selectedColor,
  onDieClick,
  style,
}) => {
  const hasAnyDice = Object.values(bank).some(v => v > 0)
  return (
    <div
      style={{
        background: '#f5f0e8',
        borderRadius: 8,
        padding: '10px 14px',
        ...style,
      }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          color: '#7a6a50',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
        Dice Bank
      </div>
      {hasAnyDice ? (
        <DiceBankDisplay
          bank={bank}
          selectedColor={selectedColor}
          onDieClick={onDieClick}
        />
      ) : (
        <span style={{ fontSize: 12, color: '#9a8a70', fontStyle: 'italic' }}>
          No dice yet
        </span>
      )}
    </div>
  )
}

const AttackTargetDisplay: React.FC<AttackTargetDisplayProps> = ({
  view,
  children,
  selectedColor,
  onDieClick,
  leftFooter,
}) => {
  const shipLoc = view.shipLocations[view.currentPlayerIndex]
  const targetPlayer =
    shipLoc?.targetPlayerIndex !== undefined
      ? view.players[shipLoc.targetPlayerIndex]
      : undefined
  const targetFort = targetPlayer?.forts.find(f => f.id === shipLoc?.fortID)

  if (!targetFort && !view.attackIsOpenWater) return null

  return (
    <AttackLayout
      left={
        <>
          <DiceBankPanel
            bank={view.diceBank}
            selectedColor={selectedColor}
            onDieClick={onDieClick}
          />
          {leftFooter}
        </>
      }
      right={
        <>
          <p style={{ margin: '0 0 6px' }}>
            Attacking{' '}
            <strong style={{ color: targetPlayer?.color }}>
              {targetPlayer?.name ?? 'Open Waters'}
            </strong>
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {targetFort && (children ?? <Fort fort={targetFort} />)}
            {targetPlayer?.ships.map(ship => (
              <Ship key={ship.id} ship={ship} color={targetPlayer.color} fill />
            ))}
          </div>
        </>
      }
    />
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
