import React, { useState } from 'react'
import type { IPlayerView } from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import IShip from 'common/IShip'
import {} from 'common/cardRegistry'
import { shellInfo } from 'common/fortGrid'
import { colorToSymbol } from 'common/colors'
import DescriptionText from 'components/DescriptionText'
import ActionInstructions from 'components/ActionInstructions'
import Fort from 'components/Fort'
import { FortGrid } from 'components/FortGrid'
import Card from 'components/Card'
import Building from 'components/Building'
import Ship from 'components/Ship'

export interface FortTarget {
  targetPlayerIndex: number
  fortID: string
  playerName: string
  playerColor?: string
  fort: IFort
  playerShips: IShip[]
}

interface ActionSelectorProps {
  player: IPlayerView
  attackTargets: FortTarget[]
  onSelect: (
    action: string,
    cardID?: string,
    fortID?: string,
    repairAt?: [number, number],
    targetPlayerIndex?: number,
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
  attackTargets,
  onSelect,
}) => {
  type Picker = 'attack' | 'fort' | 'building' | 'ship'
  const [activePicker, setActivePicker] = useState<Picker | null>(null)

  const showAttackPicker = activePicker === 'attack'
  const showFortPicker = activePicker === 'fort'
  const showBuildingPicker = activePicker === 'building'
  const showShipPicker = activePicker === 'ship'

  function togglePicker(p: Picker) {
    // re-opening a picker also backs out of any in-progress fort selection
    setPendingBuildAction(null)
    setPendingRepairFort(null)
    setActivePicker(v => (v === p ? null : p))
  }
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
    setActivePicker(null)
    onSelect(action, cardID)
  }

  function handleCardPicked(action: string, card: ICard) {
    setActivePicker(null)
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
      <ActionInstructions title="Choose Your Action" />
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => togglePicker('attack')}
          style={{
            background: '#c0392b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
          Attack{showAttackPicker ? ' ▲' : ' ▼'}
        </button>
        <button
          onClick={() => onSelect('draw')}
          style={{
            background: '#27ae60',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
          Draw
        </button>
        {fortCards.length > 0 && (
          <button
            onClick={() => togglePicker('fort')}
            style={{
              background: '#795548',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Build Fort{showFortPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {buildingCards.length > 0 && (
          <button
            onClick={() => togglePicker('building')}
            style={{
              background: '#795548',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Build Building{showBuildingPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {shipCards.length > 0 && (
          <button
            onClick={() => togglePicker('ship')}
            style={{
              background: '#795548',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            Build Ship{showShipPicker ? ' ▲' : ' ▼'}
          </button>
        )}
      </div>

      {showAttackPicker && (
        <div style={{ padding: '12px 0' }}>
          {attackTargets.length === 0 ? (
            <button
              onClick={() => {
                setActivePicker(null)
                onSelect('attack', undefined, undefined, undefined, -1)
              }}
              style={{
                background: '#2980b9',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
              Open Waters
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attackTargets.map(t => (
                <div
                  key={`${t.targetPlayerIndex}-${t.fortID}`}
                  onClick={() => {
                    setActivePicker(null)
                    onSelect(
                      'attack',
                      undefined,
                      t.fortID,
                      undefined,
                      t.targetPlayerIndex,
                    )
                  }}
                  style={{
                    cursor: 'pointer',
                    outline: '2px solid transparent',
                    borderRadius: 6,
                    padding: 8,
                    transition: 'outline-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.outlineColor = '#c0392b'
                    el.style.background = '#fff5f5'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.outlineColor = 'transparent'
                    el.style.background = 'transparent'
                  }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: t.playerColor,
                      marginBottom: 6,
                      fontSize: 13,
                    }}>
                    {t.playerName}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                    }}>
                    <Fort fort={t.fort} color={t.playerColor} />
                    {t.fort.buildings.map(b => (
                      <Building key={b.id} building={b} color={t.playerColor} />
                    ))}
                    {t.playerShips.map(s => (
                      <Ship key={s.id} ship={s} color={t.playerColor} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showFortPicker && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            padding: '12px 0',
          }}>
          {fortCards.map(card => (
            <Card
              key={card.id}
              card={card}
              hideType
              onClick={() => pick('buildFort', card.id)}
            />
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
            <Card
              key={card.id}
              card={card}
              hideType
              onClick={() => handleCardPicked('buildBuilding', card)}
            />
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
            <Card
              key={card.id}
              card={card}
              hideType
              onClick={() => handleCardPicked('buildShip', card)}
            />
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
          {pendingRepairFort ? (
            <div>
              <p style={{ marginBottom: 8 }}>
                <DescriptionText
                  text={`Place the repair shell ${
                    pendingBuildAction.card.repair?.[0]
                      ? `[${colorToSymbol(pendingBuildAction.card.repair[0])}]`
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
                    <Fort fort={fort} color={player.color} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActionSelector
