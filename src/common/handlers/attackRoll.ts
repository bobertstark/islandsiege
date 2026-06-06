import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'
import { rollDice, rerollDice, reduceDice, rollCounts } from 'common/attackRoll'
import { createRng } from 'common/rng'
import { allLeadershipAbilities } from 'common/player'

export function nextPhaseAfterLeadership(
  bank: rollCounts,
  isOpenWater: boolean,
): Phase {
  if (isOpenWater) return 'attackReinforce'
  const hasWaveDice = (['B', 'W', 'G'] as const).some(s => (bank[s] ?? 0) > 0)
  return hasWaveDice ? 'attackWave1' : 'attackReinforceOrWave2'
}

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
    const bank = reduceDice(state.attackRoll!)
    const abilities = allLeadershipAbilities(
      state.players[state.currentPlayerIndex],
    )
    const lRolled = bank.L ?? 0
    const canAffordLeadership =
      abilities.length > 0 && lRolled >= Math.min(...abilities.map(a => a.cost))
    return {
      ...state,
      diceBank: bank,
      phase: canAffordLeadership
        ? 'attackLeadership'
        : nextPhaseAfterLeadership(bank, state.attackIsOpenWater),
    }
  }

  return state
}
