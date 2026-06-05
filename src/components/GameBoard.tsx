import React, { useState } from 'react'
import PlayerPanel from './PlayerPanel'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'
import IPlayer from 'common/IPlayer'

interface GameBoardProps {
  state: IGameStateView
  dispatch: React.Dispatch<any>
}

// Normalize IPlayerView to IPlayer, coercing opponent hand count to empty array
function toIPlayer(p: IPlayerView, idx: number): IPlayer {
  return { ...p, id: String(idx), hand: Array.isArray(p.hand) ? p.hand : [] }
}

const SIMULTANEOUS_PHASES = new Set(['initDiscard'])

const GameBoard: React.FC<GameBoardProps> = ({ state, dispatch }) => {
  const players = state.players
  const activeIdx = state.currentPlayerIndex
  const isSimultaneousPhase = SIMULTANEOUS_PHASES.has(state.phase)
  const [selectedCardIDs, setSelectedCardIDs] = useState<{
    [playerIdx: number]: string | undefined
  }>({})

  const handleCardSelect = (playerIdx: number, cardID: string) => {
    setSelectedCardIDs(prev => ({ ...prev, [playerIdx]: cardID }))
    dispatch({ type: 'initDiscard', payload: { playerIdx, cardID } })
  }

  // Build a map: defenderIdx → list of attacker colors docked there
  const dockedShipsMap: Record<number, { color?: string }[]> = {}
  for (const [attackerIdxStr, loc] of Object.entries(state.shipLocations)) {
    if (loc.targetPlayerIndex === undefined) continue
    const attackerIdx = Number(attackerIdxStr)
    const defenderIdx = loc.targetPlayerIndex
    if (!dockedShipsMap[defenderIdx]) dockedShipsMap[defenderIdx] = []
    dockedShipsMap[defenderIdx].push({ color: players[attackerIdx]?.color })
  }

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 40 }}>
        {players.map((player, idx) => {
          const isPending =
            state.pending &&
            (state.pending as Record<number, any>)[idx] !== undefined
          const isActive = isSimultaneousPhase ? !isPending : idx === activeIdx
          const shipIsAway =
            state.shipLocations[idx]?.targetPlayerIndex !== undefined
          const dockedShips = dockedShipsMap[idx] ?? []
          return (
            <PlayerPanel
              key={idx}
              player={toIPlayer(player, idx)}
              color={player.color}
              active={isActive}
              onCardSelect={
                isActive && isSimultaneousPhase
                  ? cardID => handleCardSelect(idx, cardID)
                  : undefined
              }
              selectedCardID={selectedCardIDs[idx]}
              shipIsAway={shipIsAway}
              dockedShips={dockedShips}
              handCount={
                typeof player.hand === 'number' ? player.hand : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export default GameBoard
