import React from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import { TurnBanner, WaitingForPlayer } from './TurnBanner'
import PlayerSummaryRow from './PlayerSummaryRow'
import Hand from './Hand'
import TableauPanel from './TableauPanel'

interface GameShellProps {
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  buildContext?: { cardID: string; fortID?: string }
  actionContent: React.ReactNode
}

const GameShell: React.FC<GameShellProps> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  buildContext,
  actionContent,
}) => {
  const myHand = view.players[playerIdx]?.hand
  const handCards: ICard[] = Array.isArray(myHand) ? myHand : []

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TurnBanner
        phase={view.phase}
        isMyTurn={isMyTurn}
        waitingFor={waitingFor}
        buildContext={buildContext}
      />
      <PlayerSummaryRow
        players={view.players}
        activePlayerIndex={view.currentPlayerIndex}
        controllingPlayerIndex={playerIdx}
      />
      {actionContent && (
        <div
          style={{
            padding: '16px',
            background: '#f9f9f9',
            borderBottom: '1px solid #ddd',
          }}>
          {actionContent}
        </div>
      )}
      {handCards.length > 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            overflowX: 'auto',
          }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: '#666',
              marginBottom: 8,
            }}>
            Your Hand
          </div>
          <Hand cards={handCards} />
        </div>
      )}
      <TableauPanel view={view} playerIdx={playerIdx} />
    </div>
  )
}

export default GameShell
