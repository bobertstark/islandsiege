import IGameState from 'common/IGameState'
import { findFort } from 'common/player'
import { shellsRemaining } from 'common/fortGrid'
import { transitionToWave2 } from './attackWave2'

// Returns the auto-resolved next phase, or null when a player choice is required.
export function resolvePostWave1Phase(
  state: IGameState,
): IGameState['phase'] | null {
  const shelledDice =
    (state.diceBank['G'] ?? 0) +
    (state.diceBank['B'] ?? 0) +
    (state.diceBank['W'] ?? 0)
  const targetDice = state.diceBank['T'] ?? 0

  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex] ?? {}
  const targetFort =
    targetPlayerIndex != null && fortID != null
      ? findFort(state.players[targetPlayerIndex], fortID)
      : null
  const remainingShellCells = targetFort ? shellsRemaining(targetFort.grid) : 0

  const canWave2 = targetDice > 0 && remainingShellCells > 0
  const canReinforce = shelledDice > 0 && !state.attackFlags?.skipReinforce

  if (!canWave2 && !canReinforce) return 'attackDestroy'
  if (canReinforce && !canWave2) return 'attackReinforce'
  if (canWave2 && !canReinforce) return 'attackWave2'
  return null // genuine choice
}

export function handleAttackReinforceOrWave2(
  state: IGameState,
  payload: { choice: 'reinforce' | 'wave2' },
): IGameState {
  if (payload.choice === 'wave2') return transitionToWave2(state)
  return { ...state, phase: 'attackReinforce' }
}
