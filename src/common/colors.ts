export const CubeColors = {
  black: '#222222',
  white: '#eeeeee',
  gray: '#888888',
} as const

export type CubeColor = keyof typeof CubeColors // 'black' | 'white' | 'gray'

const COLOR_SYMBOLS: Record<CubeColor, string> = {
  black: 'B',
  gray: 'G',
  white: 'W',
}

const SYMBOL_COLORS: Record<string, CubeColor> = {
  B: 'black',
  G: 'gray',
  W: 'white',
}

export function cubeSymbolToColor(symbol: string): CubeColor {
  const color = SYMBOL_COLORS[symbol]
  if (!color) throw new Error(`Unknown cube symbol: ${symbol}`)
  return color
}

export function colorToSymbol(color: CubeColor | null): string {
  if (color === null) return '.'
  const symbol = COLOR_SYMBOLS[color]
  if (!symbol) throw new Error(`Cannot convert color to symbol: ${color}`)
  return symbol
}
