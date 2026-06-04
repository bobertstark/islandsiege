import { ShellColor, symbolToColor, colorToSymbol } from './colors'

export type FortGridNaC = { type: 'NaC' }
export type FortGridShell = { type: 'shell'; color: ShellColor | null }
export type FortGridCell = FortGridShell | FortGridNaC

// Spec values stay loose strings: building onto a non-existent (NaC) cell is a
// no-op, so an out-of-range symbol there must not be rejected before the skip.
export type FortGridSpec = [number, number, string][]

export const FORT_GRID_SIZE = 4

export type ShellInfo = {
  loc: [number, number]
  color: ShellColor | null
  protectBonus: boolean
  connectStrength: number
}

// A fort's 4×4 shell grid. NaC cells are outside the footprint; shell cells may
// hold a colour or be empty. Shell metadata (protection, connect strength,
// remaining count) is derived on demand, so the grid itself is the only state.
export type FortGridState = FortGridCell[][]

const DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

function clone(grid: FortGridState): FortGridState {
  return grid.map(row => row.map(cell => ({ ...cell })))
}

export function createFortGrid(spec: FortGridSpec): FortGridState {
  const grid: FortGridState = Array.from({ length: FORT_GRID_SIZE }, () =>
    Array.from(
      { length: FORT_GRID_SIZE },
      () => ({ type: 'NaC' }) as FortGridCell,
    ),
  )

  for (const [row, col, val] of spec) {
    if (row >= FORT_GRID_SIZE || col >= FORT_GRID_SIZE) {
      throw new Error(`Invalid grid position: (${row}, ${col})`)
    }
    grid[row][col] = {
      type: 'shell',
      color: val === '.' ? null : symbolToColor(val),
    }
  }

  return grid
}

export function cellAt(
  grid: FortGridState,
  loc: [number, number],
): FortGridCell {
  const [r, c] = loc
  return grid[r]?.[c]
}

// Connected same-colour shells reachable from loc (4-directional flood).
export function traverseConnectedShells(
  grid: FortGridState,
  loc: [number, number],
  fn?: (r: number, c: number) => void,
): [number, number][] {
  const [row, col] = loc
  const start = grid[row]?.[col]
  if (!start || start.type !== 'shell' || start.color == null) return []

  const color = start.color
  const visited = new Set<string>()
  const stack: [number, number][] = [[row, col]]
  const result: [number, number][] = []

  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    const key = `${r},${c}`
    if (visited.has(key)) continue

    const cell = grid[r]?.[c]
    if (!cell || cell.type !== 'shell' || cell.color !== color) continue

    visited.add(key)
    result.push([r, c])
    if (fn) fn(r, c)

    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr
      const nc = c + dc
      if (
        nr >= 0 &&
        nr < FORT_GRID_SIZE &&
        nc >= 0 &&
        nc < FORT_GRID_SIZE &&
        !visited.has(`${nr},${nc}`)
      ) {
        stack.push([nr, nc])
      }
    }
  }

  return result
}

// A shell is protected if any colour sits directly above its connected group.
export function cellAtIsProtected(
  grid: FortGridState,
  loc: [number, number],
): boolean {
  const cell = cellAt(grid, loc)
  if (cell?.type !== 'shell' || cell.color === null) return false

  const connected = traverseConnectedShells(grid, loc)
  for (const [row, col] of connected) {
    for (let r = 0; r < row; r++) {
      const above = grid[r][col]
      if (above.type === 'shell' && above.color !== null) {
        return true
      }
    }
  }
  return false
}

export function cellAtConnectedStrength(
  grid: FortGridState,
  loc: [number, number],
): number {
  return traverseConnectedShells(grid, loc).length
}

export function shellInfoAt(
  grid: FortGridState,
  loc: [number, number],
): ShellInfo {
  const cell = cellAt(grid, loc)
  if (cell?.type !== 'shell') {
    throw new Error(`No shell info found at (${loc})`)
  }
  return {
    loc,
    color: cell.color,
    protectBonus: cellAtIsProtected(grid, loc),
    connectStrength: cellAtConnectedStrength(grid, loc),
  }
}

// Metadata for every shell cell (empty cells included, NaC excluded).
export function shellInfo(grid: FortGridState): ShellInfo[] {
  const info: ShellInfo[] = []
  for (let r = 0; r < FORT_GRID_SIZE; r++) {
    for (let c = 0; c < FORT_GRID_SIZE; c++) {
      if (grid[r][c].type === 'shell') {
        info.push(shellInfoAt(grid, [r, c]))
      }
    }
  }
  return info
}

export function shellsRemaining(grid: FortGridState): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.type === 'shell' && cell.color !== null) count++
    }
  }
  return count
}

// Place shells onto empty cells; throws on a non-empty target.
export function buildSpec(
  grid: FortGridState,
  specs: FortGridSpec,
): { grid: FortGridState; builds: number } {
  const next = clone(grid)
  let builds = 0

  for (const [r, c, symbol] of specs) {
    const cell = next[r][c]
    if (cell.type !== 'shell') continue
    if (cell.color) {
      throw new Error('Attempting to build on non-empty cell.')
    }
    cell.color = symbol === '.' ? null : symbolToColor(symbol)
    builds += 1
  }

  return { grid: next, builds }
}

// Clear a shell (and, optionally, its connected same-colour group).
export function destroyAt(
  grid: FortGridState,
  loc: [number, number],
  destroyConnected: boolean = false,
): FortGridState {
  const next = clone(grid)

  if (destroyConnected) {
    traverseConnectedShells(next, loc, (r, c) => {
      const cell = next[r][c]
      if (cell.type === 'shell') cell.color = null
    })
  } else {
    const [r, c] = loc
    const cell = next[r][c]
    if (cell.type === 'shell') cell.color = null
  }

  return next
}

// Attempt to destroy a shell; fails if it is protected or out-gunned.
export function attackAt(
  grid: FortGridState,
  loc: [number, number],
  count: number,
): { grid: FortGridState; success: boolean } {
  const info = shellInfoAt(grid, loc)
  if (info.protectBonus || info.connectStrength > count) {
    return { grid, success: false }
  }
  return { grid: destroyAt(grid, loc, true), success: true }
}

export function fortGridToString(grid: FortGridState): string {
  return grid
    .map(row =>
      row
        .map(cell => {
          if (cell.type === 'NaC') return '~'
          if (cell.color === null) return '.'
          return colorToSymbol(cell.color)
        })
        .join(' '),
    )
    .join('\n')
}

export function fortGridFromString(gridText: string): FortGridState {
  const spec: FortGridSpec = []

  gridText
    .trim()
    .split('\n')
    .forEach((line, row) => {
      line
        .trim()
        .split(/\s+/)
        .forEach((char, col) => {
          switch (char) {
            case '~':
              break
            case '.':
              spec.push([row, col, '.'])
              break
            case 'G':
            case 'B':
            case 'W':
              spec.push([row, col, char])
              break
            default:
              throw new Error(`Unknown character '${char}' at (${row}, ${col})`)
          }
        })
    })

  return createFortGrid(spec)
}
