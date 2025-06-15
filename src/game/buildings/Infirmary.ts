import { Building } from '../Building'

export class Infirmary extends Building {
  constructor() {
    super({
      id: 'infirmary',
      name: 'Infirmary',
      type: 'building',
      cost: 2,
      coins: 2,
      repairColor: 'black',
      description:
        'Whenever 1 of your forts, buildings, or ships is destroyed, you may move its colonists to this building. (Limit 2 per turn)',
    })
  }
}
