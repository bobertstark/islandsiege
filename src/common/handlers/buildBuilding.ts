import IGameState from 'common/IGameState'
import { createBuildingById } from 'common/cardRegistry'
import { findFort, removeCardInHand } from 'common/player'
import { addBuilding } from 'common/fort'
import { ILogEntry } from 'common/ILog'

export function handleBuildBuilding(
  state: IGameState,
  payload: { fortID: string; buildingID: string; repairAt?: [number, number] },
): IGameState {
  const players = [...state.players]
  let player = players[state.currentPlayerIndex]
  const fort = findFort(player, payload.fortID)
  const building = createBuildingById(payload.buildingID)
  const updatedFort = addBuilding(fort, building, payload.repairAt)
  const { player: updatedPlayer } = removeCardInHand(player, payload.buildingID)
  players[state.currentPlayerIndex] = {
    ...updatedPlayer,
    coins: updatedPlayer.coins + building.coins,
    forts: updatedPlayer.forts.map(f =>
      f.id === payload.fortID ? updatedFort : f,
    ),
  }
  const logEntry: ILogEntry = {
    phase: 'buildBuilding',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      cardID: payload.buildingID,
      fortID: payload.fortID,
      colonistsMoved: building.cost,
      repairUsed: payload.repairAt !== undefined,
    },
  }
  return {
    ...state,
    players,
    phase: 'endTurn',
    pendingBuildCardID: undefined,
    log: [...state.log, logEntry],
  }
}
