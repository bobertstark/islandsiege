import { Fort } from '../Fort'

export class ReefsideFortress extends Fort {
  constructor() {
    super({
      id: 'reefsideFortress',
      name: 'Reefside Fortress',
      type: 'fort',
      gridSpec: [
        [1, 2, '.'],
        [2, 0, '.'],
        [2, 1, '.'],
        [2, 2, 'B'],
      ],
      slots: 4,
      description:
        "Whenever an opponent attacks this fort, he cannot use his ships' abilities.",
    })
  }
}
