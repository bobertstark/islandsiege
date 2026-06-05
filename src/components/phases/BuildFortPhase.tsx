import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import { createFortGrid } from 'common/fortGrid'
import type { FortGridSpec } from 'common/fortGrid'
import { ShellColor, ShellColors, colorToSymbol } from 'common/colors'
import FortGrid from 'components/FortGrid'

interface BuildFortPhaseProps {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

type ShellAssignment = Record<string, ShellColor> // key: "row,col"

const SHELL_COLORS: ShellColor[] = ['black', 'white', 'gray']

function nextColor(
  current: ShellColor | undefined,
  reserve: Partial<Record<ShellColor, number>>,
): ShellColor | null {
  const available = SHELL_COLORS.filter(c => (reserve[c] ?? 0) > 0)
  if (available.length === 0) return null
  if (current === undefined) return available[0]
  const idx = available.indexOf(current)
  return idx === -1 || idx === available.length - 1 ? null : available[idx + 1]
}

function summaryText(
  assignments: ShellAssignment,
  coinsEarned: number,
): string {
  const counts: Partial<Record<ShellColor, number>> = {}
  for (const color of Object.values(assignments)) {
    counts[color] = (counts[color] ?? 0) + 1
  }
  const parts = (Object.entries(counts) as [ShellColor, number][]).map(
    ([color, n]) => `-${n} ${colorToSymbol(color)}`,
  )
  parts.push(`+${coinsEarned} coins`)
  return parts.join(', ')
}

export const BuildFortPhase: React.FC<BuildFortPhaseProps> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const player = view.players[view.currentPlayerIndex]
  const hand = Array.isArray(player?.hand) ? player.hand : []
  const fortCards = hand.filter(c => c.type === 'fort')

  const preselected = view.pendingBuildCardID
    ? (fortCards.find(c => c.id === view.pendingBuildCardID) ?? null)
    : null

  const [selectedCard] = useState<ICard | null>(preselected)
  const [assignments, setAssignments] = useState<ShellAssignment>({})

  function currentReserve(): Partial<Record<ShellColor, number>> {
    const reserve = { ...(player?.shells ?? {}) }
    for (const color of Object.values(assignments)) {
      reserve[color] = (reserve[color] ?? 0) - 1
    }
    return reserve
  }

  function handleUndo() {
    setAssignments({})
  }

  function handleCellClick(loc: [number, number]) {
    if (!selectedCard?.gridSpec) return
    const key = `${loc[0]},${loc[1]}`
    const current = assignments[key]

    const reserveWithoutThis = { ...(player?.shells ?? {}) }
    for (const [k, color] of Object.entries(assignments)) {
      if (k !== key) {
        reserveWithoutThis[color as ShellColor] =
          (reserveWithoutThis[color as ShellColor] ?? 0) - 1
      }
    }

    const next = nextColor(current, reserveWithoutThis)
    setAssignments(prev => {
      const next2 = { ...prev }
      if (next === null) {
        delete next2[key]
      } else {
        next2[key] = next
      }
      return next2
    })
  }

  function handleConfirm() {
    if (!selectedCard?.gridSpec) return
    const fortGridSpec: FortGridSpec = Object.entries(assignments).map(
      ([key, color]) => {
        const [r, c] = key.split(',').map(Number)
        return [r, c, colorToSymbol(color)]
      },
    )
    dispatch({
      type: 'buildFort',
      payload: { fortID: selectedCard.id, fortGridSpec },
    })
  }

  function previewGrid() {
    if (!selectedCard?.gridSpec) return null
    const grid = createFortGrid(selectedCard.gridSpec)
    for (const [key, color] of Object.entries(assignments)) {
      const [r, c] = key.split(',').map(Number)
      const cell = grid[r]?.[c]
      if (cell?.type === 'shell') {
        cell.color = color
      }
    }
    return grid
  }

  function blankCells(): [number, number][] {
    if (!selectedCard?.gridSpec) return []
    return selectedCard.gridSpec
      .filter(([, , val]) => val === '.')
      .map(([r, c]) => [r, c] as [number, number])
  }

  const grid = selectedCard ? previewGrid() : null
  const blanks = selectedCard ? blankCells() : []
  const reserve = currentReserve()
  const hasShells = SHELL_COLORS.some(c => (reserve[c] ?? 0) > 0)
  const coinsEarned = Object.keys(assignments).length

  const highlights: [number, number][] = blanks.filter(([r, c]) => {
    const key = `${r},${c}`
    return assignments[key] !== undefined || hasShells
  })

  if (!isMyTurn || !selectedCard || !grid) return null

  return (
    <div style={{ padding: '16px 20px' }}>
      <h2>
        Place shells on <strong>{selectedCard.name}</strong>
      </h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        Click a highlighted cell to assign a shell from your reserve. Click
        again to cycle or remove.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
          margin: '16px 0',
        }}>
        <FortGrid
          grid={grid}
          view="tableau"
          showLabels
          highlights={highlights}
          onCellClick={handleCellClick}
        />
        <div>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>
            Your shell reserve:
          </p>
          {SHELL_COLORS.map(color => (
            <div key={color} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  background: ShellColors[color],
                  border: '1px solid #ccc',
                  marginRight: 6,
                  verticalAlign: 'middle',
                }}
              />
              {color}: {reserve[color] ?? 0}
            </div>
          ))}
        </div>
      </div>
      {coinsEarned > 0 && (
        <p style={{ fontWeight: 600 }}>
          {summaryText(assignments, coinsEarned)}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleConfirm}>Confirm</button>
        {coinsEarned > 0 && <button onClick={handleUndo}>Undo</button>}
      </div>
    </div>
  )
}
