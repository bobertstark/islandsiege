// TODO
// This should also render the GameBoard, but add additional checks for eligible actions
// Should highlight: deck (draw), playable cards in hand (build), forts to attack (or open water).

import React from 'react'
import ActionSelector from 'components/ActionSelector'
import GameBoard from 'components/GameBoard'
import IGameStateView from 'common/IGameStateView'

interface ActionPhaseProps {
  state: IGameStateView
  playerIdx: number
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const ActionPhase: React.FC<ActionPhaseProps> = ({
  state,
  playerIdx,
  dispatch,
}) => {
  const isMyTurn = state.currentPlayerIndex === playerIdx
  const activePlayer = state.players[state.currentPlayerIndex]

  return (
    <div>
      {isMyTurn ? (
        <ActionSelector
          onSelect={action =>
            dispatch({ type: 'action', payload: { actionChosen: action } })
          }
        />
      ) : (
        <p style={{ margin: '24px 0', color: '#888' }}>
          Waiting for {activePlayer?.name} to take their turn…
        </p>
      )}
      <GameBoard state={state} dispatch={dispatch} />
    </div>
  )
}
