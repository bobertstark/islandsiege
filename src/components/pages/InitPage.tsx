import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { InitPhase } from 'components/phases/InitPhase'

export const InitPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledGameId = searchParams.get('join') ?? ''

  const devParam = searchParams.get('dev')
  useEffect(() => {
    if (import.meta.env.DEV && devParam !== null) {
      navigate(`/game/dev?playerId=dev${devParam}`, { replace: true })
    }
  }, [devParam, navigate])

  function handleJoin(gameId: string, playerId: string) {
    navigate(`/lobby/${gameId}?playerId=${playerId}`)
  }

  return <InitPhase onJoin={handleJoin} prefilledGameId={prefilledGameId} />
}
