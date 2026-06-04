import IGameState from 'common/IGameState'
import { createShipById } from 'common/cardRegistry'
import { addShip } from 'common/player'

export function handleBuildShip(
  state: IGameState,
  payload: { fortID: string; shipID: string },
): IGameState {
  const players = [...state.players]
  const ship = createShipById(payload.shipID)
  players[state.currentPlayerIndex] = addShip(
    players[state.currentPlayerIndex],
    ship,
    payload.fortID,
  )
  return { ...state, players, phase: 'endTurn' }
}
