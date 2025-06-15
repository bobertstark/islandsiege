import { Building } from '../Building'

export class CannonSmith extends Building {
  constructor() {
    super({
      id: 'cannonSmith',
      name: 'Cannon Smith',
      type: 'building',
      cost: 1,
      coins: 1,
      repairColor: 'black',
      description: 'Whenever you attack, add 1 [B] to your result.',
    })
  }
}
