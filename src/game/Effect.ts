import type { GameState } from '../types'
import type { Player } from './Player'

export type Effect = {
  id: string
  onPlayerAttack?: (gameState: GameState, player: Player) => GameState // e.g. "look at hand"
  onOpponentAttack?: (gameState: GameState, player: Player) => GameState // e.g. "cannot reroll"
  onLeadership?: (gameState: GameState, player: Player) => GameState // e.g. "gain 1 reroll"
  onSecondWave?: (gameState: GameState, player: Player) => GameState // e.g. "gain 1 reroll"
  onShipDestroyed?: (gameState: GameState, player: Player) => GameState // e.g. "return to hand"
  onPlayBuilding?: (gameState: GameState, player: Player) => GameState // e.g. "gain 1 coin"
  onOpponentBuild?: (gameState: GameState, player: Player) => GameState // e.g. "1 less coin"
  // from quick scan of cards, more might be needed
}
