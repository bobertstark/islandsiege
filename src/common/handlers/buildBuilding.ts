import IGameState from 'common/IGameState'
import { createBuildingById } from 'common/cardRegistry'
import { findFort, removeCardInHand } from 'common/player'
import { addBuilding } from 'common/fort'
import { ILogEntry } from 'common/ILog'
import {
  applyOnBuildEffect,
  EffectTarget,
} from 'common/handlers/onBuildEffects'
import { CARD_EFFECTS } from 'common/cardEffects'

export function handleBuildBuilding(
  state: IGameState,
  payload: {
    fortID: string
    buildingID: string
    repairAt?: [number, number]
    effectTarget?: EffectTarget
  },
): IGameState {
  const players = [...state.players]
  let player = players[state.currentPlayerIndex]
  const fort = findFort(player, payload.fortID)
  const building = createBuildingById(payload.buildingID)
  const updatedFort = addBuilding(fort, building, payload.repairAt)
  const { player: updatedPlayer } = removeCardInHand(player, payload.buildingID)
  players[state.currentPlayerIndex] = {
    ...updatedPlayer,
    coins: updatedPlayer.coins + building.coins,
    forts: updatedPlayer.forts.map(f =>
      f.id === payload.fortID ? updatedFort : f,
    ),
  }
  const logEntry: ILogEntry = {
    phase: 'buildBuilding',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      cardID: payload.buildingID,
      fortID: payload.fortID,
      colonistsMoved: building.cost,
      repairUsed: payload.repairAt !== undefined,
    },
  }
  const placed: IGameState = {
    ...state,
    players,
    log: [...state.log, logEntry],
  }
  let resolved = applyOnBuildEffect(
    placed,
    state.currentPlayerIndex,
    payload.buildingID,
    payload.effectTarget,
  )

  if (CARD_EFFECTS[payload.fortID]?.passive?.type === 'robustGainCoin') {
    const rPlayers = [...resolved.players]
    rPlayers[state.currentPlayerIndex] = {
      ...rPlayers[state.currentPlayerIndex],
      coins: rPlayers[state.currentPlayerIndex].coins + 1,
    }
    const robustEntry: ILogEntry = {
      phase: 'buildBuilding',
      playerIndex: state.currentPlayerIndex,
      turn: state.currentPlayerIndex,
      timestamp: new Date().toISOString(),
      data: { onBuild: 'robustGainCoin' },
    }
    resolved = {
      ...resolved,
      players: rPlayers,
      log: [...resolved.log, robustEntry],
    }
  }

  return { ...resolved, phase: 'endTurn', pendingBuildCardID: undefined }
}
