import { Fort } from '../Fort'

export class SupportedStronghold extends Fort {
  constructor() {
    super({
      id: 'supportedStronghold',
      name: 'Supported Stronghold',
      type: 'fort',
      gridSpec: [
        [1, 1, 'W'],
        [1, 2, '.'],
        [2, 0, '.'],
        [2, 1, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent builds a ship, building, or fort, he scores 1 fewer coin.',
    })
  }
}
