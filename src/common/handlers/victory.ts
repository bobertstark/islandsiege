import IGameState from 'common/IGameState'
import { ILogEntry } from 'common/ILog'

export function handleVictory(state: IGameState): IGameState {
  const player = state.players[state.currentPlayerIndex]

  if (
    player.colonists <= 0 ||
    (player.coins >= 20 &&
      !state.players.some(
        (p, i) => i !== state.currentPlayerIndex && p.coins >= player.coins,
      ))
  ) {
    const logEntry: ILogEntry = {
      phase: 'victory',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: { winningPlayerIndex: state.currentPlayerIndex },
    }
    return {
      ...state,
      phase: 'gameOver',
      winningPlayerIndex: state.currentPlayerIndex,
      log: [...state.log, logEntry],
    }
  }

  const shipLocations = { ...state.shipLocations }
  delete shipLocations[state.currentPlayerIndex]
  return { ...state, phase: 'colonize', shipLocations }
}
