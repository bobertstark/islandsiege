import IGameState from 'common/IGameState'
import { findFort } from 'common/player'
import { destroyAt, shellInfo } from 'common/fortGrid'
import { ILogEntry } from 'common/ILog'

// Returns state entering nonActiveChoice (defender picks locations) or
// attackWave2 (attacker picks) depending on the guardedFortress flag.
export function transitionToWave2(state: IGameState): IGameState {
  if (state.attackFlags?.defenderChoosesWave2) {
    return {
      ...state,
      defenderChoice: { type: 'guardedWave2' },
      phase: 'nonActiveChoice',
    }
  }
  return { ...state, phase: 'attackWave2' }
}

// Destroy the chosen shells, consume the T dice, and advance to attackDestroy.
// Shared by the attacker-driven wave 2 (handleAttackWave2) and the defender-driven
// guardedFortress variant (handleNonActiveChoice), which differ only in the log's
// defenderEffect tag and whether a pending defenderChoice must be cleared.
export function applyWave2(
  state: IGameState,
  attackLocs: [number, number][],
  opts: { defenderEffect?: string; clearDefenderChoice?: boolean } = {},
): IGameState {
  const numT = state.diceBank['T'] ?? 0
  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)

  // Can't destroy more shells than exist — cap the requirement at available shells.
  const available = shellInfo(fort.grid).filter(s => s.color !== null).length
  const required = Math.min(numT, available)
  if (attackLocs.length !== required) {
    throw new Error(`Expected ${required} locations, got ${attackLocs.length}`)
  }

  let grid = fort.grid
  for (const loc of attackLocs) {
    grid = destroyAt(grid, loc)
  }

  players[targetPlayerIndex!] = {
    ...target,
    forts: target.forts.map(f => (f.id === fortID ? { ...fort, grid } : f)),
  }

  const logEntry: ILogEntry = {
    phase: 'attackWave2',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      ...(opts.defenderEffect ? { defenderEffect: opts.defenderEffect } : {}),
      targetPlayerIndex: targetPlayerIndex!,
      fortID: fortID!,
      attackLocs,
      tDiceUsed: numT,
    },
  }
  const diceBank = { ...state.diceBank }
  delete diceBank['T']

  return {
    ...state,
    players,
    diceBank,
    ...(opts.clearDefenderChoice ? { defenderChoice: undefined } : {}),
    phase: 'attackDestroy',
    log: [...state.log, logEntry],
  }
}

export function handleAttackWave2(
  state: IGameState,
  payload: { attackLocs: [number, number][] },
): IGameState {
  return applyWave2(state, payload.attackLocs)
}
