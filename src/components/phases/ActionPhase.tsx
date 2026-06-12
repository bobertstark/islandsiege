import React from 'react'
import ActionSelector, { FortTarget } from 'components/ActionSelector'
import ActionInstructions from 'components/ActionInstructions'
import IGameStateView from 'common/IGameStateView'
import {
  CARD_EFFECTS,
  ProhibitionType,
  prohibitionsAgainst,
} from 'common/cardEffects'

// Per-prohibition: which action it locks and how to phrase it.
const PROHIBITION_ACTION: Record<
  ProhibitionType,
  { action: string; verb: string } | undefined
> = {
  banDraw: { action: 'draw', verb: 'Drawing' },
  banBuildBuilding: { action: 'buildBuilding', verb: 'Building buildings' },
  banBuildShip: { action: 'buildShip', verb: 'Building ships' },
  banFortColonistGain: undefined, // affects colonize, not an action button
}

// Build notes for actions blocked by an opponent's in-play building, naming the
// offending building and its owner (derived from the public board).
function prohibitedNotes(
  view: IGameStateView,
  playerIndex: number,
): Partial<Record<string, string>> {
  const notes: Partial<Record<string, string>> = {}
  for (const type of prohibitionsAgainst(view.players, playerIndex)) {
    const meta = PROHIBITION_ACTION[type]
    if (!meta) continue
    for (let i = 0; i < view.players.length; i++) {
      if (i === playerIndex) continue
      const building = view.players[i].forts
        .flatMap(f => f.buildings)
        .find(b => CARD_EFFECTS[b.id]?.passive?.type === type)
      if (building) {
        notes[meta.action] =
          `${meta.verb} is blocked by ${view.players[i].name}'s ${building.name}.`
        break
      }
    }
  }
  return notes
}

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
        playerShips: player.ships ?? [],
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

  if (!isMyTurn || !currentPlayer) {
    return (
      <ActionInstructions
        title="Action Phase"
        description="Waiting for the active player to choose an action."
      />
    )
  }

  return (
    <>
      <ActionSelector
        player={currentPlayer}
        attackTargets={attackTargets}
        prohibitedNotes={prohibitedNotes(state, state.currentPlayerIndex)}
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
    </>
  )
}
