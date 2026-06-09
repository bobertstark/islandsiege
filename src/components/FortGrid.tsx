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
            let border = '3px solid #925b24'
            if (cell.type === 'shell') {
              if (view === 'hand') {
                bgColor = cell.color ? ShellColors[cell.color] : '#a0785a'
              } else if (view === 'tableau') {
                bgColor = cell.color ? ShellColors[cell.color] : '#a0785a'
              }
            } else {
              border = '3px solid #fff'
            }

            if (isHighlight) border = '3px solid #27ae60'
            if (isDim) border = '3px solid #999'
            if (selectedSet.has(key)) border = '3px solid #e74c3c'

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
