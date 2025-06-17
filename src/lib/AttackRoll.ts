import { Die, DieValue } from './Die'

export class AttackRoll {
  private dice!: Die[]
  private rerollsTaken: number = 0
  public isFinished: boolean = false

  constructor(
    private numDice: number,
    private rerollsRemaining: number,
  ) {
    this.createDice()
    this.roll_all()
    if (this.rerollsRemaining <= 0) {
      this.finish()
    }
  }

  private createDice(): void {
    this.dice = Array.from({ length: this.numDice }, () => new Die())
  }

  private roll_all(): void {
    this.dice.forEach(die => die.roll())
  }

  reroll(indices?: number[]): void {
    if (this.isFinished) {
      throw new Error('No rerolls remain.')
    }

    if (!indices) {
      this.roll_all()
    } else {
      for (const index of indices) {
        if (index < 0 || index >= this.dice.length) {
          throw new Error(`Invalid index ${index} used`)
        }
        this.dice[index].roll() // reroll individual die
      }
    }

    this.decreaseRerollsRemaining()
    this.rerollsTaken++
  }

  get value(): DieValue[] {
    return this.dice.map(d => d.value)
  }

  get rollsRemaining(): number {
    return this.rerollsRemaining
  }

  // fun stat to track
  get totalDiceRolled(): number {
    return this.dice.reduce((sum, d) => sum + d.rollCount, 0)
  }

  decreaseRerollsRemaining() {
    this.rerollsRemaining--
    if (this.rerollsRemaining <= 0) {
      this.finish()
    }
  }

  finish(): void {
    this.isFinished = true
    this.rerollsRemaining = 0
  }
}
