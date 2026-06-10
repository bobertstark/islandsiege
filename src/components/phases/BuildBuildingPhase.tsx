import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import Card from 'components/Card'
import ActionInstructions from 'components/ActionInstructions'
import { CARD_EFFECTS } from 'common/cardEffects'
import { EffectTarget } from 'common/handlers/onBuildEffects'

interface BuildBuildingPhaseProps {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

function eligibleForts(forts: IFort[], cost: number): IFort[] {
  return forts.filter(f => f.usedSlots >= cost)
}

type TargetKind =
  | 'opponent'
  | 'opponentBuilding'
  | 'opponentShip'
  | 'selfForts'
  | null

function targetKind(cardID: string): TargetKind {
  switch (CARD_EFFECTS[cardID]?.onBuild?.type) {
    case 'discardOpponentCard':
      return 'opponent'
    case 'destroyOpponentBuilding':
      return 'opponentBuilding'
    case 'destroyOpponentShip':
      return 'opponentShip'
    case 'convertColonistsToCoins':
      return 'selfForts'
    default:
      return null
  }
}

export const BuildBuildingPhase: React.FC<BuildBuildingPhaseProps> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const player = view.players[view.currentPlayerIndex]
  const hand = Array.isArray(player?.hand) ? player.hand : []
  const buildingCards = hand.filter(c => c.type === 'building')

  const preselected = view.pendingBuildCardID
    ? (buildingCards.find(c => c.id === view.pendingBuildCardID) ?? null)
    : null

  const [selectedCard, setSelectedCard] = useState<ICard | null>(preselected)
  const [fortID, setFortID] = useState<string | null>(null)
  const [colonistRemovals, setColonistRemovals] = useState<
    Record<string, number>
  >({})

  const opponents = view.players
    .map((p, idx) => ({ p, idx }))
    .filter(({ idx }) => idx !== view.currentPlayerIndex)

  function build(target?: EffectTarget) {
    if (!selectedCard || !fortID) return
    dispatch({
      type: 'buildBuilding',
      payload: { fortID, buildingID: selectedCard.id, effectTarget: target },
    })
  }

  function handleSelectFort(id: string) {
    if (!selectedCard) return
    const kind = targetKind(selectedCard.id)
    if (kind === null) {
      dispatch({
        type: 'buildBuilding',
        payload: { fortID: id, buildingID: selectedCard.id },
      })
      return
    }
    if (kind === 'opponent') {
      if (opponents.length === 1) {
        dispatch({
          type: 'buildBuilding',
          payload: {
            fortID: id,
            buildingID: selectedCard.id,
            effectTarget: { targetPlayerIndex: opponents[0].idx },
          },
        })
        return
      }
    }
    if (kind === 'selfForts') {
      const hasRemovable = forts.some(f => f.id !== id && f.usedSlots > 0)
      if (!hasRemovable) {
        dispatch({
          type: 'buildBuilding',
          payload: { fortID: id, buildingID: selectedCard.id },
        })
        return
      }
    }
    setFortID(id)
    setColonistRemovals({})
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
        title="Build a Building"
        description="Waiting for the active player to construct a building."
      />
    )
  }

  if (selectedCard && fortID) {
    const kind = targetKind(selectedCard.id)
    return (
      <div style={{ padding: '16px 20px' }}>
        <ActionInstructions
          title={`${selectedCard.name} — choose a target`}
          description="Select the target for this building's effect."
        />
        {kind === 'opponent' && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
            {opponents.map(({ p, idx }) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button onClick={() => build({ targetPlayerIndex: idx })}>
                  {p.name} (
                  {typeof p.hand === 'number' ? p.hand : p.hand.length} cards)
                </button>
              </li>
            ))}
          </ul>
        )}
        {kind === 'opponentBuilding' && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
            {opponents.flatMap(({ p, idx }) =>
              p.forts.flatMap(f =>
                f.buildings.map(b => (
                  <li key={`${idx}-${b.id}`} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() =>
                        build({ targetPlayerIndex: idx, buildingID: b.id })
                      }>
                      {p.name}: {b.name} (on {f.name})
                    </button>
                  </li>
                )),
              ),
            )}
          </ul>
        )}
        {kind === 'opponentShip' && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
            {opponents.flatMap(({ p, idx }) =>
              p.ships.map(s => (
                <li key={`${idx}-${s.id}`} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() =>
                      build({ targetPlayerIndex: idx, shipID: s.id })
                    }>
                    {p.name}: {s.name}
                  </button>
                </li>
              )),
            )}
          </ul>
        )}
        {kind === 'selfForts' &&
          (() => {
            const otherForts = forts.filter(f => f.id !== fortID)
            const total = Object.values(colonistRemovals).reduce(
              (s, n) => s + n,
              0,
            )
            return (
              <>
                <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>
                  Coins gained: {total}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
                  {otherForts.map(fort => {
                    const current = colonistRemovals[fort.id] ?? 0
                    return (
                      <li
                        key={fort.id}
                        style={{
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                        <span style={{ minWidth: 140 }}>
                          {fort.name} ({fort.usedSlots} available)
                        </span>
                        <button
                          onClick={() =>
                            setColonistRemovals(prev => ({
                              ...prev,
                              [fort.id]: Math.max(0, (prev[fort.id] ?? 0) - 1),
                            }))
                          }
                          disabled={current === 0}>
                          −
                        </button>
                        <span style={{ minWidth: 20, textAlign: 'center' }}>
                          {current}
                        </span>
                        <button
                          onClick={() =>
                            setColonistRemovals(prev => ({
                              ...prev,
                              [fort.id]: Math.min(
                                fort.usedSlots,
                                (prev[fort.id] ?? 0) + 1,
                              ),
                            }))
                          }
                          disabled={current >= fort.usedSlots}>
                          +
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )
          })()}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => {
              setFortID(null)
              setColonistRemovals({})
            }}>
            ← Back
          </button>
          {kind === 'selfForts' && (
            <button
              onClick={() =>
                build({
                  fortColonistRemovals: Object.fromEntries(
                    Object.entries(colonistRemovals).filter(([, n]) => n > 0),
                  ),
                })
              }>
              Confirm
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {!selectedCard && (
        <div style={{ padding: '16px 20px' }}>
          <ActionInstructions
            title="Build a Building"
            description="Pick a building card from your hand to construct."
          />
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              margin: '16px 0',
            }}>
            {buildingCards.map(card => {
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
                    onClick={
                      canAfford ? id => setSelectedCard(card) : undefined
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
      {selectedCard && !fortID && (
        <div style={{ padding: '16px 20px' }}>
          <ActionInstructions
            title={`Choose a Fort for ${selectedCard.name}`}
            description={`Requires ${selectedCard.cost} colonists on fort.`}
          />
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
