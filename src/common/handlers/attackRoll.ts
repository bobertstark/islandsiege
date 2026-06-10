import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'
import { rollDice, rerollDice, reduceDice, rollCounts } from 'common/attackRoll'
import { createRng } from 'common/rng'
import { allLeadershipAbilities } from 'common/player'
import { ILogEntry } from 'common/ILog'
import { attackerBonusDice } from 'common/cardEffects'

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
    if (state.attackRoll !== undefined) return state
    const rng = createRng(state.rngSeed)
    const roll = [
      ...rollDice(player.attackDice, rng.next.bind(rng)),
      ...attackerBonusDice(player),
    ]
    const initEntry: ILogEntry = {
      phase: 'attackRoll',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: { roll, rerollsRemaining: player.diceRerolls },
    }
    return {
      ...state,
      attackRoll: roll,
      attackRerollsRemaining: player.diceRerolls,
      phase: 'attackRoll',
      rngSeed: rng.seed(),
      log: [...(state.log ?? []), initEntry],
    }
  }

  if (payload.action === 'reroll' && state.attackRerollsRemaining > 0) {
    const rng = createRng(state.rngSeed)
    // Bonus dice occupy the trailing slots and are fixed — drop them from reroll.
    const baseCount =
      state.attackRoll!.length - attackerBonusDice(player).length
    const indices = (payload.diceIndicesReroll ?? []).filter(i => i < baseCount)
    const roll = rerollDice(state.attackRoll!, indices, rng.next.bind(rng))
    const rerollEntry: ILogEntry = {
      phase: 'attackRoll',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: {
        roll,
        rerollsRemaining: state.attackRerollsRemaining - 1,
      },
    }
    return {
      ...state,
      attackRoll: roll,
      attackRerollsRemaining: state.attackRerollsRemaining - 1,
      phase: 'attackRoll',
      rngSeed: rng.seed(),
      log: [...(state.log ?? []), rerollEntry],
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
    const totalRerolls = player.diceRerolls - state.attackRerollsRemaining
    const finalizeEntry: ILogEntry = {
      phase: 'attackRoll',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: {
        finalRoll: state.attackRoll,
        totalRerolls,
      },
    }
    return {
      ...state,
      diceBank: bank,
      phase: 'attackLeadership',
      log: [...(state.log ?? []), finalizeEntry],
    }
  }

  return state
}
