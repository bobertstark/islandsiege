import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'
import {
  rollDice,
  rerollDice,
  reduceDice,
  addDice,
  rollCounts,
} from 'common/attackRoll'
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
    // Defender forts may reduce the attacker's dice and rerolls.
    const diceCount = Math.max(
      1,
      player.attackDice - (state.attackFlags?.attackerDiceMinus ?? 0),
    )
    const rerolls = Math.max(
      0,
      player.diceRerolls - (state.attackFlags?.attackerRerollsMinus ?? 0),
    )
    const roll = rollDice(diceCount, rng.next.bind(rng))
    const bonusDice = attackerBonusDice(player)
    const bonusBank = bonusDice.reduce(
      (b, { face }) => addDice(b, face, 1),
      {} as rollCounts,
    )
    const ts = new Date().toISOString()
    const mk = (data: Record<string, unknown>): ILogEntry => ({
      phase: 'attackRoll',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: ts,
      data,
    })
    const bonusEntries = bonusDice.map(({ face, cardID }) =>
      mk({ bonusDie: face, cardID }),
    )
    return {
      ...state,
      attackRoll: roll,
      attackRerollsRemaining: rerolls,
      diceBank: bonusBank,
      phase: 'attackRoll',
      rngSeed: rng.seed(),
      log: [
        ...(state.log ?? []),
        ...bonusEntries,
        mk({ roll, rerollsRemaining: rerolls }),
      ],
    }
  }

  if (payload.action === 'reroll' && state.attackRerollsRemaining > 0) {
    const rng = createRng(state.rngSeed)
    const banned = state.attackFlags?.banRerollFaces ?? []
    const rollLen = state.attackRoll!.length
    // steepWalledStronghold: a reroll must re-roll every die.
    const requested = state.attackFlags?.mustRerollAll
      ? Array.from({ length: rollLen }, (_, i) => i)
      : (payload.diceIndicesReroll ?? [])
    const indices = requested.filter(
      i => i < rollLen && !banned.includes(state.attackRoll![i]),
    )
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
    const bank = attackerBonusDice(player).reduce(
      (b, { face }) => addDice(b, face, 1),
      reduceDice(state.attackRoll!),
    )
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
