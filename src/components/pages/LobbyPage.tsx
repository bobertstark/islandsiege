import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { loadAuth } from 'hooks/useGameAuth'
import { LobbyPhase } from 'components/phases/LobbyPhase'

export const LobbyPage: React.FC = () => {
  const { gameId = '' } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const auth = loadAuth(gameId)

  const { view, dispatch, error } = useGameSocket(
    gameId,
    auth?.playerIdx ?? 0,
    auth?.playerId ?? '',
  )

  useEffect(() => {
    if (view && view.phase !== 'lobby') {
      navigate(`/game/${gameId}`, { replace: true })
    }
  }, [view, gameId, navigate])

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

  return (
    <LobbyPhase
      view={view}
      gameId={gameId}
      playerIdx={auth.playerIdx}
      dispatch={dispatch}
    />
  )
}
