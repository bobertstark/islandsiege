import { rollDie, DIE_FACES } from '../die'

describe('die', () => {
  it('rolls a valid face', () => {
    for (let i = 0; i < 50; i++) {
      expect(DIE_FACES).toContain(rollDie())
    }
  })
})
