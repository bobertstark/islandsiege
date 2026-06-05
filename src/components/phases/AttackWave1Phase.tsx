import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor, colorToSymbol } from 'common/colors'
import { shellInfo, traverseConnectedShells } from 'common/fortGrid'
import type { FortGridCell } from 'common/fortGrid'
import { TurnBanner } from 'components/TurnBanner'
import GameBoard from 'components/GameBoard'
import { FortGrid } from 'components/FortGrid'
import { DiceBankDisplay } from 'components/DiceBankDisplay'

const WAVE_COLORS: Array<{ symbol: 'B' | 'W' | 'G'; color: ShellColor }> = [
  { symbol: 'B', color: 'black' },
  { symbol: 'W', color: 'white' },
  { symbol: 'G', color: 'gray' },
]

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
        <div style={{ marginTop: 8 }}>
          <p style={{ color: '#c0392b', fontStyle: 'italic', marginBottom: 8 }}>
            Nothing can be destroyed with this color.
          </p>
          <button
            onClick={() =>
              dispatch({
                type: 'attackWave1',
                payload: { attackColor: colorToSymbol(selectedColor!) },
              })
            }
            style={{
              padding: '8px 20px',
              background: '#7f8c8d',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15,
            }}>
            Confirm (spend dice, no attack)
          </button>
        </div>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}
