import {
  reduceDice,
  rerollDice,
  spendDice,
  addDice,
  swapDice,
} from '../attackRoll'
import { DieValue, DIE_FACES } from '../die'

describe('attackRoll', () => {
  it('tallies roll values by face', () => {
    const roll: DieValue[] = ['L', 'L', 'B', 'W']
    expect(reduceDice(roll)).toEqual({ L: 2, B: 1, W: 1 })
  })

  it('rerolls only the given indices', () => {
    const dice: DieValue[] = ['L', 'G', 'B']
    const result = rerollDice(dice, [1])
    expect(result[0]).toBe('L')
    expect(result[2]).toBe('B')
    expect(DIE_FACES).toContain(result[1])
  })
})

describe('spendDice', () => {
  it('subtracts count from the bank', () => {
    expect(spendDice({ L: 3, B: 1 }, 'L', 2)).toEqual({ L: 1, B: 1 })
  })

  it('removes the key when count reaches zero', () => {
    expect(spendDice({ L: 2 }, 'L', 2)).toEqual({})
  })

  it('throws when there are not enough dice', () => {
    expect(() => spendDice({ L: 1 }, 'L', 2)).toThrow('Not enough L')
  })

  it('throws when the face is absent', () => {
    expect(() => spendDice({}, 'L', 1)).toThrow('Not enough L')
  })
})

describe('addDice', () => {
  it('adds to an existing face', () => {
    expect(addDice({ B: 1 }, 'B', 2)).toEqual({ B: 3 })
  })

  it('creates a new face entry', () => {
    expect(addDice({}, 'W', 1)).toEqual({ W: 1 })
  })
})

describe('swapDice', () => {
  it('spends from one face and adds to another', () => {
    expect(swapDice({ L: 2, B: 1 }, 'L', 'W', 2)).toEqual({ B: 1, W: 2 })
  })

  it('throws when from face is insufficient', () => {
    expect(() => swapDice({ L: 1 }, 'L', 'W', 2)).toThrow('Not enough L')
  })
})
