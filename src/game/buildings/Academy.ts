import { Building } from '../Building'

export class Academy extends Building {
  constructor() {
    super({
      id: 'academy',
      name: 'Academy',
      type: 'building',
      cost: 2,
      coins: 2,
      repairColor: 'black',
      description:
        'Whenever you attack, you may remove one colonist from this building to re-roll 1 additional time.',
    })
  }
}
