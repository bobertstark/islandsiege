import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { InitPhase } from 'components/phases/InitPhase'
import { saveAuth } from 'hooks/useGameAuth'

export const InitPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const prefilledGameId = searchParams.get('join') ?? ''

  function handleJoin(gameId: string, playerIdx: number, playerId: string) {
    saveAuth(gameId, { playerIdx, playerId })
    navigate(`/lobby/${gameId}`)
  }

  return <InitPhase onJoin={handleJoin} prefilledGameId={prefilledGameId} />
}
