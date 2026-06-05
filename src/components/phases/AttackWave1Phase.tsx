import React, { useEffect, useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor, colorToSymbol } from 'common/colors'
import { shellInfo, traverseConnectedShells } from 'common/fortGrid'
import type { FortGridCell } from 'common/fortGrid'
import { rollCounts } from 'common/attackRoll'
import { DieValue } from 'common/die'
import { TurnBanner } from 'components/TurnBanner'
import GameBoard from 'components/GameBoard'
import { FortGrid } from 'components/FortGrid'

const WAVE_COLORS: Array<{ symbol: 'B' | 'W' | 'G'; color: ShellColor }> = [
  { symbol: 'B', color: 'black' },
  { symbol: 'W', color: 'white' },
  { symbol: 'G', color: 'gray' },
]

const DIE_STYLE: Record<DieValue, { bg: string; text: string }> = {
  B: { bg: '#222222', text: '#ffffff' },
  W: { bg: '#eeeeee', text: '#222222' },
  G: { bg: '#888888', text: '#ffffff' },
  L: { bg: '#e8d44d', text: '#222222' },
  T: { bg: '#e74c3c', text: '#ffffff' },
}

const WAVE_DIE_COLORS = new Set<DieValue>(['B', 'W', 'G'])

function DiceBankDisplay({
  bank,
  selectedColor,
  onSelect,
}: {
  bank: rollCounts
  selectedColor: ShellColor | null
  onSelect?: (color: ShellColor) => void
}) {
  const entries = (Object.entries(bank) as [DieValue, number][]).filter(
    ([, count]) => count > 0,
  )
  if (entries.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
      {entries.map(([face, count]) => {
        const s = DIE_STYLE[face]
        const isSelectable = onSelect && WAVE_DIE_COLORS.has(face)
        const color = WAVE_COLORS.find(c => c.symbol === face)?.color ?? null
        const isSelected = color !== null && selectedColor === color
        return (
          <div
            key={face}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              onClick={
                isSelectable && color ? () => onSelect(color) : undefined
              }
              style={{
                width: 32,
                height: 32,
                background: s.bg,
                color: s.text,
                border: isSelected ? '3px solid #2980b9' : '2px solid #555',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: isSelectable ? 'pointer' : 'default',
                boxShadow: isSelected ? '0 0 0 2px #2980b9' : 'none',
              }}>
              {face}
            </div>
            <span style={{ fontSize: 14, fontWeight: 'bold' }}>×{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function eligibleForColor(
  grid: FortGridCell[][],
  color: ShellColor,
  count: number,
): [number, number][] {
  return shellInfo(grid)
    .filter(
      s => s.color === color && !s.protectBonus && s.connectStrength <= count,
    )
    .map(s => s.loc)
}

function ineligibleForColor(
  grid: FortGridCell[][],
  color: ShellColor,
  count: number,
): [number, number][] {
  return shellInfo(grid)
    .filter(
      s => s.color === color && (s.protectBonus || s.connectStrength > count),
    )
    .map(s => s.loc)
}

interface Props {
  view: IGameStateView
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const AttackWave1Phase: React.FC<Props> = ({
  view,
  isMyTurn,
  waitingFor,
  dispatch,
}) => {
  const [selectedColor, setSelectedColor] = useState<ShellColor | null>(null)
  const [pendingLoc, setPendingLoc] = useState<[number, number] | null>(null)

  const shipLoc = view.shipLocations[view.currentPlayerIndex]
  const targetPlayer =
    shipLoc?.targetPlayerIndex !== undefined
      ? view.players[shipLoc.targetPlayerIndex]
      : undefined
  const targetFort = targetPlayer?.forts.find(f => f.id === shipLoc?.fortID)

  const diceCount = selectedColor
    ? (view.diceBank[colorToSymbol(selectedColor) as 'B' | 'W' | 'G'] ?? 0)
    : 0

  const highlights =
    selectedColor && targetFort
      ? eligibleForColor(targetFort.grid, selectedColor, diceCount)
      : []

  const dims =
    selectedColor && targetFort
      ? ineligibleForColor(targetFort.grid, selectedColor, diceCount)
      : []

  const noEligible = selectedColor !== null && highlights.length === 0

  const pendingGroup =
    pendingLoc && targetFort
      ? traverseConnectedShells(targetFort.grid, pendingLoc)
      : []

  // dispatch is stable (useCallback in useGameSocket), safe to omit from deps
  useEffect(() => {
    if (!isMyTurn || !noEligible || !selectedColor) return
    const timer = setTimeout(() => {
      dispatch({
        type: 'attackWave1',
        payload: { attackColor: colorToSymbol(selectedColor) },
      })
    }, 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, noEligible, selectedColor])

  function handleColorSelect(color: ShellColor) {
    setSelectedColor(color)
    setPendingLoc(null)
  }

  function handleCellClick(loc: [number, number]) {
    setPendingLoc(loc)
  }

  function handleConfirm() {
    if (!selectedColor || !pendingLoc) return
    dispatch({
      type: 'attackWave1',
      payload: {
        attackColor: colorToSymbol(selectedColor),
        attackLoc: pendingLoc,
      },
    })
  }

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      <div style={{ padding: '8px 0' }}>
        <strong>Attack dice:</strong>
        <DiceBankDisplay
          bank={view.diceBank}
          selectedColor={selectedColor}
          onSelect={isMyTurn ? handleColorSelect : undefined}
        />
      </div>
      {targetFort && (
        <div style={{ margin: '16px 0' }}>
          <p style={{ marginBottom: 8 }}>
            <strong>{targetPlayer?.name}</strong> — {targetFort.name}
          </p>
          <FortGrid
            grid={targetFort.grid}
            view="tableau"
            showLabels
            highlights={isMyTurn ? highlights : undefined}
            dims={isMyTurn ? dims : undefined}
            selectedGroup={isMyTurn ? pendingGroup : undefined}
            onCellClick={isMyTurn ? handleCellClick : undefined}
          />
          {isMyTurn && pendingLoc && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '8px 20px',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: 15,
                }}>
                Confirm Attack
              </button>
              <button
                onClick={() => setPendingLoc(null)}
                style={{
                  marginLeft: 10,
                  padding: '8px 14px',
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      {isMyTurn && noEligible && (
        <p style={{ color: '#c0392b', fontStyle: 'italic' }}>
          Nothing can be destroyed — advancing…
        </p>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}
