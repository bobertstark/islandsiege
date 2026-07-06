import React, { useEffect, useState } from 'react'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'
import { ShellColor, ShellColors } from 'common/colors'
import Die, { ROLL_DURATION_MS } from 'components/Die'
import { DieValue } from 'common/die'
import ActionInstructions from 'components/ActionInstructions'
import AttackTargetDisplay from 'components/AttackTargetDisplay'
import Wave2ShellPicker from 'components/Wave2ShellPicker'
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

function BarricadedRollPicker({
  attackRoll,
  rerolledIndex,
  dispatch,
  readonly = false,
}: {
  attackRoll: DieValue[]
  rerolledIndex?: number
  dispatch: Props['dispatch']
  readonly?: boolean
}) {
  const [dieKeys, setDieKeys] = useState<number[]>(() =>
    attackRoll.map(() => 0),
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [acted, setActed] = useState(false)

  const resolved = rerolledIndex !== undefined

  // Once the server applies the reroll (rerolledIndex set, new value already in
  // attackRoll), spin that die so it lands on its new face, then finalize.
  useEffect(() => {
    if (rerolledIndex === undefined) return
    setDieKeys(prev => prev.map((k, j) => (j === rerolledIndex ? k + 1 : k)))
    if (readonly) return
    const t = setTimeout(() => {
      dispatch({ type: 'nonActiveChoice', payload: { finalize: true } })
    }, ROLL_DURATION_MS + 200)
    return () => clearTimeout(t)
  }, [rerolledIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDieClick(i: number) {
    if (acted || resolved || readonly) return
    setSelected(prev => (prev === i ? null : i))
  }

  function handleConfirm() {
    if (acted || resolved || readonly || selected === null) return
    setActed(true)
    dispatch({ type: 'nonActiveChoice', payload: { dieIndex: selected } })
  }

  function handlePass() {
    if (acted || resolved || readonly) return
    setActed(true)
    dispatch({ type: 'nonActiveChoice', payload: {} })
  }

  const locked = acted || resolved || readonly
  const canConfirm = !locked && selected !== null

  return (
    <div style={{ marginTop: 12 }}>
      {!readonly && (
        <p style={{ margin: '0 0 8px', fontSize: 13 }}>
          {resolved || acted
            ? 'Rerolling…'
            : selected !== null
              ? 'Confirm the reroll, or skip:'
              : 'Click a die to reroll it, or skip:'}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        {attackRoll.map((face, i) => (
          <Die
            key={`${i}-${dieKeys[i] ?? 0}`}
            face={face}
            selected={!locked && selected === i}
            onClick={locked ? undefined : () => handleDieClick(i)}
            readonly={locked}
            animateOnMount={(dieKeys[i] ?? 0) > 0}
          />
        ))}
      </div>
      {!readonly && !resolved && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '2px solid #555',
              background: canConfirm ? '#27ae60' : '#7a7a7a',
              color: '#fff',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontSize: 13,
            }}>
            Confirm reroll
          </button>
          <button
            onClick={handlePass}
            disabled={acted}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '2px solid #555',
              background: '#c0392b',
              color: '#fff',
              cursor: acted ? 'not-allowed' : 'pointer',
              fontSize: 13,
            }}>
            Skip reroll
          </button>
        </div>
      )}
    </div>
  )
}

function CoveShipPicker({
  attacker,
  dispatch,
}: {
  attacker: IPlayerView
  dispatch: Props['dispatch']
}) {
  const ships = attacker.ships.filter(s => s.colonists > 0)
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13 }}>
        Choose a ship to remove a colonist from:
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ships.map(ship => (
          <button
            key={ship.id}
            onClick={() =>
              dispatch({
                type: 'nonActiveChoice',
                payload: { shipID: ship.id },
              })
            }
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: '2px solid #555',
              background: '#2a3a5a',
              color: '#eee',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 13,
            }}>
            {ship.name} ({ship.colonists})
          </button>
        ))}
      </div>
    </div>
  )
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
      case 'barricadedReroll': {
        return (
          <>
            <ActionInstructions
              title="Barricaded Fortress"
              description={
                isDefender
                  ? "Your Barricaded Fortress activates — reroll one of the attacker's dice, or pass."
                  : 'Waiting for the defender to reroll a die…'
              }
            />
            <AttackTargetDisplay
              view={view}
              leftFooter={
                view.attackRoll ? (
                  <BarricadedRollPicker
                    attackRoll={view.attackRoll}
                    rerolledIndex={spec.rerolledIndex}
                    dispatch={dispatch}
                    readonly={!isDefender}
                  />
                ) : undefined
              }
            />
          </>
        )
      }
      case 'guardedWave2': {
        return (
          <>
            <ActionInstructions
              title="Guarded Fortress"
              description={
                isDefender
                  ? 'Your Guarded Fortress activates — choose which shells to destroy.'
                  : 'Waiting for the defender to pick shells…'
              }
            />
            <Wave2ShellPicker
              view={view}
              active={isDefender}
              onConfirm={attackLocs =>
                dispatch({ type: 'nonActiveChoice', payload: { attackLocs } })
              }
            />
          </>
        )
      }
      case 'coveShip': {
        const attacker = view.players[attackerIdx]
        return (
          <>
            <ActionInstructions
              title="Cove Outpost"
              description={
                isDefender
                  ? 'Your Cove Outpost activates — choose a ship to remove a colonist from.'
                  : 'Waiting for the defender to pick a ship…'
              }
            />
            <AttackTargetDisplay
              view={view}
              leftFooter={
                isDefender ? (
                  <CoveShipPicker attacker={attacker} dispatch={dispatch} />
                ) : undefined
              }
            />
          </>
        )
      }
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
