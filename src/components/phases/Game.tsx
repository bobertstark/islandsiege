import React, { useReducer, useState } from 'react'
import { PLAYER_COLORS } from 'common/colors'
import './Game.css'
import '../shared.css'
import { InitPhase } from './InitPhase'
import { GamePhases } from 'common/phases'
import { gameReducer } from 'common/gameReducer'
import { createDeck } from 'common/deck'
import IGameState from 'common/IGameState'
import GameBoard from '../GameBoard'
import { Deck, Discard } from '../Deck'
import { ActionPhase } from './ActionPhase'

function createInitialGameState(): IGameState {
  const deckState = createDeck()
  return {
    players: [],
    currentPlayerIndex: 0,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    phase: GamePhases.initGame,
    pending: {},
    shipLocations: {},
    shellReserve: {} as any,
    attackIsOpenWater: false,
    attackRoll: undefined,
    attackRerollsRemaining: 0,
    attackValueCounts: {},
    winningPlayerIndex: undefined,
  }
}

const MainGame = ({ state, dispatch }: any) => (
  <div className="game-container">
    <h1>Island Siege</h1>
    <div className="game-header">
      <Deck count={state.deck?.length} onDraw={() => {}} />
      <Discard count={state.discard?.length ?? 0} />
    </div>
    <GameBoard state={state} dispatch={dispatch} />
  </div>
)

const Game: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState())
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [playerColors, setPlayerColors] = useState([
    PLAYER_COLORS[0].value,
    PLAYER_COLORS[1].value,
  ])

  const handleStartGame = (names: string[], colors: string[]) => {
    dispatch({
      type: GamePhases.initGame,
      payload: { playerNames: names, playerColors: colors },
    })
  }

  const renderPhase = () => {
    switch (state.phase) {
      case GamePhases.initGame:
      default:
        if (state.players.length === 0) {
          return (
            <InitPhase
              playerNames={playerNames}
              setPlayerNames={setPlayerNames}
              playerColors={playerColors}
              setPlayerColors={setPlayerColors}
              handleStartGame={handleStartGame}
            />
          )
        }
        return <MainGame state={state} dispatch={dispatch} />
      case GamePhases.initDistribute:
        return <MainGame state={state} dispatch={dispatch} />
      case GamePhases.action:
        return <ActionPhase state={state} dispatch={dispatch} />
    }
  }

  return renderPhase()
}

export default Game
