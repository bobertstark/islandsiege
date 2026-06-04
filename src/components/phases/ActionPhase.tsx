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
  isMyTurn,
  dispatch,
}) => {
  const activePlayerName = state.players[state.currentPlayerIndex]?.name ?? ''
  return (
    <div>
      <TurnBanner
        phase={state.phase}
        isMyTurn={isMyTurn}
        waitingFor={[activePlayerName]}
      />
      {isMyTurn && (
        <ActionSelector
          onSelect={action =>
            dispatch({ type: 'action', payload: { actionChosen: action } })
          }
        />
      )}
      <GameBoard state={state} dispatch={dispatch} />
    </div>
  )
}
