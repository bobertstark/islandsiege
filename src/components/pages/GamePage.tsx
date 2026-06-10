import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { GamePhases } from 'common/phases'
import { DieValue } from 'common/die'
import IGameStateView from 'common/IGameStateView'
import GameShell from 'components/GameShell'
import { WaitingForPlayer } from 'components/TurnBanner'
import { ActionPhase } from 'components/phases/ActionPhase'
import { AttackWave1Phase } from 'components/phases/AttackWave1Phase'
import { AttackReinforceOrWave2Phase } from 'components/phases/AttackReinforceOrWave2Phase'
import { AttackWave2Phase } from 'components/phases/AttackWave2Phase'
import { BuildFortPhase } from 'components/phases/BuildFortPhase'
import { BuildBuildingPhase } from 'components/phases/BuildBuildingPhase'
import { BuildShipPhase } from 'components/phases/BuildShipPhase'
import { DrawPickPhase } from 'components/phases/DrawPickPhase'
import { InitDrawPhase } from 'components/phases/InitDrawPhase'
import AttackRollPanel from 'components/AttackRollPanel'
import { ROLL_DURATION_MS } from 'components/Die'
import AttackTargetDisplay, {
  useAttackTarget,
  DiceBankPanel,
} from 'components/AttackTargetDisplay'
import AttackLayout from 'components/AttackLayout'
import Fort from 'components/Fort'
import Ship from 'components/Ship'
import ActionInstructions from 'components/ActionInstructions'
import { DevOverlay } from 'components/dev/DevOverlay'
import 'components/phases/Game.css'

const SIMULTANEOUS_PHASES = new Set<string>(['initDraw'])

const ATTACK_DISPLAY_PHASES = new Set<string>([
  GamePhases.attackLeadership,
  GamePhases.attackWave1,
  GamePhases.attackReinforceOrWave2,
  GamePhases.attackWave2,
])

function countsToArray(counts: IGameStateView['diceBank']): DieValue[] {
  return (Object.entries(counts) as [DieValue, number][]).flatMap(
    ([face, count]) => Array<DieValue>(count).fill(face),
  )
}

function getTurnState(
  view: IGameStateView,
  playerIdx: number,
): { isMyTurn: boolean; waitingFor: WaitingForPlayer[] } {
  const isSimultaneous = SIMULTANEOUS_PHASES.has(view.phase)
  const isMyTurn =
    playerIdx < 0
      ? false
      : isSimultaneous
        ? view.pending?.[playerIdx] === undefined
        : view.currentPlayerIndex === playerIdx
  const waitingFor: WaitingForPlayer[] = isSimultaneous
    ? view.players
        .filter((_, i) => view.pending?.[i] === undefined)
        .map(p => ({ name: p.name, color: p.color }))
    : (() => {
        const p = view.players[view.currentPlayerIndex]
        return p ? [{ name: p.name, color: p.color }] : []
      })()
  return { isMyTurn, waitingFor }
}

const GameOverPhase: React.FC<{
  view: IGameStateView
  playerIdx: number
}> = ({ view, playerIdx }) => {
  const winner =
    view.winningPlayerIndex !== undefined
      ? view.players[view.winningPlayerIndex]
      : undefined
  const isWinner = view.winningPlayerIndex === playerIdx

  return (
    <div
      className="game-container"
      style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Game Over</h1>
      {winner ? (
        <>
          <h2
            style={{
              fontSize: '1.8rem',
              color: winner.color ?? undefined,
              marginBottom: 8,
            }}>
            {isWinner ? 'You win!' : `${winner.name} wins!`}
          </h2>
          {winner.colonists <= 0 ? (
            <>
              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>
                Colonist Victory
              </p>
              <p style={{ color: '#aaa' }}>
                Successfully colonized the Caribbean!
              </p>
            </>
          ) : (
            <>
              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>
                Economic Victory
              </p>
              <p style={{ color: '#aaa' }}>
                Prosperous colony dominates the New World!
              </p>
            </>
          )}
        </>
      ) : (
        <p>The game has ended.</p>
      )}
      <button
        style={{ marginTop: 32 }}
        onClick={() => (window.location.href = '/')}>
        Back to Home
      </button>
    </div>
  )
}

const ColonizePhase: React.FC<{
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  dispatch: (action: { type: string }) => void
  logOpen: boolean
  onToggleLog: () => void
}> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  dispatch,
  logOpen,
  onToggleLog,
}) => {
  useEffect(() => {
    if (!isMyTurn) return
    const timer = setTimeout(() => dispatch({ type: 'colonize' }), 1500)
    return () => clearTimeout(timer)
  }, [isMyTurn, dispatch])

  return (
    <GameShell
      view={view}
      playerIdx={playerIdx}
      isMyTurn={isMyTurn}
      waitingFor={waitingFor}
      logOpen={logOpen}
      onToggleLog={onToggleLog}
      actionContent={
        <ActionInstructions
          title="Colonize"
          description={
            isMyTurn
              ? 'Placing colonists on your forts…'
              : 'Waiting for colonists to be placed.'
          }
        />
      }
    />
  )
}

