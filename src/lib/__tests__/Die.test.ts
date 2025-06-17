import { Die, DieValue } from '../Die'

describe('Die', () => {
  const validFaces: DieValue[] = ['W', 'B', 'G', 'L', 'T']

  it('initializes with a valid face', () => {
    const die = new Die()
    expect(validFaces).toContain(die.value)
  })

  it('roll() sets a valid face', () => {
    const die = new Die()
    die.value = 'X' as DieValue // force an invalid value
    die.roll()
    expect(validFaces).toContain(die.value)
  })
  it('ensure number of rolls is tracked', () => {
    const die = new Die()
    expect(die.rollCount).toBe(0)
    die.roll()
    expect(die.rollCount).toBe(1)
    die.roll()
    expect(die.rollCount).toBe(2)
  })
})
