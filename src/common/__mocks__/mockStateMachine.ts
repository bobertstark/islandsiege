import { State, stateMap, StateMachine } from 'common/stateMachine'

const initMock = jest.fn((parameters_: any) => {})
const attackStartMock = jest.fn((parameters_: any) => {})
const gameOverMock = jest.fn((parameters_: any) => {})

function trial(parameters_: any): State {
  return 'invalid'
}

export enum GameStates {
  initGame = 'initGame',
  attackStart = 'attackStart',
  gameOver = 'gameOver',
}
export let testStateMap: stateMap = {
  [GameStates.initGame]: {
    stateFunc: initMock,
    transitions: [GameStates.attackStart, GameStates.gameOver],
  },
  [GameStates.attackStart]: {
    stateFunc: attackStartMock,
    transitions: [GameStates.gameOver],
  },
  [GameStates.gameOver]: {
    stateFunc: gameOverMock,
    transitions: [],
  },
}
