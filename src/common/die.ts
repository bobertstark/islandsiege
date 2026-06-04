// White, Black, Gray, Leadership, Target
export type DieValue = 'W' | 'B' | 'G' | 'L' | 'T'

// 'G' appears twice (weighted face).
export const DIE_FACES: DieValue[] = ['W', 'B', 'G', 'G', 'L', 'T']

// TODO: seeded RNG (see deck.ts).
export function rollDie(): DieValue {
  return DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)]
}
