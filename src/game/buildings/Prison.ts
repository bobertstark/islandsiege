import { Building } from '../Building'

export class Prison extends Building {
  constructor() {
    super({
      id: 'prison',
      name: 'Prison',
      type: 'building',
      cost: 3,
      coins: 3,
      repairColor: 'black',
      description:
        "When built, return 1 colonist from each of your opponents' forts. Your opponents' forts cannot gain colonists.",
    })
  }
}
