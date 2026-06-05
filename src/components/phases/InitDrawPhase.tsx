import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import Card from 'components/Card'

interface Props {
  view: IGameStateView
  playerIdx: number
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const InitDrawPhase: React.FC<Props> = ({
  view,
  playerIdx,
  isMyTurn,
  dispatch,
}) => {
  const [selectedID, setSelectedID] = useState<string | undefined>()
  const [confirmed, setConfirmed] = useState(false)

  const nextPlayer = view.players[(playerIdx + 1) % view.players.length]

  function handleConfirm() {
    if (!selectedID) return
    setConfirmed(true)
    dispatch({ type: 'initDraw', payload: { cardID: selectedID } })
  }

  if (!isMyTurn && !confirmed) return null

  return (
    <>
      {isMyTurn && !confirmed && (
        <>
          <h2>Select card to give away</h2>
          <p>
            Select one card to give to{' '}
            <strong style={{ color: nextPlayer?.color ?? undefined }}>
              {nextPlayer?.name}
            </strong>
            .
          </p>
        </>
      )}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          margin: '16px 0',
        }}>
        {view.drawnCards.map(card => {
          const isChosen = selectedID === card.id
          return (
            <Card
              key={card.id}
              card={card}
              selected={!confirmed && isChosen}
              dimmed={confirmed && isChosen}
              onClick={confirmed ? undefined : () => setSelectedID(card.id)}
            />
          )
        })}
      </div>
      {isMyTurn && !confirmed && (
        <button
          onClick={handleConfirm}
          disabled={!selectedID}
          style={{
            padding: '10px 24px',
            borderRadius: 6,
            fontWeight: 'bold',
            background: selectedID ? '#2980b9' : '#ccc',
            color: '#fff',
            border: 'none',
            cursor: selectedID ? 'pointer' : 'not-allowed',
            fontSize: 15,
          }}>
          Confirm
        </button>
      )}
      {confirmed && (
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          Waiting for others…
        </p>
      )}
    </>
  )
}
