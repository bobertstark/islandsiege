import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import Card from 'components/Card'
import ActionInstructions from 'components/ActionInstructions'

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
  const [targetPlayerIndex, setTargetPlayerIndex] = useState<
    number | undefined
  >()
  const [confirmed, setConfirmed] = useState(false)

  const opponents = view.players
    .map((p, i) => ({ player: p, index: i }))
    .filter(({ index }) => index !== view.myPlayerIndex)

  const needsOpponentSelection = opponents.length > 1
  const resolvedTarget = needsOpponentSelection
    ? targetPlayerIndex
    : opponents[0]?.index

  function handleConfirm() {
    if (!selectedID || resolvedTarget === undefined) return
    setConfirmed(true)
    dispatch({
      type: 'drawPick',
      payload: { cardID: selectedID, targetPlayerIndex: resolvedTarget },
    })
  }

  if (!isMyTurn) {
    return (
      <ActionInstructions
        title="Select a Card to Give Away"
        description="Waiting for the active player to give a drawn card to an opponent."
      />
    )
  }

  const canConfirm =
    !!selectedID && (!needsOpponentSelection || targetPlayerIndex !== undefined)

  return (
    <>
      <ActionInstructions
        title="Select a Card to Give Away"
        description="Select a card and opponent to give it to. The other two go to your hand."
      />
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 8,
          margin: '16px 0',
        }}>
        <div style={{ display: 'flex', gap: 12 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {needsOpponentSelection &&
            opponents.map(({ player, index }) => {
              const isSelected = targetPlayerIndex === index
              return (
                <button
                  key={index}
                  disabled={confirmed}
                  onClick={() => setTargetPlayerIndex(index)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    fontWeight: 'bold',
                    fontSize: 14,
                    border: isSelected
                      ? `2px solid ${player.color ?? '#333'}`
                      : '2px solid #ccc',
                    background: isSelected ? (player.color ?? '#333') : '#fff',
                    color: isSelected ? '#fff' : (player.color ?? '#333'),
                    cursor: confirmed ? 'not-allowed' : 'pointer',
                  }}>
                  {player.name}
                </button>
              )
            })}
          {!confirmed && (
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                padding: '8px 24px',
                borderRadius: 6,
                fontWeight: 'bold',
                background: canConfirm ? '#2980b9' : '#ccc',
                color: '#fff',
                border: 'none',
                cursor: canConfirm ? 'pointer' : 'not-allowed',
                fontSize: 14,
              }}>
              Confirm
            </button>
          )}
          {confirmed && (
            <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>
              Waiting…
            </p>
          )}
        </div>
      </div>
    </>
  )
}
