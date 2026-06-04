import IGameState from 'common/IGameState'
import type { Phase } from 'common/phases'
import { GamePhases } from 'common/phases'

import { handleInitGame } from 'common/handlers/initGame'
import { handleStartGame } from 'common/handlers/startGame'
import { handleSetColor } from 'common/handlers/setColor'
import { handleInitDiscard } from 'common/handlers/initDiscard'
import { handleDraw } from 'common/handlers/draw'
import { handleDiscard } from 'common/handlers/discard'
import { handleVictory } from 'common/handlers/victory'
import { handleColonize } from 'common/handlers/colonize'
import { handleAction } from 'common/handlers/action'
import { handleBuildFort } from 'common/handlers/buildFort'
import { handleBuildBuilding } from 'common/handlers/buildBuilding'
import { handleBuildShip } from 'common/handlers/buildShip'
import { handleAttackStart } from 'common/handlers/attackStart'
import { handleAttackRoll } from 'common/handlers/attackRoll'
import { handleAttackLeadership } from 'common/handlers/attackLeadership'
import { handleAttackWave1 } from 'common/handlers/attackWave1'
import { handleAttackReinforceOrWave2 } from 'common/handlers/attackReinforceOrWave2'
import { handleAttackReinforce } from 'common/handlers/attackReinforce'
import { handleAttackWave2 } from 'common/handlers/attackWave2'
import { handleAttackDestroy } from 'common/handlers/attackDestroy'
import { handleEndTurn } from 'common/handlers/endTurn'

export function gameReducer(
  state: IGameState,
  phase: { type: Phase; payload?: any },
): IGameState {
  switch (phase.type) {
    case GamePhases.startGame:
      return handleStartGame(state, phase.payload)
    case GamePhases.setColor:
      return handleSetColor(state, phase.payload)
    case GamePhases.initGame:
      return handleInitGame(state, phase.payload)
    case GamePhases.initDiscard:
      return handleInitDiscard(state, phase.payload)
    case GamePhases.draw:
      return handleDraw(state)
    case GamePhases.discard:
      return handleDiscard(state, phase.payload)
    case GamePhases.victory:
      return handleVictory(state)
    case GamePhases.colonize:
      return handleColonize(state)
    case GamePhases.action:
      return handleAction(state, phase.payload)
    case GamePhases.buildFort:
      return handleBuildFort(state, phase.payload)
    case GamePhases.buildBuilding:
      return handleBuildBuilding(state, phase.payload)
    case GamePhases.buildShip:
      return handleBuildShip(state, phase.payload)
    case GamePhases.attackStart:
      return handleAttackStart(state, phase.payload)
    case GamePhases.attackRoll:
      return handleAttackRoll(state, phase.payload)
    case GamePhases.attackLeadership:
      return handleAttackLeadership(state, phase.payload)
    case GamePhases.attackWave1:
      return handleAttackWave1(state, phase.payload)
    case GamePhases.attackReinforceOrWave2:
      return handleAttackReinforceOrWave2(state, phase.payload)
    case GamePhases.attackReinforce:
      return handleAttackReinforce(state)
    case GamePhases.attackWave2:
      return handleAttackWave2(state, phase.payload)
    case GamePhases.attackDestroy:
      return handleAttackDestroy(state)
    case GamePhases.endTurn:
      return handleEndTurn(state)
    default:
      return state
  }
}
