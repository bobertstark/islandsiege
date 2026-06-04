import IGameState from 'common/IGameState'
import { rollDice, rerollDice, reduceDice } from 'common/attackRoll'

export function handleAttackRoll(
  state: IGameState,
  payload: { action: 'init' | 'reroll' | 'keep'; diceIndicesReroll?: number[] },
): IGameState {
  const player = state.players[state.currentPlayerIndex]

  if (payload.action === 'init') {
    return {
      ...state,
      attackRoll: rollDice(player.attackDice),
      attackRerollsRemaining: player.diceRerolls,
      phase: 'attackRoll',
    }
  }

  if (payload.action === 'reroll' && state.attackRerollsRemaining > 0) {
    const roll = rerollDice(state.attackRoll!, payload.diceIndicesReroll ?? [])
    return {
      ...state,
      attackRoll: roll,
      attackRerollsRemaining: state.attackRerollsRemaining - 1,
      phase: 'attackRoll',
    }
  }

  if (payload.action === 'keep' || state.attackRerollsRemaining === 0) {
    return {
      ...state,
      attackValueCounts: reduceDice(state.attackRoll!),
      phase: 'attackLeadership',
    }
  }

  return state
}
