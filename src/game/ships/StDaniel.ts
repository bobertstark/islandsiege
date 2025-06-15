import { Ship } from '../Ship'

export class StDaniel extends Ship {
  constructor() {
    super({
      id: 'stDaniel',
      name: 'St. Daniel',
      type: 'ship',
      cost: 3,
      coins: 4,
      description: '[L]: Add 1 [W] to your result.',
    })
  }
}
