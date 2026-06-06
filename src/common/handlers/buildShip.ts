import IGameState from 'common/IGameState'
import { createShipById } from 'common/cardRegistry'
import { addShip, removeCardInHand } from 'common/player'
import { ILogEntry } from 'common/ILog'

export function handleBuildShip(
  state: IGameState,
  payload: { fortID: string; shipID: string },
): IGameState {
  const players = [...state.players]
  let player = players[state.currentPlayerIndex]

  const { player: updatedPlayer } = removeCardInHand(player, payload.shipID)
  const ship = createShipById(payload.shipID)
  players[state.currentPlayerIndex] = addShip(
    updatedPlayer,
    ship,
    payload.fortID,
  )

  const logEntry: ILogEntry = {
    phase: 'buildShip',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      cardID: payload.shipID,
      fortID: payload.fortID,
      colonistsMoved: ship.cost,
    },
  }
  return {
    ...state,
    players,
    phase: 'endTurn',
    buildContext: { cardID: payload.shipID, fortID: payload.fortID },
    pendingBuildCardID: undefined,
    log: [...state.log, logEntry],
  }
}
