import { Building } from '../Building'

export class Watchtower extends Building {
  constructor() {
    super({
      id: 'watchtower',
      name: 'Watchtower',
      type: 'building',
      cost: 3,
      coins: 3,
      repairColor: 'black',
      description:
        "When built, destroy an opponent's ship. Your opponents cannot build any ships.",
    })
  }
}
