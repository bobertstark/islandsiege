import IGameState from 'common/IGameState'
import { spendDice } from 'common/attackRoll'
import { allLeadershipAbilities, destroyShip } from 'common/player'
import { nextPhaseAfterLeadership } from './attackRoll'

type Payload = { effect: 'destroyShip'; shipID: string } | { skip: true }

export function handleAttackLeadership(
  state: IGameState,
  payload: Payload,
): IGameState {
  if ('skip' in payload) {
    return {
      ...state,
      phase: nextPhaseAfterLeadership(state.diceBank, state.attackIsOpenWater),
    }
  }

  const attacker = state.players[state.currentPlayerIndex]
  const ability = allLeadershipAbilities(attacker).find(
    a => a.effect === payload.effect,
  )
  if (!ability) {
    throw new Error(
      `Player ${attacker.id} has no leadership ability: ${payload.effect}`,
    )
  }

  const defenderIdx =
    state.shipLocations[state.currentPlayerIndex]!.targetPlayerIndex!
  const players = [...state.players]
  const { player: updatedDefender, card } = destroyShip(
    players[defenderIdx],
    payload.shipID,
  )
  players[defenderIdx] = updatedDefender
  const newBank = spendDice(state.diceBank, 'L', ability.cost)
  const remainingL = newBank.L ?? 0
  const defenderShipsLeft = players[defenderIdx].ships.length
  const canRepeat =
    remainingL >= ability.cost &&
    defenderShipsLeft > 0 &&
    allLeadershipAbilities(players[state.currentPlayerIndex]).some(
      a => a.effect === 'destroyShip' && remainingL >= a.cost,
    )

  return {
    ...state,
    players,
    discard: [...state.discard, card],
    diceBank: newBank,
    phase: canRepeat
      ? 'attackLeadership'
      : nextPhaseAfterLeadership(newBank, state.attackIsOpenWater),
  }
}
