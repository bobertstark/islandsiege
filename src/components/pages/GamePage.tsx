import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { loadAuth } from 'hooks/useGameAuth'
import { GamePhases } from 'common/phases'
import IGameStateView from 'common/IGameStateView'
import GameBoard from 'components/GameBoard'
import Card from 'components/Card'
import { Deck, Discard } from 'components/Deck'
import { ActionPhase } from 'components/phases/ActionPhase'
import { AttackStartPhase } from 'components/phases/AttackStartPhase'
import { TurnBanner } from 'components/TurnBanner'
import 'components/phases/Game.css'

const SIMULTANEOUS_PHASES = new Set<string>(['initDiscard'])

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

const ColonizePhase: React.FC<{
  isMyTurn: boolean
  waitingFor: string[]
  phase: string
  dispatch: (action: { type: string }) => void
}> = ({ isMyTurn, waitingFor, phase, dispatch }) => {
  useEffect(() => {
    if (!isMyTurn) return
    const timer = setTimeout(() => dispatch({ type: 'colonize' }), 1500)
    return () => clearTimeout(timer)
  }, [isMyTurn, dispatch])

  return (
    <div
      className="game-container"
      style={{ textAlign: 'center', paddingTop: 80 }}>
      <TurnBanner phase={phase} isMyTurn={isMyTurn} waitingFor={waitingFor} />
      {isMyTurn && <p>Placing colonists on your forts.</p>}
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
    dispatch({ type: 'initDiscard', payload: { cardID } })
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
    case GamePhases.initDiscard:
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
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          phase={view.phase}
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
    case GamePhases.attackStart:
      return (
        <AttackStartPhase
          view={view}
          playerIdx={playerIdx}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          dispatch={dispatch}
        />
      )
    default:
      return (
        <div className="game-container">
          <TurnBanner
            phase={view.phase}
            isMyTurn={isMyTurn}
            waitingFor={waitingFor}
          />
          <div className="game-header">
            <Deck count={view.deckCount} onDraw={() => {}} />
            <Discard count={view.discard?.length ?? 0} />
          </div>
          <GameBoard state={view} dispatch={dispatch} />
        </div>
      )
  }
}
