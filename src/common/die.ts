// White, Black, Gray, Leadership, Target
export type DieValue = 'W' | 'B' | 'G' | 'L' | 'T'

// 'G' appears twice (weighted face).
export const DIE_FACES: DieValue[] = ['W', 'B', 'G', 'G', 'L', 'T']

export function rollDie(rng: () => number = Math.random): DieValue {
  return DIE_FACES[Math.floor(rng() * DIE_FACES.length)]
}
