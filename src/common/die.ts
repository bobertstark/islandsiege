// White, Black, Gray, Leadership, Target
export type DieValue = 'W' | 'B' | 'G' | 'L' | 'T'

export const DIE_STYLE: Record<DieValue, { bg: string; text: string }> = {
  B: { bg: '#222222', text: '#ffffff' },
  W: { bg: '#eeeeee', text: '#222222' },
  G: { bg: '#888888', text: '#ffffff' },
  L: { bg: '#e8d44d', text: '#222222' },
  T: { bg: '#e74c3c', text: '#ffffff' },
}

// 'G' appears twice (weighted face).
export const DIE_FACES: DieValue[] = ['W', 'B', 'G', 'G', 'L', 'T']

export function rollDie(rng: () => number = Math.random): DieValue {
  return DIE_FACES[Math.floor(rng() * DIE_FACES.length)]
}
