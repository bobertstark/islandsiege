import IGameState from 'common/IGameState'
import { createBuildingById } from 'common/cardRegistry'
import { findFort } from 'common/player'
import { addBuilding } from 'common/fort'

export function handleBuildBuilding(
  state: IGameState,
  payload: { fortID: string; buildingID: string; repairAt?: [number, number] },
): IGameState {
  const players = [...state.players]
  const player = players[state.currentPlayerIndex]
  const fort = findFort(player, payload.fortID)
  const building = createBuildingById(payload.buildingID)
  const updatedFort = addBuilding(fort, building, payload.repairAt)
  players[state.currentPlayerIndex] = {
    ...player,
    forts: player.forts.map(f => (f.id === payload.fortID ? updatedFort : f)),
  }
  return {
    ...state,
    players,
    phase: 'endTurn',
    buildContext: { cardID: payload.buildingID, fortID: payload.fortID },
    pendingBuildCardID: undefined,
  }
}
