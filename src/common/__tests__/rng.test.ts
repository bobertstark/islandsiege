import { createRng, generateSeed } from '../rng'

describe('rng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 20; i++) {
      expect(a.next()).toBe(b.next())
    }
  })

  it('produces different sequences for different seeds', () => {
    const a = createRng(1)
    const b = createRng(2)
    const seqA = Array.from({ length: 10 }, () => a.next())
    const seqB = Array.from({ length: 10 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('returns values in [0, 1)', () => {
    const rng = createRng(12345)
    for (let i = 0; i < 100; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('seed() captures state so the sequence can be resumed', () => {
    const rng = createRng(99)
    rng.next()
    rng.next()
    const mid = rng.seed()
    const expected = Array.from({ length: 5 }, () => rng.next())

    const resumed = createRng(mid)
    const actual = Array.from({ length: 5 }, () => resumed.next())
    expect(actual).toEqual(expected)
  })

  it('generateSeed returns a non-negative integer', () => {
    const seed = generateSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
  })
})
