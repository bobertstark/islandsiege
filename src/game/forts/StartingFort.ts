import { Fort } from '../Fort'

export class StartingFort extends Fort {
  constructor() {
    super({
      id: 'startingFort',
      name: 'Starting Fort',
      type: 'fort',
      gridSpec: [
        [1, 0, 'W'],
        [1, 1, 'G'],
        [1, 2, 'G'],
        [1, 3, 'B'],
      ],
      slots: 4,
      description:
        'Add [B,W] to your supply. Draw three cards then give one to your opponent.',
    })
  }
}
