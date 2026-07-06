import IGameState from 'common/IGameState'
import { symbolToColor } from 'common/colors'
import { DieValue } from 'common/die'
import { ILogEntry } from 'common/ILog'

export function handleAttackReinforce(state: IGameState): IGameState {
  if (state.attackFlags?.skipReinforce)
    return { ...state, phase: 'attackDestroy' }
  const players = [...state.players]
  const player = players[state.currentPlayerIndex]
  const reserve = { ...state.shellReserve }
  const shells = { ...player.shells }
  const allowed = ['G', 'W', 'B']

  for (const symb of Object.keys(state.diceBank)) {
    if (!allowed.includes(symb)) continue
    const color = symbolToColor(symb)
    const count = state.diceBank[symb as DieValue] ?? 0
    const avail = reserve[color] ?? 0
    const toGive = Math.min(count, avail)
    shells[color] = (shells[color] ?? 0) + toGive
    reserve[color] = avail - toGive
  }

  players[state.currentPlayerIndex] = { ...player, shells }

  const diceBank = { ...state.diceBank }
  for (const symb of allowed) delete diceBank[symb as DieValue]

  const shellsAdded: Record<string, number> = {}
  for (const symb of Object.keys(state.diceBank)) {
    if (!allowed.includes(symb)) continue
    const color = symbolToColor(symb)
    const added = (shells[color] ?? 0) - (player.shells[color] ?? 0)
    if (added > 0) shellsAdded[color] = added
  }
  const logEntry: ILogEntry = {
    phase: 'attackReinforce',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: { shellsAdded },
  }
  return {
    ...state,
    players,
    diceBank,
    shellReserve: reserve,
    phase: 'attackDestroy',
    log: [...state.log, logEntry],
  }
}
