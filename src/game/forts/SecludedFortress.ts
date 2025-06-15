import { Fort } from '../Fort'

export class SecludedFortress extends Fort {
  constructor() {
    super({
      id: 'secludedFortress',
      name: 'Secluded Fortress',
      type: 'fort',
      gridSpec: [
        [1, 0, '.'],
        [2, 0, '.'],
        [2, 1, 'B'],
        [2, 2, '.'],
      ],
      slots: 4,
      description:
        "Whenever an opponent attacks this fort, he cannot use his building' abilities.",
    })
  }
}
