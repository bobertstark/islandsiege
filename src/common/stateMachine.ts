/*
 * State Machine Class
 *
 * Description: Implements a state machine to be used by various game components
 *
 */

// Defines state machine error codes
export type smErrorCode = 'SUCCESS' | 'TRANSITIONED' | 'INVALIDTRANSITION'

// Defines a State type that is a string. Users of the state may define an array
//of possible states to define the scope of the states.
export type State = string

// The function that is associated with the state
type stateFunc = (parameters_: any) => State

// Defines the configation of a state. Each state has an associated function and
// a list of possible states that it can transition to
type stateConfig = {
  stateFunc: stateFunc
  transitions: State[]
}

// This is an index signature. It specifies that for a state map, each
// stateConfig is able to be indexed by a State
export type stateMap = {
  [index: State]: stateConfig
}

// Defines an invalid string
export const invalidState: State = 'invalid'

// Defines an invalid function for the state machien
function invalidFunc(parameters_: any): State {
  return invalidState
}

// Defines an invalid state map
export const invalidMap: stateMap = {
  invalidState: { stateFunc: invalidFunc, transitions: [] },
}

// Implements the state machine class
export class StateMachine {
  // Holds the state map used by the state machine
  private stateMap: stateMap = invalidMap

  // The current state that the state machine is in
  private currentState: State = invalidState

  // Initialize a state machine with a map and an initial stateconfig
  public initialize(map_: stateMap, initialState_: State) {
    this.stateMap = map_
    this.currentState = initialState_
  }

  // Returns the current state
  get state(): State {
    return this.currentState
  }

  // Returns the state map
  get map(): stateMap {
    return this.stateMap
  }

  // Returns the configuration of the current state
  get stateConfig(): stateConfig {
    return this.stateMap[this.currentState]
  }

  // Returns the function associated with the current state
  get func(): stateFunc {
    return this.stateMap[this.currentState].stateFunc
  }

  // Returns whether or not the state machine has been initialized
  public initialized(): boolean {
    return !(this.stateMap === invalidMap)
  }

  // Returns the number of states in a state machine
  public numStates(): number {
    return Object.keys(this.stateMap).length
  }

  // Execute the state function. The function will return a state to
  // transition to or it will return the current state. If the function
  // returns the current state no transition will take place.
  public execute(parameters_: any): smErrorCode {
    let newState: State = this.func(parameters_)

    return newState == this.currentState ? 'SUCCESS' : this.transition(newState)
  }

  // Returns whether or not a transition is possible from a certain state
  public possibleTransition(newState_: State): boolean {
    return this.stateMap[this.currentState].transitions.includes(newState_)
  }

  // Transitions to a new state. Function first determines whether a
  // transition is possible. If it is, the transition occurs and the function
  // indicates a transition occurred. Otherwise the state machine enters an
  // invalid state by setting the map and the current state to the invalid states.
  public transition(newState_: State): smErrorCode {
    if (!this.possibleTransition(newState_)) {
      this.currentState = invalidState
      this.stateMap = invalidMap
      return 'INVALIDTRANSITION'
    }

    this.currentState = newState_
    return 'TRANSITIONED'
  }
}
