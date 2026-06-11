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
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    setDisplay(DIE_FACES[0])

    timerRef.current = setInterval(() => {
      setDisplay(DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)])
    }, ROLL_INTERVAL_MS)

    endRef.current = setTimeout(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setDisplay(faceRef.current)
    }, ROLL_DURATION_MS)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (endRef.current) clearTimeout(endRef.current)
      timerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync display when face changes from outside (e.g. dev panel patch).
  // Skip on initial render to avoid interrupting the mount animation.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (!timerRef.current) setDisplay(face)
  }, [face])

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
