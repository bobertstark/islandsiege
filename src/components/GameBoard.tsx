import React, { useState } from 'react'
import PlayerPanel from './PlayerPanel'
import IGameState from 'common/IGameState'

interface GameBoardProps {
  state: IGameState
  dispatch: React.Dispatch<any>
}

const SIMULTANEOUS_PHASES = new Set(['initDiscard'])

const GameBoard: React.FC<GameBoardProps> = ({ state, dispatch }) => {
  const players = state.players
  const activeIdx = state.currentPlayerIndex
  const isSimultaneousPhase = SIMULTANEOUS_PHASES.has(state.phase)
  const [selectedCardIDs, setSelectedCardIDs] = useState<{
    [playerIdx: number]: string | undefined
  }>({})

  let activePlayerNames: string[] = []
  if (isSimultaneousPhase) {
    activePlayerNames = players
      .map((player, idx) => {
        const isPending =
          state.pending &&
          (state.pending as Record<number, any>)[idx] !== undefined
        return !isPending ? player.name : null
      })
      .filter((name): name is string => !!name)
  } else {
    activePlayerNames = [players[activeIdx]?.name]
  }

  const handleCardSelect = (playerIdx: number, cardID: string) => {
    setSelectedCardIDs(prev => ({ ...prev, [playerIdx]: cardID }))
    dispatch({ type: 'initDiscard', payload: { playerIdx, cardID } })
  }

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <h1>Current Phase: {state.phase}</h1>
      <h2>Active Player(s): {activePlayerNames.join(', ')}</h2>
      <div style={{ display: 'flex', gap: 40 }}>
        {players.map((player, idx) => {
          const isPending =
            state.pending &&
            (state.pending as Record<number, any>)[idx] !== undefined
          const isActive = isSimultaneousPhase ? !isPending : idx === activeIdx
          return (
            <PlayerPanel
              key={player.id}
              player={player}
              color={player.color}
              active={isActive}
              onCardSelect={
                isActive && isSimultaneousPhase
                  ? cardID => handleCardSelect(idx, cardID)
                  : undefined
              }
              selectedCardID={selectedCardIDs[idx]}
            />
          )
        })}
      </div>
    </div>
  )
}

export default GameBoard
