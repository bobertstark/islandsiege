import React, { useEffect, useRef, useState } from 'react'
import { DieValue, DIE_FACES, DIE_STYLE } from 'common/die'

export const ROLL_DURATION_MS = 600
const ROLL_INTERVAL_MS = 60

interface DieProps {
  face: DieValue
  selected?: boolean
  onClick?: () => void
  readonly?: boolean
}

const Die: React.FC<DieProps> = ({
  face,
  selected = false,
  onClick,
  readonly = false,
}) => {
  const [display, setDisplay] = useState<DieValue>(DIE_FACES[0])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const faceRef = useRef(face)
  faceRef.current = face

  useEffect(() => {
    setDisplay(DIE_FACES[0])

    timerRef.current = setInterval(() => {
      setDisplay(DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)])
    }, ROLL_INTERVAL_MS)

    endRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current)
      setDisplay(faceRef.current)
    }, ROLL_DURATION_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (endRef.current) clearTimeout(endRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const s = DIE_STYLE[display]

  return (
    <div
      onClick={readonly ? undefined : onClick}
      style={{
        width: 48,
        height: 48,
        fontWeight: 'bold',
        fontSize: 18,
        cursor: readonly || !onClick ? 'default' : 'pointer',
        border: selected ? '3px solid #e74c3c' : '2px solid #555',
        borderRadius: 8,
        background: s.bg,
        color: s.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        outline: selected ? '2px solid #e74c3c' : 'none',
        outlineOffset: 2,
        userSelect: 'none',
        transition: 'background 0.05s',
      }}>
      {display}
    </div>
  )
}

export default Die
