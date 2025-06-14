import { Player } from './Player'
import { Deck } from './Deck'
import { Phase } from '../common/phases'

export type GameState = {
  players: Player[]
  currentPlayerIndex: number
  deck: Deck
  phase: Phase
  initDrawComplete: boolean
  gameOver: boolean
  winningPlayerIndex: number
}
