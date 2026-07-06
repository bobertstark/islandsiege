import IGameState from 'common/IGameState'
import { ShellColor } from 'common/colors'
import { ILogEntry } from 'common/ILog'
import { createRng } from 'common/rng'
import { rerollDice } from 'common/attackRoll'
import { finalizeRoll } from 'common/handlers/attackRoll'
import { applyWave2 } from 'common/handlers/attackWave2'

export function handleNonActiveChoice(
  state: IGameState,
  payload: {
    shellColor?: ShellColor
    shipID?: string
    dieIndex?: number
    attackLocs?: [number, number][]
    finalize?: boolean
  },
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
    case 'barricadedReroll': {
      const attackerIdx = state.currentPlayerIndex

      // Finalize step: the reroll already happened and the client has shown the
      // result; commit the roll into the dice bank and advance.
      if (payload.finalize) {
        return finalizeRoll(
          { ...state, defenderChoice: undefined },
          state.attackRoll!,
        )
      }

      const currentRoll = state.attackRoll!

      // Reroll step: apply the chosen die's reroll but stay in this phase so the
      // client can animate the die landing on its new value before finalizing.
      if (payload.dieIndex !== undefined) {
        const idx = payload.dieIndex
        if (idx < 0 || idx >= currentRoll.length)
          throw new Error(`Invalid die index ${idx}`)
        const rng = createRng(state.rngSeed)
        const attackRoll = rerollDice(currentRoll, [idx], rng.next.bind(rng))
        const logEntry: ILogEntry = {
          phase: 'attackRoll',
          playerIndex: attackerIdx,
          turn: attackerIdx,
          timestamp: new Date().toISOString(),
          data: {
            defenderEffect: 'barricadedReroll',
            dieIndex: idx,
            result: attackRoll[idx],
          },
        }
        return {
          ...state,
          attackRoll,
          rngSeed: rng.seed(),
          defenderChoice: { type: 'barricadedReroll', rerolledIndex: idx },
          log: [...state.log, logEntry],
        }
      }

      // Pass step: no reroll, finalize directly.
      const logEntry: ILogEntry = {
        phase: 'attackRoll',
        playerIndex: attackerIdx,
        turn: attackerIdx,
        timestamp: new Date().toISOString(),
        data: { defenderEffect: 'barricadedReroll', skipped: true },
      }
      return finalizeRoll(
        { ...state, defenderChoice: undefined, log: [...state.log, logEntry] },
        currentRoll,
      )
    }
    case 'guardedWave2': {
      const locs = payload.attackLocs
      if (!locs) throw new Error('guardedWave2 requires attackLocs')
      return applyWave2(state, locs, {
        defenderEffect: 'guardedWave2',
        clearDefenderChoice: true,
      })
    }
    default:
      return state
  }
}
