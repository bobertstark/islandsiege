import React, { useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGameSocket } from 'hooks/useGameSocket'
import { LobbyPhase } from 'components/phases/LobbyPhase'

export const LobbyPage: React.FC = () => {
  const { gameId = '' } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const playerId = searchParams.get('playerId') ?? ''

  const { view, dispatch, error } = useGameSocket(gameId, playerId)

  useEffect(() => {
    if (view && view.phase !== 'lobby') {
      navigate(`/game/${gameId}?playerId=${playerId}`, { replace: true })
    }
  }, [view, gameId, playerId, navigate])

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

  return (
    <LobbyPhase
      view={view}
      gameId={gameId}
      playerIdx={view.myPlayerIndex}
      dispatch={dispatch}
    />
  )
}
