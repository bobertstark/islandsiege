import { StateMachine } from '../stateMachine'

export const mockStateMachine = (
  overrides: Partial<StateMachine> = {},
): StateMachine => {
  let sm: StateMap = new StateMachine()
  return {
    ...sm,
    ...overrides,
  } as StateMachine
}
