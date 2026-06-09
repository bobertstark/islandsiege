import { CSSProperties } from 'react'

export const sectionLabel: CSSProperties = {
  fontWeight: 700,
  fontSize: 15,
  color: '#000',
}

// Icon paired with a text count: <icon> <span>N</span>
export const iconLabel: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
}

// Small inline die/symbol box — override width, height, fontSize, background, color per site
export const symbolBox: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #555',
  borderRadius: 3,
  fontWeight: 'bold',
  verticalAlign: 'middle',
}
