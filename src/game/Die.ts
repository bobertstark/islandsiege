// White, Black, Gray, Leadership, Target
export type DieValue = 'W' | 'B' | 'G' | 'L' | 'T'

export class Die {
  public static faces: DieValue[] = ['W', 'B', 'G', 'G', 'L', 'T']
  public value!: DieValue
  private countRolled: number = 0

  constructor() {
    this.roll()
  }

  roll(): void {
    const i = Math.floor(Math.random() * Die.faces.length)
    this.countRolled++
    this.value = Die.faces[i]
  }

  get rollCount(): number {
    return this.countRolled
  }
}
