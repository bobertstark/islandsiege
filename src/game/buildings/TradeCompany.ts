import { Building } from '../Building'

export class TradeCompany extends Building {
  constructor() {
    super({
      id: 'tradeCompany',
      name: 'Trade Company',
      type: 'building',
      cost: 3,
      coins: 3,
      repairColor: 'black',
      description:
        "When built, destroy an opponent's building. Your opponents cannot build any buildings.",
    })
  }
}
