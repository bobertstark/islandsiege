// TODO
// This should also render the GameBoard, but add additional checks for eligible actions
// Should highlight: deck (draw), playable cards in hand (build), forts to attack (or open water).

import React from 'react'
import ActionSelector from 'components/ActionSelector'
import GameBoard from 'components/GameBoard'
import IGameStateView from 'common/IGameStateView'
import { TurnBanner } from 'components/TurnBanner'

interface ActionPhaseProps {
  state: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const ActionPhase: React.FC<ActionPhaseProps> = ({
  state,
  playerIdx: _playerIdx,
  isMyTurn,
  dispatch,
}) => {
  const activePlayerName = state.players[state.currentPlayerIndex]?.name ?? ''
  const currentPlayer = state.players[state.currentPlayerIndex]

  return (
    <div>
      <TurnBanner
        phase={state.phase}
        isMyTurn={isMyTurn}
        waitingFor={[activePlayerName]}
      />
      {isMyTurn && currentPlayer && (
        <ActionSelector
          player={currentPlayer}
          onSelect={(action, cardID) =>
            dispatch({
              type: 'action',
              payload: { actionChosen: action, cardID },
            })
          }
        />
      )}
      <GameBoard state={state} dispatch={dispatch} />
    </div>
  )
}
