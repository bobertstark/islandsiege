import { CubeColor } from 'common/colors'
import { GameState } from './GameState'

export type Game = {
  id: string
  state: GameState
}

export type CubeReserve = Record<CubeColor, number>
