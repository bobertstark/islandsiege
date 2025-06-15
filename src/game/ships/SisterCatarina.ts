import { Ship } from '../Ship'

export class SisterCatarina extends Ship {
  constructor() {
    super({
      id: 'sisterCatarina',
      name: 'Sister Catarina',
      type: 'ship',
      cost: 2,
      coins: 3,
      description: '[L]: Add 1 [G] to your result.',
    })
  }
}
