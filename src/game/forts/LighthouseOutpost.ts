import { Fort } from '../Fort'

export class LighthouseOutpost extends Fort {
  constructor() {
    super({
      id: 'lighthouseOutpost',
      name: 'Lighthouse Outpost',
      type: 'fort',
      gridSpec: [
        [0, 1, '.'],
        [0, 2, 'W'],
        [1, 2, '.'],
        [2, 2, '.'],
      ],
      slots: 4,
      description:
        'Whenever 1 of your ships is destroyed, return it to your hand.',
    })
  }
}
