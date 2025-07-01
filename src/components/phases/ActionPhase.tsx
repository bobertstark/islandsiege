// TODO
// This should also render the GameBoard, but add additional checks for eligible actions
// Should highlight: deck (draw), playable cards in hand (build), forts to attack (or open water).

import ActionSelector from 'components/ActionSelector'
import GameBoard from 'components/GameBoard'

export const ActionPhase = ({ state, dispatch }: any) => (
  <div>
    <ActionSelector onSelect={phase => dispatch({ type: phase })} />
    <GameBoard state={state} dispatch={dispatch} />
  </div>
)
