import React, { useState } from 'react'
import type { IPlayerView } from 'common/IGameStateView'
import ICard from 'common/ICard'
import IFort from 'common/IFort'
import IShip from 'common/IShip'
import ActionInstructions from 'components/ActionInstructions'
import Fort from 'components/Fort'
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
    setActivePicker(v => (v === p ? null : p))
  }

  const hand = Array.isArray(player.hand) ? player.hand : []
  const forts = player.forts

  const fortCards = hand.filter(c => c.type === 'fort')
  const buildingCards = buildableBuildings(hand, forts)
  const shipCards = buildableShips(hand, forts)

  function pick(action: string, cardID: string) {
    setActivePicker(null)
    onSelect(action, cardID)
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
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 13,
              color: '#555',
              fontStyle: 'italic',
            }}>
            Select a fort to attack
          </p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.values(
                attackTargets.reduce<Record<number, FortTarget[]>>((acc, t) => {
                  ;(acc[t.targetPlayerIndex] ??= []).push(t)
                  return acc
                }, {}),
              ).map(group => {
                const {
                  targetPlayerIndex,
                  playerName,
                  playerColor,
                  playerShips,
                } = group[0]
                return (
                  <div key={targetPlayerIndex}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: playerColor,
                        marginBottom: 6,
                        fontSize: 13,
                      }}>
                      {playerName}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                      }}>
                      {group.map(t => (
                        <div
                          key={t.fortID}
                          onClick={() => {
                            setActivePicker(null)
                            onSelect(
                              'attack',
                              undefined,
                              t.fortID,
                              undefined,
                              targetPlayerIndex,
                            )
                          }}
                          style={{
                            cursor: 'pointer',
                            outline: '2px solid transparent',
                            borderRadius: 6,
                            padding: 6,
                            transition: 'outline-color 0.15s, background 0.15s',
                            width: 'fit-content',
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
                          <Fort fort={t.fort} color={playerColor} />
                          {t.fort.buildings.map(b => (
                            <Building
                              key={b.id}
                              building={b}
                              color={playerColor}
                            />
                          ))}
                        </div>
                      ))}
                      {playerShips.map(s => (
                        <Ship key={s.id} ship={s} color={playerColor} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showFortPicker && (
        <div style={{ padding: '12px 0' }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 13,
              color: '#555',
              fontStyle: 'italic',
            }}>
            Select a fort to build
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {fortCards.map(card => (
              <Card
                key={card.id}
                card={card}
                hideType
                onClick={() => pick('buildFort', card.id)}
              />
            ))}
          </div>
        </div>
      )}

      {showBuildingPicker && (
        <div style={{ padding: '12px 0' }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 13,
              color: '#555',
              fontStyle: 'italic',
            }}>
            Select a building to build
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {buildingCards.map(card => (
              <Card
                key={card.id}
                card={card}
                hideType
                onClick={() => pick('buildBuilding', card.id)}
              />
            ))}
          </div>
        </div>
      )}

      {showShipPicker && (
        <div style={{ padding: '12px 0' }}>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: 13,
              color: '#555',
              fontStyle: 'italic',
            }}>
            Select a ship to build
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {shipCards.map(card => (
              <Card
                key={card.id}
                card={card}
                hideType
                onClick={() => pick('buildShip', card.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionSelector
