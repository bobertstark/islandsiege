import { Phase, GamePhases } from '../common/phases'
import type { GameState } from '../game/GameState'

type stateFunc = (parameters_: GameState) => void

type stateConfig = {
  stateFunc: stateFunc
  transitions: Phase[]
}

function initGameStateFunc(parameters_: GameState): void {
  console.log('init game!')
}
function attackStartStateFunc(parameters_: GameState): void {
  console.log('attack start!')
}

function gameOverStateFunc(parameters_: GameState): void {
  console.log('game over!')
}
type stateMapping = {
  [key in Phase]: stateConfig
}

const stateMap: stateMapping[] = {
  initGame: {
    stateFunc: initGameStateFunc,
    transitions: [GamePhases.attackStart, GamePhases.gameOver],
  },
  attackStart: {
    stateFunc: attackStartStateFunc,
    transitions: [GamePhases.gameOver],
  },
  gameOver: {
    stateFunc: gameOverStateFunc,
    transitions: [],
  },
}

export class StateMachine {
  private map: stateMapping[] = stateMap
  private currentState: Phase = GamePhases.initGame

  constructor() {}

  get state(): Phase {
    return this.currentState
  }

  get func(): stateFunc {
    return this.map[this.state].stateFunc
  }

  // Returns false if transition is not possible
  // otherwise transitions
  public transition(newState_: Phase): boolean {
    if (!this.map[this.state].transitions.includes(newState_)) {
      return false
    }

    this.currentState = newState_
    return true
  }

  public numStates(): number {
    return this.map.length
  }
}
