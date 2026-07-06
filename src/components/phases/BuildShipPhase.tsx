import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import Card from 'components/Card'
import Fort from 'components/Fort'
import ActionInstructions from 'components/ActionInstructions'

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

  // Back out to the action menu uncommitted (until a general undo exists).
  function cancel() {
    dispatch({ type: 'action', payload: { actionChosen: 'cancel' } })
  }

  const forts = player?.forts ?? []
  const eligible =
    selectedCard?.cost !== undefined
      ? eligibleForts(forts, selectedCard.cost)
      : []
  const eligibleIds = new Set(eligible.map(f => f.id))

  if (!isMyTurn) {
    return (
      <ActionInstructions
        title="Build a Ship"
        description="Waiting for the active player to build a ship."
      />
    )
  }

  return (
    <>
      {!selectedCard && (
        <div style={{ padding: '16px 20px' }}>
          <ActionInstructions
            title="Build a Ship"
            description="Pick a ship card from your hand to build."
          />
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
          <button onClick={cancel}>Cancel</button>
        </div>
      )}
      {selectedCard && (
        <div style={{ padding: '16px 20px' }}>
          <ActionInstructions
            title={`Launch ${selectedCard.name} From a Fort`}
            description={`Requires ${selectedCard.cost} colonists on fort.`}
          />
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              margin: '12px 0',
            }}>
            {forts.map(fort => {
              const ok = eligibleIds.has(fort.id)
              return (
                <div
                  key={fort.id}
                  onClick={() => ok && handleSelectFort(fort.id)}
                  style={{
                    opacity: ok ? 1 : 0.4,
                    cursor: ok ? 'pointer' : 'default',
                    outline: '2px solid transparent',
                    borderRadius: 6,
                    transition: 'outline-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (ok)
                      (e.currentTarget as HTMLDivElement).style.outlineColor =
                        '#27ae60'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLDivElement).style.outlineColor =
                      'transparent'
                  }}>
                  <Fort fort={fort} color={player?.color} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelectedCard(null)}>← Back</button>
            <button onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
