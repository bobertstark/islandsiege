import { Building } from '../Building'

export class GovernorsMansion extends Building {
  constructor() {
    super({
      id: 'governorsMansion',
      name: "Governor's Mansion",
      type: 'building',
      cost: 3,
      coins: 3,
      repairColor: 'black',
      description:
        "When built, discard 1 random card from an opponent's building. Your opponents cannot take Draw actions.",
    })
  }
}
