import { StateMachine } from '../stateMachine'
import { mockStateMachine } from '../__mocks__/mockStateMachine'
import { GamePhases } from '../phases'
describe('stateMachine', () => {
  let sm: StateMachine = new StateMachine()
  beforeEach(() => {})
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('stateMachineGet', () => {
    expect(sm.state).toBe(GamePhases.initGame)
  })
})
