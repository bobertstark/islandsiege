import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor, colorToSymbol, symbolToColor } from 'common/colors'
import { DieValue } from 'common/die'
import { shellInfo, traverseConnectedShells } from 'common/fortGrid'
import type { FortGridCell } from 'common/fortGrid'
import Fort from 'components/Fort'
import ActionInstructions from 'components/ActionInstructions'
import AttackTargetDisplay, {
  useAttackTarget,
} from 'components/AttackTargetDisplay'

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
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const AttackWave1Phase: React.FC<Props> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const [selectedColor, setSelectedColor] = useState<ShellColor | null>(null)
  const [pendingLoc, setPendingLoc] = useState<[number, number] | null>(null)

  const { targetFort } = useAttackTarget(view)

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

  const instructions = !isMyTurn
    ? 'Watching the attacker choose which shells to destroy.'
    : !selectedColor
      ? 'Select a colored attack die to use.'
      : pendingLoc
        ? 'Confirm to destroy the selected shells (outlined in red), or cancel.'
        : noEligible
          ? 'No shells can be destroyed with this die — confirm to spend it anyway.'
          : 'Select a shell group on the fort to destroy.'

  return (
    <>
      <ActionInstructions
        title="First Wave Attack"
        description={instructions}
      />
      <AttackTargetDisplay
        view={view}
        selectedColor={selectedColor}
        onDieClick={
          isMyTurn
            ? (face: DieValue) => {
                if (face === 'B' || face === 'W' || face === 'G')
                  handleColorSelect(symbolToColor(face))
              }
            : undefined
        }
        leftFooter={
          isMyTurn && pendingLoc ? (
            <button
              onClick={handleConfirm}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '8px 0',
                background: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 14,
              }}>
              Confirm Attack
            </button>
          ) : undefined
        }>
        {targetFort && (
          <Fort
            fort={targetFort}
            highlights={isMyTurn ? highlights : undefined}
            dims={isMyTurn ? dims : undefined}
            selectedGroup={isMyTurn ? pendingGroup : undefined}
            onCellClick={isMyTurn ? handleCellClick : undefined}
          />
        )}
      </AttackTargetDisplay>
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
    </>
  )
}
