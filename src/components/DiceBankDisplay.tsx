import React from 'react'
import { rollCounts } from 'common/attackRoll'
import { DieValue, DIE_STYLE } from 'common/die'
import { ShellColor } from 'common/colors'

const WAVE_COLORS: Array<{ symbol: 'B' | 'W' | 'G'; color: ShellColor }> = [
  { symbol: 'B', color: 'black' },
  { symbol: 'W', color: 'white' },
  { symbol: 'G', color: 'gray' },
]

const WAVE_DIE_COLORS = new Set<DieValue>(['B', 'W', 'G'])

interface DiceBankDisplayProps {
  bank: rollCounts
  selectedColor?: ShellColor | null
  onDieClick?: (face: DieValue) => void
}

export const DiceBankDisplay: React.FC<DiceBankDisplayProps> = ({
  bank,
  selectedColor = null,
  onDieClick,
}) => {
  const entries = (Object.entries(bank ?? {}) as [DieValue, number][]).filter(
    ([, count]) => count > 0,
  )
  if (entries.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
      {entries.map(([face, count]) => {
        const s = DIE_STYLE[face]
        const color = WAVE_COLORS.find(c => c.symbol === face)?.color ?? null
        const isSelected = color !== null && selectedColor === color
        return (
          <div
            key={face}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              onClick={onDieClick ? () => onDieClick(face) : undefined}
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
                cursor: onDieClick ? 'pointer' : 'default',
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
