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

export function spendDice(
  bank: rollCounts,
  face: DieValue,
  count: number,
): rollCounts {
  const current = bank[face] ?? 0
  if (current < count) {
    throw new Error(`Not enough ${face} dice: have ${current}, need ${count}`)
  }
  const next = { ...bank }
  const remaining = current - count
  if (remaining === 0) {
    delete next[face]
  } else {
    next[face] = remaining
  }
  return next
}

export function addDice(
  bank: rollCounts,
  face: DieValue,
  count: number,
): rollCounts {
  return { ...bank, [face]: (bank[face] ?? 0) + count }
}

export function swapDice(
  bank: rollCounts,
  from: DieValue,
  to: DieValue,
  count: number,
): rollCounts {
  return addDice(spendDice(bank, from, count), to, count)
}
