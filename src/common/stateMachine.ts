import { Phase, GamePhases } from '../common/phases'
import type { GameState } from '../game/GameState'

type stateFunc = (parameters_: GameState) => Phase | null

export type smErrorCode = 'SUCCESS' | 'TRANSITIONED' | 'INVALIDTRANSITION'

type stateConfig = {
  stateFunc: stateFunc
  transitions: Phase[]
}

type stateMapping = {
  [key in Phase]: stateConfig
}

export class StateMachine {
  private stateMap: stateMapping[] | null = null
  private currentState: Phase | null = null

  public initialize(map_: stateMapping[], initialState_: Phase) {
    this.stateMap = map_
    this.currentState = initialState_
  }

  get state(): Phase | null {
    return this.currentState
  }

  get map(): stateMapping[] | null {
    return this.stateMap
  }

  public initialized(): boolean {
    return this.map != null
  }

  get func(): stateFunc {
    return this.stateMap[this.state].stateFunc
  }

  // Execute the state function. The state function either returns null or a
  // state to transition to. If it returns null, the same state is called
  // again. This function returns true if a transition to a new state occurred
  // or false if no transition occurred.
  public execute(parameters_: GameState): smErrorCode {
    let newState: Phase | null = this.func(parameters_)
    if (newState == null) {
      return 'SUCCESS'
    }

    return newState == null ? 'SUCCESS' : this.transition(newState)
  }

  public possibleTransition(newState_: Phase): boolean {
    return this.map[this.state].transitions.includes(newState_)
  }

  // Returns false if transition is not possible
  // otherwise transitions
  public transition(newState_: Phase): smErrorCode {
    if (!this.possibleTransition(newState_)) {
      return 'INVALIDTRANSITION'
    }

    this.currentState = newState_
    return 'TRANSITIONED'
  }

  public numStates(): number {
    return this.map == null ? -1 : this.map.length
  }
}
