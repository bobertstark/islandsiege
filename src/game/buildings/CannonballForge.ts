import { Building } from '../Building'

export class CannonballForge extends Building {
  constructor() {
    super({
      id: 'cannonballForge',
      name: 'Cannonball Forge',
      type: 'building',
      cost: 1,
      coins: 1,
      repairColor: 'black',
      description: 'Whenever you attack, add 1 [W] to your result.',
    })
  }
}
