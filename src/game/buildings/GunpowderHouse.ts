import { Building } from '../Building'

export class GunpowderHouse extends Building {
  constructor() {
    super({
      id: 'gunpowderHouse',
      name: 'Gunpowder House',
      type: 'building',
      cost: 1,
      coins: 1,
      repairColor: 'black',
      description: 'Whenever you attack, add 1 [T] to your result.',
    })
  }
}
