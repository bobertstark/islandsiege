import IGameState from 'common/IGameState'
import { ShellColor } from 'common/colors'
import { ILogEntry } from 'common/ILog'

export function handleNonActiveChoice(
  state: IGameState,
  payload: { shellColor?: ShellColor; shipID?: string },
): IGameState {
  const spec = state.defenderChoice
  if (!spec) return state

  switch (spec.type) {
    case 'saboteurShell': {
      const color = payload.shellColor
      if (!color) throw new Error('saboteurShell requires shellColor')
      const attackerIdx = state.currentPlayerIndex
      const attacker = state.players[attackerIdx]
      const current = attacker.shells[color] ?? 0
      if (current <= 0) throw new Error(`Attacker has no ${color} shells`)
      const players = [...state.players]
      players[attackerIdx] = {
        ...attacker,
        shells: { ...attacker.shells, [color]: current - 1 },
      }
      const logEntry: ILogEntry = {
        phase: 'action',
        playerIndex: attackerIdx,
        turn: state.currentPlayerIndex,
        timestamp: new Date().toISOString(),
        data: { defenderEffect: 'saboteurDestroyCube', shellColor: color },
      }
      return {
        ...state,
        players,
        defenderChoice: undefined,
        phase: 'attackRoll',
        log: [...state.log, logEntry],
      }
    }
    case 'coveShip': {
      const shipID = payload.shipID
      if (!shipID) throw new Error('coveShip requires shipID')
      const attackerIdx = state.currentPlayerIndex
      const attacker = state.players[attackerIdx]
      const shipIdx = attacker.ships.findIndex(s => s.id === shipID)
      if (shipIdx < 0) throw new Error(`Ship ${shipID} not found`)
      if (attacker.ships[shipIdx].colonists <= 0)
        throw new Error(`Ship ${shipID} has no colonists`)
      const ships = [...attacker.ships]
      ships[shipIdx] = {
        ...ships[shipIdx],
        colonists: ships[shipIdx].colonists - 1,
      }
      const players = [...state.players]
      players[attackerIdx] = { ...attacker, ships }
      const logEntry: ILogEntry = {
        phase: 'action',
        playerIndex: attackerIdx,
        turn: state.currentPlayerIndex,
        timestamp: new Date().toISOString(),
        data: { defenderEffect: 'returnAttackerShipColonist', shipID },
      }
      return {
        ...state,
        players,
        defenderChoice: undefined,
        phase: 'attackRoll',
        log: [...state.log, logEntry],
      }
    }
    default:
      return state
  }
}
