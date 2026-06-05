import React, { useState } from 'react'
import type { IPlayerView } from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import {
  createFortById,
  createBuildingById,
  createShipById,
} from 'common/cardRegistry'
import { shellInfo } from 'common/fortGrid'
import { colorToSymbol } from 'common/colors'
import DescriptionText from 'components/DescriptionText'
import Fort from 'components/Fort'
import { FortGrid } from 'components/FortGrid'
import Building from 'components/Building'
import Ship from 'components/Ship'

interface ActionSelectorProps {
  player: IPlayerView
  onSelect: (
    action: string,
    cardID?: string,
    fortID?: string,
    repairAt?: [number, number],
  ) => void
}

function buildableBuildings(hand: ICard[], forts: IFort[]): ICard[] {
  return hand.filter(
    c =>
      c.type === 'building' &&
      c.cost !== undefined &&
      forts.some(f => f.usedSlots >= c.cost!),
  )
}

function buildableShips(hand: ICard[], forts: IFort[]): ICard[] {
  return hand.filter(
    c =>
      c.type === 'ship' &&
      c.cost !== undefined &&
      forts.some(f => f.usedSlots >= c.cost!),
  )
}

const ActionSelector: React.FC<ActionSelectorProps> = ({
  player,
  onSelect,
}) => {
  const [showFortPicker, setShowFortPicker] = useState(false)
  const [showBuildingPicker, setShowBuildingPicker] = useState(false)
  const [showShipPicker, setShowShipPicker] = useState(false)
  const [pendingBuildAction, setPendingBuildAction] = useState<{
    action: string
    card: ICard
  } | null>(null)
  const [pendingRepairFort, setPendingRepairFort] = useState<IFort | null>(null)

  const hand = Array.isArray(player.hand) ? player.hand : []
  const forts = player.forts

  const fortCards = hand.filter(c => c.type === 'fort')
  const buildingCards = buildableBuildings(hand, forts)
  const shipCards = buildableShips(hand, forts)

  function pick(action: string, cardID: string) {
    setShowFortPicker(false)
    setShowBuildingPicker(false)
    setShowShipPicker(false)
    onSelect(action, cardID)
  }

  function handleCardPicked(action: string, card: ICard) {
    setShowBuildingPicker(false)
    setShowShipPicker(false)
    setPendingBuildAction({ action, card })
  }

  function handleFortPicked(fort: IFort) {
    if (!pendingBuildAction) return
    if (pendingBuildAction.action === 'buildBuilding') {
      const emptyCells = shellInfo(fort.grid).filter(s => s.color === null)
      if (emptyCells.length > 0) {
        setPendingRepairFort(fort)
        return
      }
    }
    onSelect(pendingBuildAction.action, pendingBuildAction.card.id, fort.id)
    setPendingBuildAction(null)
  }

  function handleRepairCellPicked(loc: [number, number]) {
    if (!pendingBuildAction || !pendingRepairFort) return
    onSelect(
      pendingBuildAction.action,
      pendingBuildAction.card.id,
      pendingRepairFort.id,
      loc,
    )
    setPendingBuildAction(null)
    setPendingRepairFort(null)
  }

  return (
    <div style={{ margin: '24px 0' }}>
      <h2>Choose your action:</h2>
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => onSelect('attack')}>Attack</button>
        <button onClick={() => onSelect('draw')}>Draw</button>
        {fortCards.length > 0 && (
          <button onClick={() => setShowFortPicker(v => !v)}>
            Build Fort{showFortPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {buildingCards.length > 0 && (
          <button onClick={() => setShowBuildingPicker(v => !v)}>
            Build Building{showBuildingPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {shipCards.length > 0 && (
          <button onClick={() => setShowShipPicker(v => !v)}>
            Build Ship{showShipPicker ? ' ▲' : ' ▼'}
          </button>
        )}
      </div>

      {showFortPicker && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {fortCards.map(card => (
            <div
              key={card.id}
              onClick={() => pick('buildFort', card.id)}
              style={{ cursor: 'pointer' }}>
              <Fort fort={createFortById(card.id)} />
            </div>
          ))}
        </div>
      )}

      {showBuildingPicker && !pendingBuildAction && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {buildingCards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardPicked('buildBuilding', card)}
              style={{ cursor: 'pointer' }}>
              <Building building={createBuildingById(card.id)} preview />
            </div>
          ))}
        </div>
      )}

      {showShipPicker && !pendingBuildAction && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {shipCards.map(card => (
            <div
              key={card.id}
              onClick={() => handleCardPicked('buildShip', card)}
              style={{ cursor: 'pointer' }}>
              <Ship ship={createShipById(card.id)} preview />
            </div>
          ))}
        </div>
      )}

      {pendingBuildAction && (
        <div style={{ padding: '12px 0' }}>
          <p style={{ marginBottom: 8 }}>
            Choose a fort to build{' '}
            <strong>{pendingBuildAction.card.name}</strong> at (requires{' '}
            {pendingBuildAction.card.cost} colonists):
          </p>
          {pendingBuildAction.action === 'buildBuilding' &&
          !pendingRepairFort ? (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {forts.map(fort => {
                const ok =
                  pendingBuildAction.card.cost !== undefined &&
                  fort.usedSlots >= pendingBuildAction.card.cost
                return (
                  <div
                    key={fort.id}
                    onClick={() => ok && handleFortPicked(fort)}
                    style={{
                      opacity: ok ? 1 : 0.4,
                      cursor: ok ? 'pointer' : 'default',
                      outline: ok ? '2px solid transparent' : undefined,
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
                    <Fort fort={fort} />
                  </div>
                )
              })}
            </div>
          ) : pendingBuildAction.action === 'buildBuilding' &&
            pendingRepairFort ? (
            <div>
              <p style={{ marginBottom: 8 }}>
                <DescriptionText
                  text={`Place the repair shell ${
                    pendingBuildAction.card.repairColor
                      ? `[${colorToSymbol(pendingBuildAction.card.repairColor)}]`
                      : ''
                  }`}
                />
              </p>
              <FortGrid
                grid={pendingRepairFort.grid}
                view="tableau"
                showLabels
                highlights={shellInfo(pendingRepairFort.grid)
                  .filter(s => s.color === null)
                  .map(s => s.loc)}
                onCellClick={handleRepairCellPicked}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {forts.map(fort => {
                const ok =
                  pendingBuildAction.card.cost !== undefined &&
                  fort.usedSlots >= pendingBuildAction.card.cost
                return (
                  <button
                    key={fort.id}
                    onClick={() => ok && handleFortPicked(fort)}
                    disabled={!ok}
                    style={{ opacity: ok ? 1 : 0.4 }}>
                    {fort.name} — {fort.usedSlots}/{fort.slots}
                  </button>
                )
              })}
            </div>
          )}
          <button
            onClick={() => {
              if (pendingRepairFort) {
                setPendingRepairFort(null)
              } else {
                setPendingBuildAction(null)
              }
            }}
            style={{ marginTop: 10 }}>
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}

export default ActionSelector
