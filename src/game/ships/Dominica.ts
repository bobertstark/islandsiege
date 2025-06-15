import { Ship } from '../Ship'

export class Dominica extends Ship {
  constructor() {
    super({
      id: 'dominica',
      name: 'Dominica',
      type: 'ship',
      cost: 4,
      coins: 5,
      description: '[L]: Return 1 colonist off the defending fort.',
    })
  }
}
