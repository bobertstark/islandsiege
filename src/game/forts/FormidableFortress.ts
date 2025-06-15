import { Fort } from '../Fort'

export class FormidableFortress extends Fort {
  constructor() {
    super({
      id: 'formidableFortress',
      name: 'Formidable Fortress',
      type: 'fort',
      gridSpec: [
        [2, 0, '.'],
        [2, 1, 'B'],
        [2, 2, '.'],
        [2, 3, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort, he rolls 1 fewer die.',
    })
  }
}
