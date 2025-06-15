import { Ship } from '../Ship'

export class Raven extends Ship {
  constructor() {
    super({
      id: 'raven',
      name: 'Raven',
      type: 'ship',
      cost: 3,
      coins: 4,
      description: '[L]: Add 1 [B] to your result.',
    })
  }
}
