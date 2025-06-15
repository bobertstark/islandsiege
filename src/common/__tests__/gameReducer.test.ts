import { Game } from 'types'
import { gameReducer } from '../gameReducer'
import { GamePhases } from '../phases'

import type { GameState } from 'game/GameState'
import { Player } from 'game/Player'
import { Deck } from 'game/Deck'

describe('gameReducer', () => {
  let gs: GameState
  beforeEach(() => {
    gs = {
      players: [new Player('Francis Drake', 1), new Player('Barbarossa', 2)],
      currentPlayerIndex: undefined,
      deck: new Deck(),
      phase: 'initGame',
      initDrawComplete: true,
      gameOver: false,
      winningPlayerIndex: undefined,
    }
  })
  it('should initialize the game', () => {
    const payload = {
      type: GamePhases.initGame,
      payload: { playerNames: ['Jack', 'Sparrow'] },
    }
    const state = gameReducer(gs, payload)
    expect(state.players.length).toBe(2)
    expect(state.players[0].name).toBe('Jack')
    expect(state.players[1].name).toBe('Sparrow')
    expect(state.phase).toBe('draw')
  })

  it('should handle draw phase', () => {
    const payload = { type: GamePhases.draw }
    const state = gameReducer(gs, payload)
    expect(state.players.every(player => player.hand.length === 3))
    expect(state.phase).toBe('giveCard')
  })
})
