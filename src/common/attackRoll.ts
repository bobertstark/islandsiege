import { DieValue, rollDie } from './die'

export type rollCounts = Partial<Record<DieValue, number>>

export function rollDice(count: number): DieValue[] {
  return Array.from({ length: count }, rollDie)
}

export function rerollDice(dice: DieValue[], indices: number[]): DieValue[] {
  return dice.map((val, idx) => (indices.includes(idx) ? rollDie() : val))
}

export function rollSingleDie(): DieValue {
  return rollDie()
}

// Reduce roll into die counts
export function reduceDice(roll: DieValue[]): rollCounts {
  return roll.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {} as rollCounts)
}
