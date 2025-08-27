import { jest } from '@jest/globals'
import {
  stateFuncSig,
  State,
  stateMap,
  StateMachine,
} from 'common/stateMachine'

const initMock = jest.fn<stateFuncSig>()
const attackStartMock = jest.fn<stateFuncSig>()
const gameOverMock = jest.fn<stateFuncSig>()

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
