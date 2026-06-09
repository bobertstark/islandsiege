import React from 'react'
import { DieValue, DIE_STYLE } from 'common/die'
import { symbolBox } from './styles'

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
          ...symbolBox,
          width: 18,
          height: 18,
          background: s.bg,
          color: s.text,
          fontSize: 11,
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
