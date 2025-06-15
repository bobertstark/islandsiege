import { Player } from './Player'
import { Deck } from './Deck'
import { Phase } from '../common/phases'

export type GameState = {
  players: Player[]
  currentPlayerIndex: number | undefined
  deck: Deck
  phase: Phase
  initDrawComplete: boolean
  gameOver: boolean
  winningPlayerIndex: number | undefined
}
