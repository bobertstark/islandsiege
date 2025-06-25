import { StateMachine } from '../stateMachine'
import { testStateMap } from '../__mocks__/mockStateMachine'
import { GamePhases } from '../phases'
import { GameState } from 'game/GameState'

describe('stateMachine', () => {
  let sm: StateMachine = new StateMachine()
  let gameState: GameState = {} as GameState

  let smInit = (): void => {
    sm.initialize(testStateMap, Object.keys(testStateMap)[0])
  }

  beforeEach(() => {
    sm = new StateMachine()
    gameState = {} as GameState
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('stateMachineUnitializedCheck', () => {
    expect(sm.map).toBe(null)
    expect(sm.state).toBe(null)
    expect(sm.initialized()).toBe(false)
    expect(sm.numStates()).toBe(-1)
  })

  it('stateMachineSetMap', () => {
    smInit()

    expect(sm.map).toBe(testStateMap)
    expect(sm.state).toBe(Object.keys(testStateMap)[0])
    expect(sm.state).not.toBe(null)
    expect(sm.initialized()).toBe(true)
    expect(sm.numStates()).toBe(testStateMap.length)
  })

  it('stateMachineInvalidTransition', () => {
    smInit()

    expect(sm.transition(GamePhases.resetGame)).toBe(false)
  })

  it('stateMachineValidTransition', () => {
    smInit()

    expect(sm.transition(GamePhases.gameOver)).toBe(true)
  })

  it('stateMachineExecuteNoTransition', () => {
    smInit()

    expect(sm.execute(gameState)).toBe(false)

    expect(sm.execute(gameState)).toBe(false)

    expect(sm.func.mock.calls).toHaveLength(2)
    expect(sm.state).toBe(Object.keys(testStateMap)[0])
  })

  it('stateMachineExecuteValidTransition', () => {
    smInit()

    let initialFunc: stateFunc = sm.func
    sm.func.mockReturnValue(GamePhases.gameOver)

    expect(sm.execute(gameState)).toBe(true)

    // Initial state should have executed once
    expect(initialFunc.mock.calls).toHaveLength(1)

    // current state should not have any calls
    expect(sm.func.mock.calls).toHaveLength(0)

    expect(sm.state).toBe(GamePhases.gameOver)
  })
})
