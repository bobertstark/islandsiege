import { CubeColor, cubeSymbolToColor, colorToSymbol } from '../common/colors'

export type FortGridNaC = { type: 'NaC' }
export type FortGridCube = { type: 'cube'; color: CubeColor | null }
export type FortGridCell = FortGridCube | FortGridNaC

export type FortGridSpec = [number, number, string][]
export const FORT_GRID_SIZE = 4

type CubeInfo = {
  row: number
  col: number
  color: CubeColor | null
  protectBonus: boolean
  connectStrength: number
}

export class FortGrid {
  readonly size: number = FORT_GRID_SIZE
  private grid: FortGridCell[][]
  private cubeInfoCache: CubeInfo[] = []

  constructor(gridSpec: FortGridSpec) {
    this.grid = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({ type: 'NaC' })),
    )

    for (const [row, col, val] of gridSpec) {
      if (row >= this.size || col >= this.size) {
        throw new Error(`Invalid grid position: (${row}, ${col})`)
      }

      const color = val === '.' ? null : cubeSymbolToColor(val)
      this.grid[row][col] = {
        type: 'cube',
        color,
      }

      this.cubeInfoCache.push({
        row,
        col,
        // the following properties may be changed throughout
        color,
        protectBonus: false,
        connectStrength: 0,
      })
    }
    this.updateCubeInfo()
  }

  get allCells(): FortGridCell[][] {
    return this.grid
  }

  get cubeInfo(): CubeInfo[] {
    return this.cubeInfoCache
  }

  cubeInfoAt(row: number, col: number): CubeInfo {
    const info = this.cubeInfoCache.find(i => i.row === row && i.col === col)
    if (!info) {
      throw new Error(`No cube info found at (${row}, ${col})`)
    }
    return info
  }

  cellAt(row: number, col: number): FortGridCell {
    return this.grid[row]?.[col]
  }

  private updateCubeInfo(): void {
    for (const info of this.cubeInfoCache) {
      const { row, col } = info
      const cell = this.grid[row][col]

      if (cell.type !== 'cube') continue

      info.color = cell.color ?? null
      info.protectBonus = this.cellAtIsProtected(row, col)
      info.connectStrength = this.cellAtConnectedStrength(row, col)
    }
  }

  cellAtIsProtected(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      const cell = this.grid[r][col]
      if (cell.type === 'cube' && cell.color !== null) return true
    }
    return false
  }

  cellAtConnectedStrength(row: number, col: number): number {
    return this.traverseConnectedCubes(row, col).length
  }

  buildSpec(specs: FortGridSpec): number {
    let builds = 0
    for (const [r, c, symbol] of specs) {
      const cell = this.grid[r][c]
      if (cell.type !== 'cube') continue
      if (cell.color) {
        throw new Error('Attempting to build on non-empty cell.')
      }
      cell.color = symbol === '.' ? null : cubeSymbolToColor(symbol)
      builds += 1
    }
    this.updateCubeInfo()
    return builds
  }

  destroyAt(row: number, col: number): void {
    this.traverseConnectedCubes(row, col, (r, c) => {
      const cell = this.grid[r][c]
      if (cell.type === 'cube') {
        cell.color = null
      }
    })

    this.updateCubeInfo()
  }

  private traverseConnectedCubes(
    row: number,
    col: number,
    fn?: (r: number, c: number) => void,
  ): [number, number][] {
    const start = this.grid[row]?.[col]
    if (!start || start.type !== 'cube' || start.color == null) return []

    const color = start.color
    const visited = new Set<string>()
    const stack = [[row, col]]
    const result: [number, number][] = []

    while (stack.length > 0) {
      const [r, c] = stack.pop()!
      const key = `${r},${c}`
      if (visited.has(key)) continue

      const cell = this.grid[r]?.[c]
      if (!cell || cell.type !== 'cube' || cell.color !== color) continue

      visited.add(key)
      result.push([r, c])

      // optional callback function
      if (fn) fn(r, c)

      const dirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]
      for (const [dr, dc] of dirs) {
        const nr = r + dr
        const nc = c + dc
        if (
          nr >= 0 &&
          nr < this.size &&
          nc >= 0 &&
          nc < this.size &&
          !visited.has(`${nr},${nc}`)
        ) {
          stack.push([nr, nc])
        }
      }
    }

    return result
  }

  // useful for visualizing while debugging
  // components should replace once implemented
  //  B . ~ ~
  //  ~ G ~ ~
  //  ~ ~ W ~
  //  ~ ~ ~ ~
  toString(): string {
    return this.grid
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

  static fromString(gridText: string): FortGrid {
    const lines = gridText.trim().split('\n')
    const spec: FortGridSpec = []

    lines.forEach((line, row) => {
      const symbols = line.trim().split(/\s+/)
      symbols.forEach((char, col) => {
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

    return new FortGrid(spec)
  }
}
