import React from 'react'
import IGameStateView from 'common/IGameStateView'
import { ShellColor, ShellColors } from 'common/colors'
import ActionInstructions from 'components/ActionInstructions'
import AttackTargetDisplay from 'components/AttackTargetDisplay'
import GameShell from 'components/GameShell'
import { WaitingForPlayer } from 'components/TurnBanner'

interface Props {
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  dispatch: (action: { type: string; payload?: unknown }) => void
  logOpen: boolean
  onToggleLog: () => void
}

function SaboteurShellPicker({
  attackerShells,
  dispatch,
}: {
  attackerShells: Partial<Record<ShellColor, number>>
  dispatch: Props['dispatch']
}) {
  const available = (Object.keys(ShellColors) as ShellColor[]).filter(
    c => (attackerShells[c] ?? 0) > 0,
  )

  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>
        Choose a shell to destroy from the attacker's supply:
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {available.map(color => (
          <button
            key={color}
            onClick={() =>
              dispatch({
                type: 'nonActiveChoice',
                payload: { shellColor: color },
              })
            }
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '2px solid #555',
              background: ShellColors[color],
              color: color === 'white' ? '#333' : '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 13,
              textTransform: 'capitalize',
            }}>
            {color} ({attackerShells[color]})
          </button>
        ))}
      </div>
    </div>
  )
}

export const NonActiveChoicePhase: React.FC<Props> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  dispatch,
  logOpen,
  onToggleLog,
}) => {
  const spec = view.defenderChoice
  const attackerIdx = view.currentPlayerIndex
  const defenderIdx = view.shipLocations[attackerIdx]?.targetPlayerIndex
  const isDefender = playerIdx === defenderIdx

  const actionContent = (() => {
    if (!spec) return null

    switch (spec.type) {
      case 'saboteurShell': {
        const attacker = view.players[attackerIdx]
        const attackerShells =
          (attacker.shells as Partial<Record<ShellColor, number>>) ?? {}
        return (
          <>
            <ActionInstructions
              title="Saboteur Outpost"
              description={
                isDefender
                  ? "Your Saboteur Outpost activates — choose a shell to destroy from the attacker's supply."
                  : 'Waiting for the defender to pick a shell to destroy…'
              }
            />
            <AttackTargetDisplay
              view={view}
              leftFooter={
                isDefender ? (
                  <SaboteurShellPicker
                    attackerShells={attackerShells}
                    dispatch={dispatch}
                  />
                ) : undefined
              }
            />
          </>
        )
      }
      default:
        return null
    }
  })()

  return (
    <GameShell
      view={view}
      playerIdx={playerIdx}
      isMyTurn={isMyTurn}
      waitingFor={waitingFor}
      logOpen={logOpen}
      onToggleLog={onToggleLog}
      actionContent={actionContent}
    />
  )
}
