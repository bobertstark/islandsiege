import IGameState from 'common/IGameState'
import { rollDice, rerollDice, reduceDice } from 'common/attackRoll'
import { createRng } from 'common/rng'

export function handleAttackRoll(
  state: IGameState,
  payload: { action: 'init' | 'reroll' | 'keep'; diceIndicesReroll?: number[] },
): IGameState {
  const player = state.players[state.currentPlayerIndex]

  if (payload.action === 'init') {
    const rng = createRng(state.rngSeed)
    return {
      ...state,
      attackRoll: rollDice(player.attackDice, rng.next.bind(rng)),
      attackRerollsRemaining: player.diceRerolls,
      phase: 'attackRoll',
      rngSeed: rng.seed(),
    }
  }

  if (payload.action === 'reroll' && state.attackRerollsRemaining > 0) {
    const rng = createRng(state.rngSeed)
    const roll = rerollDice(
      state.attackRoll!,
      payload.diceIndicesReroll ?? [],
      rng.next.bind(rng),
    )
    return {
      ...state,
      attackRoll: roll,
      attackRerollsRemaining: state.attackRerollsRemaining - 1,
      phase: 'attackRoll',
      rngSeed: rng.seed(),
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
