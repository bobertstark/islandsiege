// Die types and utility

// Die value constants
export const NUM_DIE_VALUES: number = 5
export const NUM_DIE_FACES: number = 6
export const DEFAULT_ROLL_LIMIT: number = 6

// Die faces
export type DieValue = 'G' | 'W' | 'B' | 'L' | 'T'
export const DEFAULT_DIE_FACE: DieValue = 'G'

// Die probabilities
export const dieFaces: DieValue[] = ['G', 'G', 'W', 'B', 'L', 'T']

// Type used to accumulate statistics
export type DieStatsAccumulator = {
  face: DieValue
  timesRolled: number
}

// Type used to calculate and display statistics
export type DieStats = {
  face: string
  timesRolled: number
  percentage: number
}

// Configurable parameters for each face
export type FaceParameters = {
  longName: string
  color: string
}

// Define a map type between a face and a
// set of parameters
export type ConfigMap = {
  [key in DieValue]: FaceParameters
}

// Defines the paremeters for each die face
export const FaceConfig: ConfigMap = {
  G: {
    longName: 'Grey',
    color: '#808080',
  },
  W: {
    longName: 'White',
    color: '#FFFFFF',
  },
  B: {
    longName: 'Black',
    color: '#404040',
  },
  L: {
    longName: 'Leadership',
    color: '#700070',
  },
  T: {
    longName: 'Target',
    color: '#900000',
  },
}

// The props passed to a die component
export type DieProps = {
  rollLimit: number
  sendValue: (value: DieValue) => void
}

export class Die {
  public value: DieValue = DEFAULT_DIE_FACE
  private reset: boolean = true // Die should be reset initially
  private countRolled: number = 0
  private dieStatsAcc: DieStatsAccumulator[] = Array.from(
    new Array<DieStatsAccumulator>(NUM_DIE_VALUES),
    (x, i) => this.initAccumulator(x, i),
  )

  initAccumulator(x: DieStatsAccumulator, i: number): DieStatsAccumulator {
    var stat: DieStatsAccumulator = {
      face: Object.keys(FaceConfig)[i] as DieValue,
      timesRolled: 0,
    }
    return stat
  }
  // Instantiates a new die from an existing one.
  // Used by react as each state object is immutable
  public static fromObject(die_: Die): Die {
    var newDie: Die = new Die()
    newDie.value = die_.value
    newDie.reset = die_.reset
    newDie.countRolled = die_.countRolled
    newDie.dieStatsAcc = [...die_.dieStatsAcc]
    return newDie
  }

  // Roll the die
  roll(): void {
    const i = Math.floor(Math.random() * dieFaces.length)
    this.countRolled++
    this.value = dieFaces[i]
    // Update statistics
    this.dieStatsAcc[Object.keys(FaceConfig).indexOf(this.value)].timesRolled +=
      1
  }

  // Get the number of times a die has been rolled
  get rollCount(): number {
    return this.countRolled
  }

  // Initialize die statistics
  initializeStats(): void {
    for (let i = 0; i < this.dieStatsAcc.length; ++i) {
      var stat: DieStatsAccumulator = {
        face: Object.keys(FaceConfig)[i] as DieValue,
        timesRolled: 0,
      }
      this.dieStatsAcc[i] = stat
    }
    this.countRolled = 0
  }

  // Get the statistics accumulator
  get statsAcc(): DieStatsAccumulator[] {
    return this.dieStatsAcc
  }

  // Set the reset status of the die
  set resetDice(value_: boolean) {
    this.reset = value_
  }

  // Get the reset status of the diefaces
  get getResetState(): boolean {
    return this.reset
  }

  // Execute a reset of the die
  resetDie(): void {
    this.initializeStats()
    this.roll()
    this.reset = false
  }
}
