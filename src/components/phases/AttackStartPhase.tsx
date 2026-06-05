import React from 'react'
import IGameStateView from 'common/IGameStateView'
import { TurnBanner } from 'components/TurnBanner'
import GameBoard from 'components/GameBoard'

interface AttackStartPhaseProps {
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}

interface FortTarget {
  targetPlayerIndex: number
  fortID: string
  label: string
}

function buildTargets(
  view: IGameStateView,
  currentPlayerIndex: number,
): FortTarget[] {
  const occupied = new Set<string>()
  for (const [, loc] of Object.entries(view.shipLocations)) {
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
      })
    }
  })
  return targets
}

export const AttackStartPhase: React.FC<AttackStartPhaseProps> = ({
  view,
  playerIdx: _playerIdx,
  isMyTurn,
  waitingFor,
  dispatch,
}) => {
  const targets = buildTargets(view, view.currentPlayerIndex)
  const isOpenWaters = targets.length === 0

  function handleSelect(target: FortTarget) {
    dispatch({
      type: 'attackStart',
      payload: {
        targetPlayerIndex: target.targetPlayerIndex,
        fortID: target.fortID,
      },
    })
  }

  function handleOpenWaters() {
    dispatch({
      type: 'attackStart',
      payload: { targetPlayerIndex: -1, fortID: '' },
    })
  }

  return (
    <div>
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && (
        <div style={{ padding: '16px 20px' }}>
          <h2>Select attack target</h2>
          {isOpenWaters ? (
            <button onClick={handleOpenWaters}>Open Waters</button>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {targets.map(t => (
                <li
                  key={`${t.targetPlayerIndex}-${t.fortID}`}
                  style={{ marginBottom: 8 }}>
                  <button onClick={() => handleSelect(t)}>{t.label}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}
