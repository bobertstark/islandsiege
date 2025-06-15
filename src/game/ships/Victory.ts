import { Ship } from '../Ship'

export class Victory extends Ship {
  constructor() {
    super({
      id: 'victory',
      name: 'Victory',
      type: 'ship',
      cost: 2,
      coins: 3,
      description: '[L]: Add 1 [T] to your result.',
    })
  }
}
