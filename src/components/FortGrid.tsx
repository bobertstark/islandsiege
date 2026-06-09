import React from 'react'
import type { FortGridCell } from 'common/fortGrid'
import { ShellColors } from '../common/colors'
import './styles.css'

function getCellLabel(cell: FortGridCell) {
  if (cell.type === 'shell' && cell.color) return cell.color[0].toUpperCase()
  return ''
}

function getLabelTextColor(cell: FortGridCell): string {
  if (
    cell.type === 'shell' &&
    (cell.color === 'black' || cell.color === 'gray')
  )
    return '#fff'
  return '#222'
}

function locKey(r: number, c: number) {
  return `${r},${c}`
}

export const FortGrid: React.FC<{
  grid: FortGridCell[][]
  view: 'hand' | 'tableau'
  showLabels?: boolean
  highlights?: [number, number][]
  dims?: [number, number][]
  selectedGroup?: [number, number][]
  onCellClick?: (loc: [number, number]) => void
}> = ({
  grid,
  view,
  showLabels,
  highlights,
  dims,
  selectedGroup,
  onCellClick,
}) => {
  const highlightSet = new Set(highlights?.map(([r, c]) => locKey(r, c)))
  const dimSet = new Set(dims?.map(([r, c]) => locKey(r, c)))
  const selectedSet = new Set(selectedGroup?.map(([r, c]) => locKey(r, c)))

  return (
    <div className="fort-grid">
      <div
        className="fort-grid-inner"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 24px)`,
        }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = locKey(rowIndex, colIndex)
            const isHighlight = highlightSet.has(key)
            const isDim = dimSet.has(key)
            const isClickable = isHighlight && !!onCellClick

            let bgColor = '#99bed8'
            let border = '3px solid #99bed8'
            if (cell.type === 'shell') {
              if (view === 'hand') {
                bgColor = cell.color ? ShellColors[cell.color] : '#f5e6c8'
              } else if (view === 'tableau') {
                bgColor = cell.color ? ShellColors[cell.color] : '#f5e6c8'
              }
              border = `3px solid ${cell.color ? ShellColors[cell.color] : '#f5e6c8'}`
            }

            if (isHighlight) border = '3px solid #27ae60'
            if (isDim) border = '3px solid #999'
            if (selectedSet.has(key)) border = '3px solid #e74c3c'

            const isShell = cell.type === 'shell'
            const neighborIsNaC = (r: number, c: number) =>
              r < 0 ||
              r >= grid.length ||
              c < 0 ||
              c >= grid[0].length ||
              grid[r][c].type !== 'shell'
            const outlineColor = '#925b24'
            const edgeColor = (r: number, c: number) =>
              neighborIsNaC(r, c) ? outlineColor : bgColor
            const shapeOutline =
              isShell && !isHighlight && !isDim && !selectedSet.has(key)
                ? {
                    borderTopColor: edgeColor(rowIndex - 1, colIndex),
                    borderRightColor: edgeColor(rowIndex, colIndex + 1),
                    borderBottomColor: edgeColor(rowIndex + 1, colIndex),
                    borderLeftColor: edgeColor(rowIndex, colIndex - 1),
                  }
                : {}

            return (
              <div
                key={key}
                className="fort-grid-cell"
                onClick={
                  isClickable
                    ? () => onCellClick([rowIndex, colIndex])
                    : undefined
                }
                style={{
                  backgroundColor: bgColor,
                  border,
                  ...shapeOutline,
                  opacity: isDim ? 0.4 : 1,
                  cursor: isClickable ? 'pointer' : 'default',
                  color: getLabelTextColor(cell),
                }}
                title={`${rowIndex},${colIndex}`}>
                {showLabels ? getCellLabel(cell) : null}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default FortGrid
