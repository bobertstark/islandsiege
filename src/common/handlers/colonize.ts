import IGameState from 'common/IGameState'
import { populateForts } from 'common/player'
import { ILogEntry } from 'common/ILog'

export function handleColonize(state: IGameState): IGameState {
  const playerBefore = state.players[state.currentPlayerIndex]
  const players = [...state.players]
  players[state.currentPlayerIndex] = populateForts(playerBefore)
  const colonistsMoved =
    playerBefore.colonists - players[state.currentPlayerIndex].colonists
  const logEntry: ILogEntry = {
    phase: 'colonize',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: { colonistsMoved },
  }
  return { ...state, players, phase: 'action', log: [...state.log, logEntry] }
}
