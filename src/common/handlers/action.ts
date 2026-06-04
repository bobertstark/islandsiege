import IGameState from 'common/IGameState'

export function handleAction(
  state: IGameState,
  payload: { actionChosen: string },
): IGameState {
  const action = payload.actionChosen
  switch (action) {
    // TODO: Verify action is valid for player prior to returning
    // TODO: Check if any opponents block actions
    case 'draw':
      return { ...state, phase: 'draw' }
    case 'buildFort':
      return { ...state, phase: 'buildFort' }
    case 'buildBuilding':
      return { ...state, phase: 'buildBuilding' }
    case 'buildShip':
      return { ...state, phase: 'buildShip' }
    case 'attack':
      return { ...state, phase: 'attackStart' }
    default:
      throw new Error(`Invalid action: ${action}`)
  }
}
