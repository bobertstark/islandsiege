export const ShellColors = {
  black: '#222222',
  white: '#eeeeee',
  gray: '#888888',
} as const

export type ShellColor = keyof typeof ShellColors // 'black' | 'white' | 'gray'

export type ShellReserve = Partial<Record<ShellColor, number>>

const COLOR_SYMBOLS: Record<ShellColor, string> = {
  black: 'B',
  gray: 'G',
  white: 'W',
}

const SYMBOL_COLORS: Record<string, ShellColor> = {
  B: 'black',
  G: 'gray',
  W: 'white',
}

export const PLAYER_COLORS = [
  { name: 'Red', value: '#c0392b' },
  { name: 'Yellow', value: '#f1c40f' },
  { name: 'Green', value: '#27ae60' },
  { name: 'Purple', value: '#8e44ad' },
]

export function symbolToColor(symbol: string): ShellColor {
  const color = SYMBOL_COLORS[symbol]
  if (!color) throw new Error(`Unknown shell symbol: ${symbol}`)
  return color
}

export function colorToSymbol(color: ShellColor | null): string {
  if (color === null) return '.'
  const symbol = COLOR_SYMBOLS[color]
  if (!symbol) throw new Error(`Cannot convert color to symbol: ${color}`)
  return symbol
}