const AttackRollContent: React.FC<{
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}> = ({ view, isMyTurn, dispatch }) => {
  const { targetPlayer, targetFort } = useAttackTarget(view)
  return (
    <>
      <ActionInstructions
        title="Attack Roll"
        description={
          isMyTurn
            ? 'Rolling dice for your attack.'
            : 'Waiting for the attacker to roll.'
        }
      />
      <AttackLayout
        left={
          <>
            <DiceBankPanel bank={view.diceBank} style={{ marginBottom: 8 }} />
            {view.attackRoll !== undefined && (
              <AttackRollPanel
                dice={view.attackRoll}
                rerollsRemaining={view.attackRerollsRemaining}
                dispatch={dispatch}
                readonly={!isMyTurn}
                banRerollFaces={view.attackFlags?.banRerollFaces}
              />
            )}
          </>
        }
        right={
          <>
            <p style={{ margin: '0 0 6px' }}>
              Attacking{' '}
              <strong style={{ color: targetPlayer?.color }}>
                {targetPlayer?.name ?? 'Open Waters'}
              </strong>
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {targetFort && <Fort fort={targetFort} />}
              {targetPlayer?.ships.map(ship => (
                <Ship
                  key={ship.id}
                  ship={ship}
                  color={targetPlayer.color}
                  fill
                />
              ))}
            </div>
          </>
        }
      />
    </>
  )
}

const AttackRollPhase: React.FC<{
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  dispatch: (action: { type: string; payload?: unknown }) => void
  logOpen: boolean
  onToggleLog: () => void
}> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  dispatch,
  logOpen,
  onToggleLog,
}) => {
  useEffect(() => {
    if (isMyTurn && view.attackRoll === undefined) {
      dispatch({ type: 'attackRoll', payload: { action: 'init' } })
    }
  }, [isMyTurn, view.attackRoll, dispatch])

  useEffect(() => {
    if (
      isMyTurn &&
      view.attackRoll !== undefined &&
      view.attackRerollsRemaining === 0
    ) {
      const t = setTimeout(
        () => dispatch({ type: 'attackRoll', payload: { action: 'keep' } }),
        ROLL_DURATION_MS + 400,
      )
      return () => clearTimeout(t)
    }
  }, [isMyTurn, view.attackRoll, view.attackRerollsRemaining, dispatch])

  return (
    <GameShell
      view={view}
      playerIdx={playerIdx}
      isMyTurn={isMyTurn}
      waitingFor={waitingFor}
      logOpen={logOpen}
      onToggleLog={onToggleLog}
      actionContent={
        <AttackRollContent
          view={view}
          isMyTurn={isMyTurn}
          dispatch={dispatch}
        />
      }
    />
  )
}

