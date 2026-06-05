import React from 'react'
import { DieValue } from 'common/die'

const DIE_STYLE: Record<DieValue, { bg: string; text: string }> = {
  B: { bg: '#222222', text: '#ffffff' },
  W: { bg: '#eeeeee', text: '#222222' },
  G: { bg: '#888888', text: '#ffffff' },
  L: { bg: '#e8d44d', text: '#222222' },
  T: { bg: '#e74c3c', text: '#ffffff' },
}

const DIE_PATTERN = /\[([BWGLT])\]/g

interface DescriptionTextProps {
  text: string
}

const DescriptionText: React.FC<DescriptionTextProps> = ({ text }) => {
  const parts: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null

  DIE_PATTERN.lastIndex = 0
  while ((match = DIE_PATTERN.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const face = match[1] as DieValue
    const s = DIE_STYLE[face]
    parts.push(
      <span
        key={match.index}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          background: s.bg,
          color: s.text,
          border: '1px solid #555',
          borderRadius: 3,
          fontWeight: 'bold',
          fontSize: 11,
          verticalAlign: 'middle',
          margin: '0 2px',
        }}>
        {face}
      </span>,
    )
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return <span>{parts}</span>
}

export default DescriptionText
