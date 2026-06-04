// splitmix32 — 32-bit state PRNG
// https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
// revisit (increase bits) if needed
export function createRng(initialSeed: number): {
  next: () => number
  seed: () => number
} {
  let s = initialSeed >>> 0
  return {
    next(): number {
      s = (s + 0x9e3779b9) >>> 0
      let t = s ^ (s >>> 16)
      t = Math.imul(t, 0x21f0aaad)
      t = t ^ (t >>> 15)
      t = Math.imul(t, 0x735a2d97)
      return ((t ^ (t >>> 15)) >>> 0) / 0x100000000
    },
    seed(): number {
      return s
    },
  }
}

export function generateSeed(): number {
  return (Math.random() * 0x100000000) >>> 0
}
