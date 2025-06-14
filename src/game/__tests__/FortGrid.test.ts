import { FortGrid } from '../FortGrid'
import type { FortGridSpec, FortGridCube } from '../FortGrid'

describe('FortGrid', () => {
  it('creates grid from spec', () => {
    const spec: FortGridSpec = [
      [0, 0, 'G'],
      [0, 1, 'B'],
      [1, 2, 'W'],
      [2, 3, '.'],
    ]
    const expected = [
      [0, 0, 'gray'],
      [0, 1, 'black'],
      [1, 2, 'white'],
      [2, 3, null],
    ] as const

    const grid = new FortGrid(spec)
    for (const [row, col, color] of expected) {
      const cell = grid.cellAt(row, col)
      expect(cell?.type).toBe('cube')
      if (cell?.type === 'cube') {
        expect(cell.color).toBe(color)
      }
    }
    let cell = grid.cellAt(0, 2)
    expect(cell?.type).toBe('NaC')

    // cube info should not include NaC cells
    expect(grid.cubeInfo).toHaveLength(4)
  })

  it('throws on invalid grid position', () => {
    const badSpec: FortGridSpec = [[4, 4, 'B']]
    expect(() => new FortGrid(badSpec)).toThrow('Invalid grid position')
  })

  it('throws on unknown symbol', () => {
    const badSpec: FortGridSpec = [[0, 0, 'X']]
    expect(() => new FortGrid(badSpec)).toThrow('Unknown cube symbol: X')
  })

  it('toString and fromString work as expected', () => {
    const spec: FortGridSpec = [
      [0, 0, 'B'],
      [0, 1, '.'],
      [1, 1, 'G'],
      [2, 2, 'W'],
    ]
    const grid = new FortGrid(spec)
    const str = grid.toString()

    expect(str).toMatch(/^B \. ~ ~\n~ G ~ ~\n~ ~ W ~\n~ ~ ~ ~$/)

    const parsedGrid = FortGrid.fromString(str)
    expect(parsedGrid.toString()).toBe(str) // Round-trip consistency
  })
  it('cellIsProtected detects blocking cubes', () => {
    const spec: FortGridSpec = [
      [0, 0, 'B'],
      [1, 0, 'G'],
    ]
    const grid = new FortGrid(spec)
    expect(grid.cellAtIsProtected(1, 0)).toBe(true)
    expect(grid.cellAtIsProtected(0, 0)).toBe(false)
  })

  it('cellConnectedStrength returns number of connected cubes with same color', () => {
    const grid = FortGrid.fromString(`
                  ~ ~ ~ ~
                  ~ B B ~
                  ~ B W ~
                  ~ ~ ~ ~
                  `)

    expect(grid.cellAtConnectedStrength(1, 1)).toBe(3)
    expect(grid.cellAtConnectedStrength(2, 2)).toBe(1)
  })
  it('builds on empty cells', () => {
    const grid = FortGrid.fromString(`
          ~ ~ ~ ~
          ~ B . ~
          ~ . W ~
          ~ ~ ~ ~
          `)
    let cell = grid.cellAt(1, 2)
    expect(cell.type).toBe('cube')
    expect((cell as FortGridCube).color).toBeNull()
    grid.buildSpec([
      [1, 2, 'W'],
      [2, 1, 'W'],
    ])
    cell = grid.cellAt(1, 2)
    expect(cell.type).toBe('cube')
    expect((cell as FortGridCube).color).toBe('white')

    // when adding to NaC, nothing happens
    grid.buildSpec([[0, 0, 'black']])
    cell = grid.cellAt(0, 0)
    expect(cell.type).toBe('NaC')
  })
  it('destroys connected cells', () => {
    const grid = FortGrid.fromString(`
          ~ ~ ~ ~
          G B B W
          ~ ~ ~ ~
          ~ ~ ~ ~
          `)
    let cell = grid.cellAt(1, 3)
    expect((cell as FortGridCube).color).toBe('white')
    grid.destroyAt(1, 3)
    cell = grid.cellAt(1, 3)
    expect(cell.type).toBe('cube')
    expect((cell as FortGridCube).color).toBeNull()

    grid.destroyAt(1, 1) // will destroy neighbors
    cell = grid.cellAt(1, 1)
    expect((cell as FortGridCube).color).toBeNull()
    cell = grid.cellAt(1, 2)
    expect((cell as FortGridCube).color).toBeNull()
    cell = grid.cellAt(1, 0)
    expect((cell as FortGridCube).color).toBe('gray')
  })
  it('provides a cached representation of cubes and protection bonuses', () => {
    const grid = FortGrid.fromString(`
          ~ ~ ~ ~
          ~ B B W
          ~ W ~ ~
          ~ ~ ~ ~
          `)
    let info = grid.cubeInfo
  })
  it('updates cubeInfo correctly after destruction', () => {
    const grid = FortGrid.fromString(`
      ~ ~ ~ ~
      ~ B B W
      ~ W ~ ~
      ~ ~ ~ ~
    `)

    let info = grid.cubeInfoAt(1, 1)
    expect(info.color).toBe('black')
    expect(info.protectBonus).toBe(false)
    expect(info.connectStrength).toBe(2)

    info = grid.cubeInfoAt(2, 1)
    expect(info.color).toBe('white')
    expect(info.protectBonus).toBe(true)
    expect(info.connectStrength).toBe(1)

    // destruction will remove protection
    grid.destroyAt(1, 2)
    info = grid.cubeInfoAt(2, 1)
    expect(info.protectBonus).toBe(false)
  })
})
