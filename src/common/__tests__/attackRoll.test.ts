import { reduceDice, rerollDice } from '../attackRoll'
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
