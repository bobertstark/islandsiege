import { StateMachine } from 'common/stateMachine'
import { GamePhases } from 'common/phases'

const initMock = jest.fn((parameters_: GameState) => {})
const attackStartMock = jest.fn((parameters_: GameState) => {})
const gameOverMock = jest.fn((parameters_: GameState) => {})

export const testStateMap: stateMapping[] = {
  initGame: {
    stateFunc: initMock,
    transitions: [GamePhases.attackStart, GamePhases.gameOver],
  },
  attackStart: {
    stateFunc: attackStartMock,
    transitions: [GamePhases.gameOver],
  },
  gameOver: {
    stateFunc: gameOverMock,
    transitions: [],
  },
}
