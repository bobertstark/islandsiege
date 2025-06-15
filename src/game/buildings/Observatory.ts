import { Building } from '../Building'

export class Observatory extends Building {
  constructor() {
    super({
      id: 'observatory',
      name: 'Observatory',
      type: 'building',
      cost: 2,
      coins: 2,
      repairColor: 'black',
      description:
        'Whenever you take a Draw action, discard the card you would have given an opponent.',
    })
  }
}
