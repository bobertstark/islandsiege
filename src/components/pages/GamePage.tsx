import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { loadAuth } from 'hooks/useGameAuth'
import { GamePhases } from 'common/phases'
import { DieValue } from 'common/die'
import IGameStateView from 'common/IGameStateView'
import GameBoard from 'components/GameBoard'
import Card from 'components/Card'
import { Deck, Discard } from 'components/Deck'
import { ActionPhase } from 'components/phases/ActionPhase'
import { AttackWave1Phase } from 'components/phases/AttackWave1Phase'
import { AttackReinforceOrWave2Phase } from 'components/phases/AttackReinforceOrWave2Phase'
import { AttackWave2Phase } from 'components/phases/AttackWave2Phase'
import { BuildFortPhase } from 'components/phases/BuildFortPhase'
import { BuildBuildingPhase } from 'components/phases/BuildBuildingPhase'
import { BuildShipPhase } from 'components/phases/BuildShipPhase'
import AttackRollPanel from 'components/AttackRollPanel'
import Fort from 'components/Fort'
import AttackTargetDisplay from 'components/AttackTargetDisplay'
import { TurnBanner } from 'components/TurnBanner'
import 'components/phases/Game.css'

const SIMULTANEOUS_PHASES = new Set<string>(['initDraw'])

const ATTACK_DISPLAY_PHASES = new Set<string>([
  GamePhases.attackLeadership,
  GamePhases.attackWave1,
  GamePhases.attackReinforceOrWave2,
  GamePhases.attackReinforce,
  GamePhases.attackWave2,
  GamePhases.attackDestroy,
])

// Expand rollCounts back to a flat DieValue array for display
function countsToArray(counts: IGameStateView['diceBank']): DieValue[] {
  return (Object.entries(counts) as [DieValue, number][]).flatMap(
    ([face, count]) => Array<DieValue>(count).fill(face),
  )
}

function getTurnState(view: IGameStateView, playerIdx: number) {
  const isSimultaneous = SIMULTANEOUS_PHASES.has(view.phase)

  const isMyTurn = isSimultaneous
    ? view.pending?.[playerIdx] === undefined
    : view.currentPlayerIndex === playerIdx

  // Names of players we're still waiting on
  const waitingFor: string[] = isSimultaneous
    ? view.players
        .map((p, i) => (view.pending?.[i] === undefined ? p.name : null))
        .filter((n): n is string => n !== null)
    : [view.players[view.currentPlayerIndex]?.name ?? '']

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
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string }) => void
}> = ({ view, isMyTurn, waitingFor, dispatch }) => {
  useEffect(() => {
    if (!isMyTurn) return
    const timer = setTimeout(() => dispatch({ type: 'colonize' }), 1500)
    return () => clearTimeout(timer)
  }, [isMyTurn, dispatch])

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && (
        <p style={{ padding: '4px 0' }}>Placing colonists on your forts…</p>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}

const InitDiscardPhase: React.FC<{
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}> = ({ view, playerIdx, isMyTurn, waitingFor, dispatch }) => {
  const [selectedID, setSelectedID] = useState<string | undefined>()
  const cards = view.drawnCards

  function handleSelect(cardID: string) {
    setSelectedID(cardID)
    dispatch({ type: 'initDraw', payload: { cardID } })
  }

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && (
        <>
          <h2>Select card to give away</h2>
          <p>
            Select one card to give to{' '}
            <strong
              style={{
                color:
                  view.players[(playerIdx + 1) % view.players.length]?.color ??
                  undefined,
              }}>
              {view.players[(playerIdx + 1) % view.players.length]?.name}
            </strong>
            .
          </p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              margin: '16px 0',
            }}>
            {cards.map(card => (
              <Card
                key={card.id}
                card={card}
                selected={selectedID === card.id}
                onClick={handleSelect}
              />
            ))}
          </div>
        </>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}

const DiscardPhase: React.FC<{
  view: IGameStateView
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}> = ({ view, isMyTurn, waitingFor, dispatch }) => {
  const [selectedID, setSelectedID] = useState<string | undefined>()

  function handleDiscard(cardID: string) {
    setSelectedID(cardID)
    dispatch({ type: 'discard', payload: { cardID } })
  }

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && (
        <>
          <h2>Pick a card to discard</h2>
          <p>Select one of your drawn cards. The other two go to your hand.</p>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              margin: '16px 0',
            }}>
            {view.drawnCards.map(card => (
              <Card
                key={card.id}
                card={card}
                selected={selectedID === card.id}
                onClick={handleDiscard}
              />
            ))}
          </div>
        </>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}

