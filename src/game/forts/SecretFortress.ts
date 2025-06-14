import { Fort } from '../Fort'

export class SecretFortress extends Fort {
  constructor() {
    super({
      id: 'secretFortress',
      name: 'Secret Fortress',
      type: 'fort',
      gridSpec: [
        [1, 1, 'B'],
        [1, 2, '.'],
        [2, 1, '.'],
        [2, 2, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort, he skips the Reinforce Step.',
    })
  }
}
