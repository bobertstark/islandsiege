import IGameState from 'common/IGameState'

export function handleAttackReinforceOrWave2(
  state: IGameState,
  payload: { choice: 'reinforce' | 'wave2' },
): IGameState {
  const remainingT = state.diceBank['T'] ?? 0
  return {
    ...state,
    phase:
      remainingT === 0 || payload.choice === 'reinforce'
        ? 'attackReinforce'
        : 'attackWave2',
  }
}
