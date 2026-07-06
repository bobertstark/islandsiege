import IGameState from 'common/IGameState'
import { spendDice, addDice } from 'common/attackRoll'
import { allLeadershipAbilities, destroyShip } from 'common/player'
import { removeColonists } from 'common/fort'
import { nextPhaseAfterLeadership } from './attackRoll'
import { ILogEntry } from 'common/ILog'
import { DieValue } from 'common/die'

type Payload =
  | { effect: 'destroyShip'; shipID: string }
  | { effect: 'addDie'; face: DieValue }
  | { effect: 'gainCoin' }
  | { effect: 'returnFortColonist' }
  | { skip: true }

export function handleAttackLeadership(
  state: IGameState,
  payload?: Payload,
): IGameState {
  const hasL = (state.diceBank['L'] ?? 0) > 0
  if (!payload || 'skip' in payload || !hasL) {
    const skipEntry: ILogEntry = {
      phase: 'attackLeadership',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: { skip: true },
    }
    return {
      ...state,
      phase: nextPhaseAfterLeadership(state.diceBank, state.attackIsOpenWater),
      log: [...state.log, skipEntry],
    }
  }

  const attacker = state.players[state.currentPlayerIndex]
  const abilities = state.attackFlags?.banShipAbilities
    ? attacker.leadershipAbilities
    : allLeadershipAbilities(attacker)
  const ability = abilities.find(a => {
    if (a.effect !== payload.effect) return false
    if (payload.effect === 'addDie') return a.face === payload.face
    return true
  })
  if (!ability) {
    throw new Error(
      `Player ${attacker.id} has no leadership ability: ${payload.effect}`,
    )
  }

  const defenderIdx =
    state.shipLocations[state.currentPlayerIndex]!.targetPlayerIndex!
  const players = [...state.players]
  let newBank = spendDice(state.diceBank, 'L', ability.cost)
  let extraDiscard: (typeof state.discard)[number][] = []
  let logData: Record<string, unknown> = {
    effect: payload.effect,
    lSpent: ability.cost,
  }

  switch (payload.effect) {
    case 'destroyShip': {
      const { player: updatedDefender, card } = destroyShip(
        players[defenderIdx],
        payload.shipID,
      )
      players[defenderIdx] = updatedDefender
      extraDiscard = [card]
      logData = {
        ...logData,
        shipID: payload.shipID,
        targetPlayerIndex: defenderIdx,
        destroyedCardID: card.id,
      }
      break
    }
    case 'addDie':
      newBank = addDice(newBank, payload.face, 1)
      logData = { ...logData, face: payload.face }
      break
    case 'gainCoin':
      players[state.currentPlayerIndex] = {
        ...players[state.currentPlayerIndex],
        coins: players[state.currentPlayerIndex].coins + 1,
      }
      break
    case 'returnFortColonist': {
      const fortID = state.shipLocations[state.currentPlayerIndex]?.fortID
      if (fortID) {
        const fortIdx = players[defenderIdx].forts.findIndex(
          f => f.id === fortID,
        )
        if (fortIdx >= 0) {
          const forts = [...players[defenderIdx].forts]
          forts[fortIdx] = removeColonists(forts[fortIdx], 1).fort
          players[defenderIdx] = { ...players[defenderIdx], forts }
          logData = { ...logData, fortID }
        }
      }
      break
    }
  }

  const remainingL = newBank.L ?? 0
  const canRepeat = abilities.some(
    a =>
      remainingL >= a.cost &&
      (a.effect !== 'destroyShip' || players[defenderIdx].ships.length > 0),
  )

  const logEntry: ILogEntry = {
    phase: 'attackLeadership',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: logData,
  }
  return {
    ...state,
    players,
    discard: [...state.discard, ...extraDiscard],
    diceBank: newBank,
    phase: canRepeat
      ? 'attackLeadership'
      : nextPhaseAfterLeadership(newBank, state.attackIsOpenWater),
    log: [...state.log, logEntry],
  }
}
