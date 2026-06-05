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
    targetPlayerIndex?: number
  },
): IGameState {
  const action = payload.actionChosen
  const base = {
    ...state,
    buildContext: undefined,
    pendingBuildCardID: payload.cardID,
  }
  switch (action) {
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
    case 'attack': {
      const shipLocations: IGameState['shipLocations'] = {
        ...state.shipLocations,
        [state.currentPlayerIndex]: {},
      }
      const openWaterAttack = !state.players.some(p => p.forts.length >= 1)
      if (openWaterAttack) {
        return {
          ...base,
          shipLocations,
          attackIsOpenWater: true,
          phase: 'attackRoll',
        }
      }
      const targetPlayerIndex = payload.targetPlayerIndex
      if (targetPlayerIndex === undefined || targetPlayerIndex < 0) {
        throw new Error('Attack requires a target')
      }
      const alreadyTargeted = Object.values(shipLocations).some(
        loc => loc.targetPlayerIndex === targetPlayerIndex,
      )
      if (alreadyTargeted) {
        throw new Error(`${targetPlayerIndex} cannot be attacked.`)
      }
      return {
        ...base,
        attackIsOpenWater: false,
        shipLocations: {
          ...shipLocations,
          [state.currentPlayerIndex]: {
            targetPlayerIndex,
            fortID: payload.fortID ?? '',
          },
        },
        phase: 'attackRoll',
      }
    }
    default:
      throw new Error(`Invalid action: ${action}`)
  }
}
