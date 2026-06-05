import IGameState from 'common/IGameState'
import { handleBuildBuilding } from './buildBuilding'
import { handleBuildShip } from './buildShip'

export function handleAction(
  state: IGameState,
  payload: {
    actionChosen: string
    cardID?: string
    fortID?: string
    repairAt?: [number, number]
  },
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
      if (payload.cardID && payload.fortID) {
        return handleBuildBuilding(state, {
          buildingID: payload.cardID,
          fortID: payload.fortID,
          repairAt: payload.repairAt,
        })
      }
      return { ...base, phase: 'buildBuilding' }
    case 'buildShip':
      if (payload.cardID && payload.fortID) {
        return handleBuildShip(state, {
          shipID: payload.cardID,
          fortID: payload.fortID,
        })
      }
      return { ...base, phase: 'buildShip' }
    case 'attack':
      return { ...base, phase: 'attackStart' }
    default:
      throw new Error(`Invalid action: ${action}`)
  }
}
