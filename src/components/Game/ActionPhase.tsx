import ActionSelector from 'components/ActionSelector'
import GameBoard from 'components/GameBoard'

export const ActionPhase = ({ state, dispatch }: any) => (
  <div>
    <ActionSelector onSelect={phase => dispatch({ type: phase })} />
    <GameBoard state={state} dispatch={dispatch} />
  </div>
)