const AttackRollPhase: React.FC<{
  view: IGameStateView
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}> = ({ view, isMyTurn, waitingFor, dispatch }) => {
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
      dispatch({ type: 'attackRoll', payload: { action: 'keep' } })
    }
  }, [isMyTurn, view.attackRoll, view.attackRerollsRemaining, dispatch])

  return (
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      {isMyTurn && view.attackRoll !== undefined && (
        <AttackRollPanel
          dice={view.attackRoll}
          rerollsRemaining={view.attackRerollsRemaining}
          dispatch={dispatch}
        />
      )}
      <AttackTargetDisplay view={view} />
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}

const AttackLeadershipPhase: React.FC<{
  view: IGameStateView
  isMyTurn: boolean
  waitingFor: string[]
  dispatch: (action: { type: string; payload?: unknown }) => void
}> = ({ view, isMyTurn, waitingFor, dispatch }) => {
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
    <div className="game-container">
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
      />
      <AttackTargetDisplay view={view} />
      {isMyTurn && (
        <div style={{ padding: '16px 20px' }}>
          <h2>Leadership</h2>
          {canUseLeadership ? (
            <>
              <p>
                You have <strong>{lCount}</strong> L{' '}
                {lCount === 1 ? 'die' : 'dice'}. Spend 2 to destroy a ship.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
                {defenderShips.map(ship => (
                  <li key={ship.id} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'attackLeadership',
                          payload: { shipID: ship.id },
                        })
                      }>
                      Destroy {ship.name} (costs 2 L)
                    </button>
                  </li>
                ))}
              </ul>
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
              dispatch({ type: 'attackLeadership', payload: { skip: true } })
            }>
            {view.attackIsOpenWater ? 'Proceed to Reinforce' : 'Skip'}
          </button>
        </div>
      )}
      <GameBoard state={view} dispatch={dispatch} />
    </div>
  )
}

export const GamePage: React.FC = () => {
  const { gameId = '' } = useParams<{ gameId: string }>()
  const auth = loadAuth(gameId)

  const { view, dispatch, error } = useGameSocket(
    gameId,
    auth?.playerIdx ?? 0,
    auth?.playerId ?? '',
  )

  if (!auth) {
    return (
      <div>
        No credentials for this game.{' '}
        <a href={`/?join=${gameId}`}>Join as a player</a>
      </div>
    )
  }

  if (error) return <div className="error">Error: {error}</div>
  if (!view) return <div>Connecting…</div>

  const playerIdx = auth.playerIdx
  const { isMyTurn, waitingFor } = getTurnState(view, playerIdx)

  switch (view.phase) {
    case GamePhases.initDraw:
      return (
        <InitDiscardPhase
          view={view}
          playerIdx={playerIdx}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
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
    case GamePhases.colonize:
      return (
        <ColonizePhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.discard:
      return (
        <DiscardPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.attackRoll:
      return (
        <AttackRollPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.attackLeadership:
      return (
        <AttackLeadershipPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.attackWave1:
      return (
        <AttackWave1Phase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.attackReinforceOrWave2:
      return (
        <AttackReinforceOrWave2Phase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.attackWave2:
      return (
        <AttackWave2Phase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.buildFort:
      return (
        <BuildFortPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.buildBuilding:
      return (
        <BuildBuildingPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.buildShip:
      return (
        <BuildShipPhase
          view={view}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    case GamePhases.gameOver:
      return <GameOverPhase view={view} playerIdx={playerIdx} />
    default: {
      const attackDice = ATTACK_DISPLAY_PHASES.has(view.phase)
        ? countsToArray(view.diceBank)
        : []
      return (
        <div className="game-container">
          <TurnBanner
            phase={view.phase}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
          />
          {attackDice.length > 0 && (
            <AttackRollPanel
              dice={attackDice}
              rerollsRemaining={0}
              dispatch={dispatch}
              readonly
            />
          )}
          <div className="game-header">
            <Deck count={view.deckCount} onDraw={() => {}} />
            <Discard count={view.discard?.length ?? 0} />
          </div>
          <GameBoard state={view} dispatch={dispatch} />
        </div>
      )
    }
  }
}
