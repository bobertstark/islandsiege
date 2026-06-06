import IGameState from 'common/IGameState'
import { ILogEntry } from 'common/ILog'

export function handleEndTurn(state: IGameState): IGameState {
  const next = (state.currentPlayerIndex + 1) % state.players.length
  const turnEntry: ILogEntry = {
    phase: 'endTurn',
    playerIndex: next,
    turn: next,
    timestamp: new Date().toISOString(),
    data: { newTurn: true },
  }
  return {
    ...state,
    currentPlayerIndex: next,
    phase: 'victory',
    attackRoll: undefined,
    attackRerollsRemaining: 0,
    diceBank: {},
    attackIsOpenWater: false,
    log: [...state.log, turnEntry],
  }
}
