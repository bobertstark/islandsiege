import { Ship } from '../Ship'

export class Magnifique extends Ship {
  constructor() {
    super({
      id: 'magnifique',
      name: 'Magnifique',
      type: 'ship',
      cost: 4,
      coins: 5,
      description: '[L]: Gain 1 gold.',
    })
  }
}
