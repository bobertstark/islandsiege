import IGameState from 'common/IGameState'
import { findFort, destroyFort } from 'common/player'
import { fortShellsRemaining } from 'common/fort'
import { ILogEntry } from 'common/ILog'

export function handleAttackDestroy(state: IGameState): IGameState {
  if (state.attackIsOpenWater) {
    return { ...state, phase: 'endTurn' }
  }

  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)

  if (fortShellsRemaining(fort) > 0) {
    return { ...state, phase: 'endTurn' }
  }

  const { player: updated, cards } = destroyFort(target, fortID!)
  players[targetPlayerIndex!] = updated
  const logEntry: ILogEntry = {
    phase: 'attackDestroy',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      targetPlayerIndex: targetPlayerIndex!,
      fortID: fortID!,
    },
  }
  return {
    ...state,
    players,
    discard: [...state.discard, ...cards],
    phase: 'endTurn',
    log: [...state.log, logEntry],
  }
}
