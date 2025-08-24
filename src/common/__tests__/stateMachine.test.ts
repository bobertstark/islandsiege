import {
  invalidState,
  invalidMap,
  StateMachine,
  smErrorCode,
} from '../stateMachine'
import { GameStates, testStateMap } from '../__mocks__/mockStateMachine'

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
    expect(sm.map).toBe(invalidMap)
    expect(sm.state).toBe(invalidState)
    expect(sm.initialized()).toBe(false)
    expect(sm.numStates()).toBe(1)
  })

  it('stateMachineSetMap', () => {
    smInit()

    expect(sm.map).toBe(testStateMap)
    expect(sm.state).toBe(Object.keys(testStateMap)[0])
    expect(sm.state).not.toBe(null)
    expect(sm.initialized()).toBe(true)
    expect(sm.numStates()).toBe(Object.keys(testStateMap).length)
  })

  it('stateMachineGetState', () => {
    smInit()
    expect(sm.state).toBe(GameStates.initGame)
  })

  it('stateMachineGetMap', () => {
    smInit()
    expect(sm.map).toBe(testStateMap)
  })

  it('stateMachingGetStateConfig', () => {
    smInit()
    expect(sm.stateConfig).toBe(testStateMap[Object.keys(testStateMap)[0]])
  })
  it('stateMachineInvalidTransition', () => {
    smInit()

    expect(sm.transition(GameStates.resetGame)).toBe('INVALIDTRANSITION')
  })

  it('stateMachineValidTransition', () => {
    smInit()

    expect(sm.transition(GameStates.gameOver)).toBe('TRANSITIONED')
  })

  it('stateMachineExecuteNoTransition', () => {
    smInit()

    sm.func.mockReturnValue(sm.state)
    expect(sm.execute(gameState)).toBe('SUCCESS')
    sm.func.mockReturnValue(sm.state)
    expect(sm.execute(gameState)).toBe('SUCCESS')

    expect(sm.func.mock.calls).toHaveLength(2)
    expect(sm.state).toBe(Object.keys(testStateMap)[0])
  })

  it('stateMachineExecuteValidTransition', () => {
    smInit()

    let initialFunc: stateFunc = sm.func
    initialFunc.mockReturnValue(GameStates.gameOver)

    expect(sm.execute(gameState)).toBe('TRANSITIONED')

    // Initial state should have executed once
    expect(initialFunc.mock.calls).toHaveLength(1)

    // current state should not have any calls
    expect(sm.func.mock.calls).toHaveLength(0)

    expect(sm.state).toBe(GameStates.gameOver)
  })
})
