import { rollDie, DIE_FACES } from '../die'
import { createRng } from '../rng'

describe('die', () => {
  it('rolls a valid face', () => {
    for (let i = 0; i < 50; i++) {
      expect(DIE_FACES).toContain(rollDie())
    }
  })

  it('rollDie with fixed rng produces deterministic result', () => {
    const rngA = createRng(555)
    const rngB = createRng(555)
    const a = Array.from({ length: 10 }, () => rollDie(rngA.next.bind(rngA)))
    const b = Array.from({ length: 10 }, () => rollDie(rngB.next.bind(rngB)))
    expect(a).toEqual(b)
    expect(DIE_FACES).toContain(a[0])
  })
})
