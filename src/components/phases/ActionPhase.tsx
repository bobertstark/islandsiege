import React from 'react'
import ActionSelector, { FortTarget } from 'components/ActionSelector'
import IGameStateView from 'common/IGameStateView'

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
        playerName: player.name,
        playerColor: player.color,
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
  const currentPlayer = state.players[state.currentPlayerIndex]
  const attackTargets = buildAttackTargets(state, state.currentPlayerIndex)

  if (!isMyTurn || !currentPlayer) return null

  return (
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
  )
}
