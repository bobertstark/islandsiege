import React, { useState } from 'react'
import IGameStateView from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import { shellInfo } from 'common/fortGrid'
import { removeColonists } from 'common/fort'
import { colorToSymbol } from 'common/colors'
import { CARD_EFFECTS } from 'common/cardEffects'
import { EffectTarget } from 'common/handlers/onBuildEffects'
import Card from 'components/Card'
import Fort from 'components/Fort'
import Building from 'components/Building'
import Ship from 'components/Ship'
import DescriptionText from 'components/DescriptionText'
import ActionInstructions from 'components/ActionInstructions'

interface BuildBuildingPhaseProps {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
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

function emptyCells(fort: IFort): [number, number][] {
  return shellInfo(fort.grid)
    .filter(s => s.color === null)
    .map(s => s.loc)
}

function needsRepair(card: ICard, fort: IFort): boolean {
  return !!card.repair?.[0] && emptyCells(fort).length > 0
}

// A tableau tile (Building/Ship/etc.) wrapped to be clickable with a hover
// outline, matching the attack picker's selectable cards.
function PickTile({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        outline: '2px solid transparent',
        borderRadius: 6,
        padding: 6,
        transition: 'outline-color 0.15s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.outlineColor = '#27ae60'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.outlineColor = 'transparent'
      }}>
      {children}
    </div>
  )
}

type Stage = 'card' | 'fort' | 'repair' | 'target'

