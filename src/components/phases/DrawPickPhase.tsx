import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import Card from 'components/Card'

interface Props {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const DrawPickPhase: React.FC<Props> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const [selectedID, setSelectedID] = useState<string | undefined>()
  const [confirmed, setConfirmed] = useState(false)

  function handleConfirm() {
    if (!selectedID) return
    setConfirmed(true)
    dispatch({ type: 'drawPick', payload: { cardID: selectedID } })
  }

  if (!isMyTurn) return null

  return (
    <>
      <h2>Pick a card to discard</h2>
      <p>Select one of your drawn cards. The other two go to your hand.</p>
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
      {!confirmed && (
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
        <p style={{ color: '#888', fontStyle: 'italic' }}>Waiting…</p>
      )}
    </>
  )
}
