import IGameState from 'common/IGameState'
import { createFortById } from 'common/cardRegistry'
import { addFort, findFort } from 'common/player'
import { buildSpec, FortGridSpec } from 'common/fortGrid'
import { symbolToColor } from 'common/colors'
import IFort from 'common/IFort'

export function handleBuildFort(
  state: IGameState,
  payload: { fortID: string; fortGridSpec: FortGridSpec },
): IGameState {
  const players = [...state.players]
  let player = players[state.currentPlayerIndex]

  const fort = createFortById(payload.fortID)
  player = addFort(player, fort)

  let shellsBuilt = 0
  let updatedGrid = fort.grid

  for (const spec of payload.fortGridSpec) {
    const color = symbolToColor(spec[2]) as 'black' | 'white' | 'gray'
    if ((player.shells[color] ?? 0) > 0) {
      const { grid: nextGrid, builds } = buildSpec(updatedGrid, [spec])
      updatedGrid = nextGrid
      shellsBuilt += builds
      player = {
        ...player,
        shells: { ...player.shells, [color]: (player.shells[color] ?? 0) - 1 },
      }
    } else {
      throw new Error(`Player does not have enough ${color}`)
    }
  }

  if (payload.fortGridSpec.length !== shellsBuilt) {
    throw new Error(`Could not build all components on ${fort.id}`)
  }

  // Write the updated grid back into the fort on the player
  const updatedFort: IFort = { ...fort, grid: updatedGrid }
  player = {
    ...player,
    coins: player.coins + shellsBuilt,
    forts: player.forts.map(f => (f.id === fort.id ? updatedFort : f)),
  }

  players[state.currentPlayerIndex] = player
  return { ...state, players, phase: 'endTurn' }
}
