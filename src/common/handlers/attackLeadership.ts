import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'
import { spendDice } from 'common/attackRoll'
import { destroyShip } from 'common/player'

type Payload = { shipID: string } | { skip: true }

export function handleAttackLeadership(
  state: IGameState,
  payload: Payload,
): IGameState {
  function wavePhase(bank: typeof state.diceBank): Phase {
    if (state.attackIsOpenWater) return 'attackReinforce'
    const hasWaveDice = (['B', 'W', 'G'] as const).some(s => (bank[s] ?? 0) > 0)
    return hasWaveDice ? 'attackWave1' : 'attackReinforceOrWave2'
  }

  if ('skip' in payload) {
    return { ...state, phase: wavePhase(state.diceBank) }
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
    phase: stayInPhase ? 'attackLeadership' : wavePhase(newBank),
  }
}
