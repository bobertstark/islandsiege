import IGameState from 'common/IGameState'
import { spendDice } from 'common/attackRoll'
import { destroyShip } from 'common/player'

type Payload = { shipID: string } | { skip: true }

export function handleAttackLeadership(
  state: IGameState,
  payload: Payload,
): IGameState {
  const nextPhase = state.attackIsOpenWater ? 'attackReinforce' : 'attackWave1'

  if ('skip' in payload) {
    return { ...state, phase: nextPhase }
  }

  const defenderIdx =
    state.shipLocations[state.currentPlayerIndex]!.targetPlayerIndex!
  const players = [...state.players]
  players[defenderIdx] = destroyShip(players[defenderIdx], payload.shipID)
  const newBank = spendDice(state.diceBank, 'L', 2)
  const remainingL = newBank.L ?? 0
  const defenderShipsLeft = players[defenderIdx].ships.length
  const stayInPhase = remainingL >= 2 && defenderShipsLeft > 0

  return {
    ...state,
    players,
    diceBank: newBank,
    phase: stayInPhase ? 'attackLeadership' : nextPhase,
  }
}
