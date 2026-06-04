import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { loadAuth } from 'hooks/useGameAuth'
import { GamePhases } from 'common/phases'
import GameBoard from 'components/GameBoard'
import { Deck, Discard } from 'components/Deck'
import { ActionPhase } from 'components/phases/ActionPhase'
import 'components/phases/Game.css'

const ColonizePhase: React.FC<{
  dispatch: (action: { type: string }) => void
}> = ({ dispatch }) => {
  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: 'colonize' }), 1500)
    return () => clearTimeout(timer)
  }, [dispatch])

  return (
    <div
      className="game-container"
      style={{ textAlign: 'center', paddingTop: 80 }}>
      <h2>Colonizing…</h2>
      <p>Placing colonists on your forts.</p>
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

  switch (view.phase) {
    case GamePhases.action:
      return <ActionPhase state={view as any} dispatch={dispatch} />
    case GamePhases.colonize:
      return <ColonizePhase dispatch={dispatch} />
    default:
      return (
        <div className="game-container">
          <h1>Island Siege</h1>
          <div className="game-header">
            <Deck count={view.deckCount} onDraw={() => {}} />
            <Discard count={view.discard?.length ?? 0} />
          </div>
          <GameBoard state={view} dispatch={dispatch} />
        </div>
      )
  }
}
