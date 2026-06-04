import IGameState from 'common/IGameState'

export function handleAttackLeadership(state: IGameState): IGameState {
  // TODO: Add leadership use logic
  return {
    ...state,
    phase: state.attackIsOpenWater ? 'attackReinforce' : 'attackWave1',
  }
}