export const BuildBuildingPhase: React.FC<BuildBuildingPhaseProps> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const player = view.players[view.currentPlayerIndex]
  const hand = Array.isArray(player?.hand) ? player.hand : []
  const buildingCards = hand.filter(c => c.type === 'building')
  const forts = player?.forts ?? []

  const preselected = view.pendingBuildCardID
    ? (buildingCards.find(c => c.id === view.pendingBuildCardID) ?? null)
    : null

  const [stage, setStage] = useState<Stage>(preselected ? 'fort' : 'card')
  const [selectedCard, setSelectedCard] = useState<ICard | null>(preselected)
  const [chosenFortID, setChosenFortID] = useState<string | null>(null)
  const [repairAt, setRepairAt] = useState<[number, number] | null>(null)
  const [colonistRemovals, setColonistRemovals] = useState<
    Record<string, number>
  >({})

  const opponents = view.players
    .map((p, idx) => ({ p, idx }))
    .filter(({ idx }) => idx !== view.currentPlayerIndex)

  function build(
    fortID: string,
    repair: [number, number] | null,
    target?: EffectTarget,
  ) {
    if (!selectedCard) return
    dispatch({
      type: 'buildBuilding',
      payload: {
        fortID,
        buildingID: selectedCard.id,
        repairAt: repair ?? undefined,
        effectTarget: target,
      },
    })
  }

  // After fort + repair are resolved, dispatch immediately or enter the
  // effect-target stage when the building needs a player-chosen target.
  function proceed(fortID: string, repair: [number, number] | null) {
    if (!selectedCard) return
    const kind = targetKind(selectedCard.id)
    if (kind === null) return build(fortID, repair)
    if (kind === 'opponent' && opponents.length === 1)
      return build(fortID, repair, { targetPlayerIndex: opponents[0].idx })
    if (kind === 'selfForts') {
      const hasRemovable = forts.some(f => f.id !== fortID && f.usedSlots > 0)
      if (!hasRemovable) return build(fortID, repair)
    }
    setChosenFortID(fortID)
    setRepairAt(repair)
    setColonistRemovals({})
    setStage('target')
  }

  function handleSelectCard(card: ICard) {
    setSelectedCard(card)
    setStage('fort')
  }

  function handleSelectFort(fort: IFort) {
    setChosenFortID(fort.id)
    if (selectedCard && needsRepair(selectedCard, fort)) {
      setStage('repair')
      return
    }
    proceed(fort.id, null)
  }

  function handleRepairCell(loc: [number, number]) {
    setRepairAt(loc)
    if (chosenFortID) proceed(chosenFortID, loc)
  }

  function resetToCard() {
    setSelectedCard(null)
    setChosenFortID(null)
    setRepairAt(null)
    setColonistRemovals({})
    setStage('card')
  }

  function resetToFort() {
    setChosenFortID(null)
    setRepairAt(null)
    setColonistRemovals({})
    setStage('fort')
  }

  // Back out of the build entirely, returning to the action menu uncommitted.
  function cancel() {
    dispatch({ type: 'action', payload: { actionChosen: 'cancel' } })
  }

  if (!isMyTurn) {
    return (
      <ActionInstructions
        title="Build a Building"
        description="Waiting for the active player to construct a building."
      />
    )
  }

  if (stage === 'card') {
    return (
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
              <Card
                key={card.id}
                card={card}
                hideType
                dimmed={!canAfford}
                onClick={canAfford ? () => handleSelectCard(card) : undefined}
              />
            )
          })}
        </div>
        <button onClick={cancel}>Cancel</button>
      </div>
    )
  }

  if (stage === 'fort' && selectedCard) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <ActionInstructions
          title={`Choose a Fort for ${selectedCard.name}`}
          description={`Requires ${selectedCard.cost} colonists on the fort.`}
        />
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            margin: '12px 0',
          }}>
          {forts.map(fort => {
            const ok =
              selectedCard.cost !== undefined &&
              fort.usedSlots >= selectedCard.cost
            return (
              <div
                key={fort.id}
                onClick={() => ok && handleSelectFort(fort)}
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
          <button onClick={resetToCard}>← Back</button>
          <button onClick={cancel}>Cancel</button>
        </div>
      </div>
    )
  }

  if (stage === 'repair' && selectedCard && chosenFortID) {
    const fort = forts.find(f => f.id === chosenFortID)
    if (!fort) return null
    return (
      <div style={{ padding: '16px 20px' }}>
        <ActionInstructions
          title={`Place repair shell for ${selectedCard.name}`}
          description="Click an empty cell to place the repair shell."
        />
        <p style={{ margin: '8px 0' }}>
          <DescriptionText
            text={`Place the repair shell ${
              selectedCard.repair?.[0]
                ? `[${colorToSymbol(selectedCard.repair[0])}]`
                : ''
            }`}
          />
        </p>
        <Fort
          fort={fort}
          color={player?.color}
          highlights={emptyCells(fort)}
          onCellClick={handleRepairCell}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={resetToFort}>← Back</button>
          <button onClick={cancel}>Cancel</button>
        </div>
      </div>
    )
  }

  if (stage === 'target' && selectedCard && chosenFortID) {
    const kind = targetKind(selectedCard.id)
    const otherForts = forts.filter(
      f => f.id !== chosenFortID && f.usedSlots > 0,
    )
    const total = Object.values(colonistRemovals).reduce((s, n) => s + n, 0)
    const copy: Record<string, { title: string; description: string }> = {
      opponent: {
        title: `${selectedCard.name} — choose an opponent`,
        description: 'Discard a random card from the chosen opponent’s hand.',
      },
      opponentBuilding: {
        title: `${selectedCard.name} — choose a building to destroy`,
        description: 'Destroy any opponent’s building.',
      },
      opponentShip: {
        title: `${selectedCard.name} — choose a ship to destroy`,
        description: 'Destroy any opponent’s ship.',
      },
      selfForts: {
        title: `${selectedCard.name} — convert colonists`,
        description:
          'Remove colonists from your other forts to gain 1 coin each.',
      },
    }
    const instructions = (kind && copy[kind]) ?? {
      title: `${selectedCard.name} — choose a target`,
      description: "Select the target for this building's effect.",
    }
    return (
      <div style={{ padding: '16px 20px' }}>
        <ActionInstructions
          title={instructions.title}
          description={instructions.description}
        />
        {kind === 'opponent' && (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
            {opponents.map(({ p, idx }) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button
                  onClick={() =>
                    build(chosenFortID, repairAt, { targetPlayerIndex: idx })
                  }>
                  {p.name} (
                  {typeof p.hand === 'number' ? p.hand : p.hand.length} cards)
                </button>
              </li>
            ))}
          </ul>
        )}
        {kind === 'opponentBuilding' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              margin: '12px 0',
            }}>
            {opponents
              .filter(({ p }) => p.forts.some(f => f.buildings.length > 0))
              .map(({ p, idx }) => (
                <div key={idx}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: p.color,
                      marginBottom: 6,
                      fontSize: 13,
                    }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {p.forts.flatMap(f =>
                      f.buildings.map(b => (
                        <PickTile
                          key={`${idx}-${b.id}`}
                          onClick={() =>
                            build(chosenFortID, repairAt, {
                              targetPlayerIndex: idx,
                              buildingID: b.id,
                            })
                          }>
                          <Building building={b} color={p.color} />
                        </PickTile>
                      )),
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        {kind === 'opponentShip' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              margin: '12px 0',
            }}>
            {opponents
              .filter(({ p }) => p.ships.length > 0)
              .map(({ p, idx }) => (
                <div key={idx}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: p.color,
                      marginBottom: 6,
                      fontSize: 13,
                    }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {p.ships.map(s => (
                      <PickTile
                        key={`${idx}-${s.id}`}
                        onClick={() =>
                          build(chosenFortID, repairAt, {
                            targetPlayerIndex: idx,
                            shipID: s.id,
                          })
                        }>
                        <Ship ship={s} color={p.color} />
                      </PickTile>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
        {kind === 'selfForts' && (
          <>
            <p style={{ margin: '8px 0 4px', fontWeight: 600 }}>
              Coins gained: {total}
            </p>
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                margin: '12px 0',
              }}>
              {otherForts.map(fort => {
                const current = colonistRemovals[fort.id] ?? 0
                const preview = removeColonists(fort, current).fort
                return (
                  <div
                    key={fort.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                    <Fort fort={preview} color={player?.color} />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
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
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={resetToFort}>← Back</button>
          <button onClick={cancel}>Cancel</button>
          {kind === 'selfForts' && (
            <button
              onClick={() =>
                build(chosenFortID, repairAt, {
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

  return null
}
