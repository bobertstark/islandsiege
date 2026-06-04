import IGameState from 'common/IGameState'

export function handleAttackStart(
  state: IGameState,
  payload: { targetPlayerIndex: number; fortID: string },
): IGameState {
  const shipLocations = {
    ...state.shipLocations,
    [state.currentPlayerIndex]: {},
  }
  const openWaterAttack = !state.players.some(p => p.forts.length >= 1)

  if (openWaterAttack) {
    return {
      ...state,
      shipLocations,
      attackIsOpenWater: true,
      phase: 'attackRoll',
    }
  }

  const alreadyTargeted = Object.values(shipLocations).some(
    loc => loc.targetPlayerIndex === payload.targetPlayerIndex,
  )
  if (alreadyTargeted) {
    throw new Error(`${payload.targetPlayerIndex} cannot be attacked.`)
  }

  return {
    ...state,
    attackIsOpenWater: false,
    shipLocations: {
      ...shipLocations,
      [state.currentPlayerIndex]: {
        targetPlayerIndex: payload.targetPlayerIndex,
        fortID: payload.fortID,
      },
    },
    phase: 'attackRoll',
  }
}
