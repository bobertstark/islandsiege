import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import Card from 'components/Card'

interface BuildShipPhaseProps {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

function eligibleForts(forts: IFort[], cost: number): IFort[] {
  return forts.filter(f => f.usedSlots >= cost)
}

export const BuildShipPhase: React.FC<BuildShipPhaseProps> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const player = view.players[view.currentPlayerIndex]
  const hand = Array.isArray(player?.hand) ? player.hand : []
  const shipCards = hand.filter(c => c.type === 'ship')

  const preselected = view.pendingBuildCardID
    ? (shipCards.find(c => c.id === view.pendingBuildCardID) ?? null)
    : null

  const [selectedCard, setSelectedCard] = useState<ICard | null>(preselected)

  function handleSelectCard(cardID: string) {
    const card = shipCards.find(c => c.id === cardID) ?? null
    setSelectedCard(card)
  }

  function handleSelectFort(fortID: string) {
    if (!selectedCard) return
    dispatch({
      type: 'buildShip',
      payload: { fortID, shipID: selectedCard.id },
    })
  }

  const forts = player?.forts ?? []
  const eligible =
    selectedCard?.cost !== undefined
      ? eligibleForts(forts, selectedCard.cost)
      : []
  const eligibleIds = new Set(eligible.map(f => f.id))

  if (!isMyTurn) return null

  return (
    <>
      {!selectedCard && (
        <div style={{ padding: '16px 20px' }}>
          <h2>Pick a ship to build</h2>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              margin: '16px 0',
            }}>
            {shipCards.map(card => {
              const canAfford =
                card.cost !== undefined &&
                forts.some(f => f.usedSlots >= card.cost!)
              return (
                <div
                  key={card.id}
                  style={{
                    opacity: canAfford ? 1 : 0.4,
                    cursor: canAfford ? 'pointer' : 'default',
                  }}>
                  <Card
                    card={card}
                    onClick={canAfford ? handleSelectCard : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
      {selectedCard && (
        <div style={{ padding: '16px 20px' }}>
          <h2>
            Choose a fort to launch <strong>{selectedCard.name}</strong> from
          </h2>
          <p style={{ color: '#666', fontSize: 13 }}>
            Requires {selectedCard.cost} colonists on fort
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
            {forts.map(fort => {
              const ok = eligibleIds.has(fort.id)
              return (
                <li key={fort.id} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => ok && handleSelectFort(fort.id)}
                    disabled={!ok}
                    style={{ opacity: ok ? 1 : 0.4 }}>
                    {fort.name} — {fort.usedSlots} colonists
                  </button>
                </li>
              )
            })}
          </ul>
          <button onClick={() => setSelectedCard(null)}>← Back</button>
        </div>
      )}
    </>
  )
}
