import { Fort } from '../Fort'

export class FlotillaOutpost extends Fort {
  constructor() {
    super({
      id: 'flotillaOutpost',
      name: 'Flotilla Outpost',
      type: 'fort',
      gridSpec: [
        [1, 0, '.'],
        [1, 1, '.'],
        [2, 1, 'W'],
        [2, 2, '.'],
      ],
      slots: 4,
      description:
        'Whenever an opponent attacks another 1 of your forts, he rolls 1 fewer die.',
    })
  }
}
