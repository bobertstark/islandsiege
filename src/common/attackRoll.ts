import { DieValue, rollDie } from './die'

export type rollCounts = Partial<Record<DieValue, number>>

export function rollDice(count: number, rng?: () => number): DieValue[] {
  return Array.from({ length: count }, () => rollDie(rng))
}

export function rerollDice(
  dice: DieValue[],
  indices: number[],
  rng?: () => number,
): DieValue[] {
  return dice.map((val, idx) => (indices.includes(idx) ? rollDie(rng) : val))
}

export function rollSingleDie(rng?: () => number): DieValue {
  return rollDie(rng)
}

// Reduce roll into die counts
export function reduceDice(roll: DieValue[]): rollCounts {
  return roll.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {} as rollCounts)
}
