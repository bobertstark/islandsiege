import React, { useState, useRef, useEffect } from 'react'
import './styles.css'

interface CardInfoPopoverProps {
  info: string
  // applied to the wrapper so it can carry the card's flex sizing
  style?: React.CSSProperties
  children: React.ReactNode
}

// Wraps a tableau card; clicking it toggles a styled info popover (card type,
// colonists, buildings). Closes on a click outside or Escape.
const CardInfoPopover: React.FC<CardInfoPopoverProps> = ({
  info,
  style,
  children,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      style={{ ...style, position: 'relative', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}>
      {children}
      {open && <div className="card-info-popover">{info}</div>}
    </div>
  )
}

export default CardInfoPopover