const AttackLeadershipPhase: React.FC<{
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  dispatch: (action: { type: string; payload?: unknown }) => void
  logOpen: boolean
  onToggleLog: () => void
}> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  dispatch,
  logOpen,
  onToggleLog,
}) => {
  const defenderIdx =
    view.shipLocations[view.currentPlayerIndex]?.targetPlayerIndex
  const defenderShips =
    defenderIdx !== undefined ? (view.players[defenderIdx]?.ships ?? []) : []
  const lCount = view.diceBank.L ?? 0
  const canUseLeadership = lCount >= 2 && defenderShips.length > 0

  useEffect(() => {
    if (!isMyTurn || lCount > 0) return
    dispatch({ type: 'attackLeadership', payload: { skip: true } })
  }, [isMyTurn, lCount, dispatch])

  return (
    <GameShell
      view={view}
      playerIdx={playerIdx}
      isMyTurn={isMyTurn}
      waitingFor={waitingFor}
      logOpen={logOpen}
      onToggleLog={onToggleLog}
      actionContent={
        <>
          <ActionInstructions
            title="Leadership"
            description={
              isMyTurn
                ? 'Spend 2 L dice to destroy an enemy ship.'
                : 'Waiting for the attacker to use leadership.'
            }
          />
          <AttackTargetDisplay view={view} />
          {isMyTurn && (
            <div style={{ padding: '16px 0' }}>
              {canUseLeadership ? (
                <>
                  <p style={{ marginBottom: 10 }}>
                    You have <strong>{lCount}</strong> L{' '}
                    {lCount === 1 ? 'die' : 'dice'}. Spend 2 to destroy a ship.
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {defenderShips.map(ship => (
                      <div
                        key={ship.id}
                        onClick={() =>
                          dispatch({
                            type: 'attackLeadership',
                            payload: { effect: 'destroyShip', shipID: ship.id },
                          })
                        }
                        style={{
                          cursor: 'pointer',
                          outline: '2px solid transparent',
                          borderRadius: 6,
                          padding: 4,
                          transition: 'outline-color 0.15s, background 0.15s',
                          width: 'fit-content',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLDivElement
                          el.style.outlineColor = '#c0392b'
                          el.style.background = '#fff5f5'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLDivElement
                          el.style.outlineColor = 'transparent'
                          el.style.background = 'transparent'
                        }}>
                        <Ship
                          ship={ship}
                          color={view.players[defenderIdx ?? 0]?.color}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: '#888', fontStyle: 'italic' }}>
                  {view.attackIsOpenWater
                    ? 'Open waters — no ships to target.'
                    : 'No leadership actions available.'}
                </p>
              )}
              <button
                onClick={() =>
                  dispatch({
                    type: 'attackLeadership',
                    payload: { skip: true },
                  })
                }>
                {view.attackIsOpenWater ? 'Proceed to Reinforce' : 'Skip'}
              </button>
            </div>
          )}
        </>
      }
    />
  )
}

export const GamePage: React.FC = () => {
  const { gameId = '' } = useParams<{ gameId: string }>()
  const [searchParams] = useSearchParams()
  const playerId = searchParams.get('playerId') ?? ''
  const { view, dispatch, error } = useGameSocket(gameId, playerId)
  const [logOpen, setLogOpen] = useState(false)
  const onToggleLog = () => setLogOpen(o => !o)

  if (!playerId) {
    return (
      <div>
        No credentials for this game.{' '}
        <a href={`/?join=${gameId}`}>Join as a player</a>
      </div>
    )
  }
  if (error) return <div className="error">Error: {error}</div>
  if (!view) return <div>Connecting…</div>

  const playerIdx = view.myPlayerIndex
  const { isMyTurn, waitingFor } = getTurnState(view, playerIdx)

  const renderPhase = (): React.ReactNode => {
    switch (view.phase) {
      case GamePhases.gameOver:
        return <GameOverPhase view={view} playerIdx={playerIdx} />
      case GamePhases.colonize:
        return (
          <ColonizePhase
            view={view}
            playerIdx={playerIdx}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
            dispatch={dispatch}
            logOpen={logOpen}
            onToggleLog={onToggleLog}
          />
        )
      case GamePhases.attackRoll:
        return (
          <AttackRollPhase
            view={view}
            playerIdx={playerIdx}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
            dispatch={dispatch}
            logOpen={logOpen}
            onToggleLog={onToggleLog}
          />
        )
      case GamePhases.attackLeadership:
        return (
          <AttackLeadershipPhase
            view={view}
            playerIdx={playerIdx}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
            dispatch={dispatch}
            logOpen={logOpen}
            onToggleLog={onToggleLog}
          />
        )
      default: {
        const attackDice = ATTACK_DISPLAY_PHASES.has(view.phase)
          ? countsToArray(view.diceBank)
          : []
        const actionContent = (() => {
          switch (view.phase) {
            case GamePhases.initDraw:
              return (
                <InitDrawPhase
                  view={view}
                  playerIdx={playerIdx}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.action:
              return (
                <ActionPhase
                  state={view}
                  playerIdx={playerIdx}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.drawPick:
              return (
                <DrawPickPhase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.attackWave1:
              return (
                <AttackWave1Phase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.attackReinforceOrWave2:
              return (
                <AttackReinforceOrWave2Phase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.attackWave2:
              return (
                <AttackWave2Phase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.attackReinforce:
              return (
                <>
                  <ActionInstructions
                    title="Reinforce"
                    description="Adding shells to your reserve…"
                  />
                  <AttackTargetDisplay view={view} />
                </>
              )
            case GamePhases.attackDestroy:
              return (
                <>
                  <ActionInstructions
                    title="Destruction"
                    description="Resolving fort damage…"
                  />
                  <AttackTargetDisplay view={view} />
                </>
              )
            case GamePhases.buildFort:
              return (
                <BuildFortPhase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.buildBuilding:
              return (
                <BuildBuildingPhase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            case GamePhases.buildShip:
              return (
                <BuildShipPhase
                  view={view}
                  isMyTurn={isMyTurn}
                  dispatch={dispatch}
                />
              )
            default:
              return attackDice.length > 0 ? (
                <AttackRollPanel
                  dice={attackDice}
                  rerollsRemaining={0}
                  dispatch={dispatch}
                  readonly
                />
              ) : null
          }
        })()
        return (
          <GameShell
            view={view}
            playerIdx={playerIdx}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
            actionContent={actionContent}
            logOpen={logOpen}
            onToggleLog={onToggleLog}
          />
        )
      }
    }
  }

  return (
    <>
      {renderPhase()}
      {import.meta.env.DEV && <DevOverlay gameId={gameId} />}
    </>
  )
}
