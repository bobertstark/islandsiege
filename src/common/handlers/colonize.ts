import IGameState from 'common/IGameState'
import { populateForts } from 'common/player'
import { ILogEntry } from 'common/ILog'
import { prohibitionsAgainst } from 'common/cardEffects'

export function handleColonize(state: IGameState): IGameState {
  const playerBefore = state.players[state.currentPlayerIndex]
  const banned = prohibitionsAgainst(
    state.players,
    state.currentPlayerIndex,
  ).includes('banFortColonistGain')
  const players = [...state.players]
  players[state.currentPlayerIndex] = banned
    ? playerBefore
    : populateForts(playerBefore)
  const colonistsMoved =
    playerBefore.colonists - players[state.currentPlayerIndex].colonists
  const logEntry: ILogEntry = {
    phase: 'colonize',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: banned
      ? { colonistsMoved: 0, prohibited: 'banFortColonistGain' }
      : { colonistsMoved },
  }
  return { ...state, players, phase: 'action', log: [...state.log, logEntry] }
}
