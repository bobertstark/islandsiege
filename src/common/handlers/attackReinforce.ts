import IGameState from 'common/IGameState'
import { symbolToColor } from 'common/colors'
import { DieValue } from 'common/die'

export function handleAttackReinforce(state: IGameState): IGameState {
  const players = [...state.players]
  const player = players[state.currentPlayerIndex]
  const reserve = { ...state.shellReserve }
  const shells = { ...player.shells }
  const allowed = ['G', 'W', 'B']

  for (const symb of Object.keys(state.attackValueCounts)) {
    if (!allowed.includes(symb)) continue
    const color = symbolToColor(symb)
    const count = state.attackValueCounts[symb as DieValue] ?? 0
    const avail = reserve[color] ?? 0
    const toGive = Math.min(count, avail)
    shells[color] = (shells[color] ?? 0) + toGive
    reserve[color] = avail - toGive
  }

  players[state.currentPlayerIndex] = { ...player, shells }
  return { ...state, players, shellReserve: reserve, phase: 'attackDestroy' }
}
