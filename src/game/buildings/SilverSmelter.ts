import { Building } from '../Building'

export class SilverSmelter extends Building {
  constructor() {
    super({
      id: 'silverSmelter',
      name: 'Silver Smelter',
      type: 'building',
      cost: 2,
      coins: 2,
      repairColor: 'black',
      description:
        'When built, remove any number of colonists from your other forts to score that many coins.',
    })
  }
}
