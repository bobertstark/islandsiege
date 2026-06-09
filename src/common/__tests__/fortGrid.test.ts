import {
  createFortGrid,
  fortGridFromString,
  fortGridToString,
  cellAt,
  shellInfo,
  shellInfoAt,
  cellAtIsProtected,
  cellAtConnectedStrength,
  buildSpec,
  destroyAt,
  FortGridSpec,
  FortGridShell,
} from '../fortGrid'

describe('fortGrid', () => {
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

    const grid = createFortGrid(spec)
    for (const [row, col, color] of expected) {
      const cell = cellAt(grid, [row, col])
      expect(cell?.type).toBe('shell')
      if (cell?.type === 'shell') {
        expect(cell.color).toBe(color)
      }
    }
    expect(cellAt(grid, [0, 2])?.type).toBe('NaC')

    // shell info should not include NaC cells
    expect(shellInfo(grid)).toHaveLength(4)
  })

  it('throws on invalid grid position', () => {
    expect(() => createFortGrid([[4, 4, 'B']])).toThrow('Invalid grid position')
  })

  it('throws on unknown symbol', () => {
    expect(() => createFortGrid([[0, 0, 'X']])).toThrow(
      'Unknown shell symbol: X',
    )
  })

  it('toString and fromString round-trip', () => {
    const spec: FortGridSpec = [
      [0, 0, 'B'],
      [0, 1, '.'],
      [1, 1, 'G'],
      [2, 2, 'W'],
    ]
    const grid = createFortGrid(spec)
    const str = fortGridToString(grid)

    expect(str).toMatch(/^B \. ~ ~\n~ G ~ ~\n~ ~ W ~\n~ ~ ~ ~$/)

    const parsed = fortGridFromString(str)
    expect(fortGridToString(parsed)).toBe(str)
  })

  it('detects blocking shells above a group', () => {
    const grid = createFortGrid([
      [0, 0, 'B'],
      [1, 0, 'G'],
    ])
    expect(cellAtIsProtected(grid, [1, 0])).toBe(true)
    expect(cellAtIsProtected(grid, [0, 0])).toBe(false)
  })

  it('does not treat same-colour connected cells as blockers', () => {
    // Two vertical white cells — the upper cell must not protect the lower
    const grid = createFortGrid([
      [1, 0, 'W'],
      [2, 0, 'W'],
    ])
    expect(cellAtIsProtected(grid, [1, 0])).toBe(false)
    expect(cellAtIsProtected(grid, [2, 0])).toBe(false)
  })

  it('counts connected shells of the same colour', () => {
    const grid = fortGridFromString(`
                  ~ ~ ~ ~
                  ~ B B ~
                  ~ B W ~
                  ~ ~ ~ ~
                  `)

    expect(cellAtConnectedStrength(grid, [1, 1])).toBe(3)
    expect(cellAtConnectedStrength(grid, [2, 2])).toBe(1)
  })

  it('builds on empty cells', () => {
    let grid = fortGridFromString(`
          ~ ~ ~ ~
          ~ B . ~
          ~ . W ~
          ~ ~ ~ ~
          `)
    expect((cellAt(grid, [1, 2]) as FortGridShell).color).toBeNull()
    grid = buildSpec(grid, [
      [1, 2, 'W'],
      [2, 1, 'W'],
    ]).grid
    expect((cellAt(grid, [1, 2]) as FortGridShell).color).toBe('white')

    // when targeting a NaC cell, nothing happens
    grid = buildSpec(grid, [[0, 0, 'black']]).grid
    expect(cellAt(grid, [0, 0]).type).toBe('NaC')
  })

  it('destroys connected cells', () => {
    let grid = fortGridFromString(`
          ~ ~ ~ ~
          G B B W
          ~ ~ ~ ~
          ~ ~ ~ ~
          `)
    expect((cellAt(grid, [1, 3]) as FortGridShell).color).toBe('white')
    grid = destroyAt(grid, [1, 3])
    expect((cellAt(grid, [1, 3]) as FortGridShell).color).toBeNull()

    grid = destroyAt(grid, [1, 1], true) // destroys connected neighbours
    expect((cellAt(grid, [1, 1]) as FortGridShell).color).toBeNull()
    expect((cellAt(grid, [1, 2]) as FortGridShell).color).toBeNull()
    expect((cellAt(grid, [1, 0]) as FortGridShell).color).toBe('gray')
  })

  it('updates derived shell info after destruction', () => {
    let grid = fortGridFromString(`
      ~ ~ ~ ~
      ~ B B W
      ~ W ~ ~
      ~ ~ ~ ~
    `)

    let info = shellInfoAt(grid, [1, 1])
    expect(info.color).toBe('black')
    expect(info.protectBonus).toBe(false)
    expect(info.connectStrength).toBe(2)

    info = shellInfoAt(grid, [2, 1])
    expect(info.color).toBe('white')
    expect(info.protectBonus).toBe(true)
    expect(info.connectStrength).toBe(1)

    // destruction removes the protecting shell
    grid = destroyAt(grid, [1, 1])
    info = shellInfoAt(grid, [2, 1])
    expect(info.protectBonus).toBe(false)
  })
})
