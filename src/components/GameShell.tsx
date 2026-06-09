import React from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import { TurnBanner, WaitingForPlayer } from './TurnBanner'
import PlayerSummaryRow from './PlayerSummaryRow'
import Hand from './Hand'
import TableauPanel from './TableauPanel'
import GameLog from './GameLog'

interface GameShellProps {
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  waitingFor: WaitingForPlayer[]
  actionContent: React.ReactNode
  logOpen: boolean
  onToggleLog: () => void
}

const GameShell: React.FC<GameShellProps> = ({
  view,
  playerIdx,
  isMyTurn,
  waitingFor,
  actionContent,
  logOpen,
  onToggleLog,
}) => {
  const myHand = view.players[playerIdx]?.hand
  const handCards: ICard[] = Array.isArray(myHand) ? myHand : []

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
        <TurnBanner
          phase={view.phase}
          isMyTurn={isMyTurn}
          waitingFor={waitingFor}
          logOpen={logOpen}
          onToggleLog={onToggleLog}
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
      {logOpen && <GameLog log={view.log} players={view.players} />}
    </div>
  )
}

export default GameShell
