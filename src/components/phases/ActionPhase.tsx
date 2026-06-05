import React from 'react'
import ActionSelector, { FortTarget } from 'components/ActionSelector'
import GameBoard from 'components/GameBoard'
import IGameStateView from 'common/IGameStateView'
import { TurnBanner } from 'components/TurnBanner'

function buildAttackTargets(
  view: IGameStateView,
  currentPlayerIndex: number,
): FortTarget[] {
  const occupied = new Set<string>()
  for (const loc of Object.values(view.shipLocations)) {
    if (loc.targetPlayerIndex !== undefined && loc.fortID !== undefined) {
      occupied.add(`${loc.targetPlayerIndex}:${loc.fortID}`)
    }
  }
  const targets: FortTarget[] = []
  view.players.forEach((player, idx) => {
    if (idx === currentPlayerIndex) return
    for (const fort of player.forts) {
      if (occupied.has(`${idx}:${fort.id}`)) continue
      targets.push({
        targetPlayerIndex: idx,
        fortID: fort.id,
        label: `${player.name} — ${fort.name}`,
        fort,
      })
    }
  })
  return targets
}

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
  const attackTargets = buildAttackTargets(state, state.currentPlayerIndex)

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
          attackTargets={attackTargets}
          onSelect={(action, cardID, fortID, repairAt, targetPlayerIndex) =>
            dispatch({
              type: 'action',
              payload: {
                actionChosen: action,
                cardID,
                fortID,
                repairAt,
                targetPlayerIndex,
              },
            })
          }
        />
      )}
      <GameBoard state={state} dispatch={dispatch} />
    </div>
  )
}
