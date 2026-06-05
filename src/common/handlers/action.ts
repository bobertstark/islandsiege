import IGameState from 'common/IGameState'

export function handleAction(
  state: IGameState,
  payload: { actionChosen: string; cardID?: string },
): IGameState {
  const action = payload.actionChosen
  const base = {
    ...state,
    buildContext: undefined,
    pendingBuildCardID: payload.cardID,
  }
  switch (action) {
    // TODO: Verify action is valid for player prior to returning
    // TODO: Check if any opponents block actions
    case 'draw':
      return { ...base, phase: 'draw' }
    case 'buildFort':
      return { ...base, phase: 'buildFort' }
    case 'buildBuilding':
      return { ...base, phase: 'buildBuilding' }
    case 'buildShip':
      return { ...base, phase: 'buildShip' }
    case 'attack':
      return { ...base, phase: 'attackStart' }
    default:
      throw new Error(`Invalid action: ${action}`)
  }
}
