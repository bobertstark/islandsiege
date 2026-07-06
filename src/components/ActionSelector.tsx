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
  // Actions blocked by an opponent's in-play building, keyed by action
  // ('draw'/'buildBuilding'/'buildShip') → a note naming the offending building.
  // The matching button is locked and shows the note when clicked.
  prohibitedNotes?: Partial<Record<string, string>>
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
  prohibitedNotes = {},
  onSelect,
}) => {
  type Picker = 'attack' | 'fort' | 'building' | 'ship'
  const [activePicker, setActivePicker] = useState<Picker | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const showAttackPicker = activePicker === 'attack'
  const showFortPicker = activePicker === 'fort'
  const showBuildingPicker = activePicker === 'building'
  const showShipPicker = activePicker === 'ship'

  function togglePicker(p: Picker) {
    setNote(null)
    setActivePicker(v => (v === p ? null : p))
  }

  const hand = Array.isArray(player.hand) ? player.hand : []
  const forts = player.forts

  const fortCards = hand.filter(c => c.type === 'fort')
  const buildingCards = buildableBuildings(hand, forts)
  const shipCards = buildableShips(hand, forts)

  function pick(action: string, cardID: string) {
    setNote(null)
    setActivePicker(null)
    onSelect(action, cardID)
  }

  const drawLock = prohibitedNotes['draw']
  const buildingLock = prohibitedNotes['buildBuilding']
  const shipLock = prohibitedNotes['buildShip']
  const lockedStyle: React.CSSProperties = {
    background: '#9e9e9e',
    color: '#eee',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    fontWeight: 600,
    cursor: 'help',
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
          onClick={() =>
            drawLock ? setNote(drawLock) : (setNote(null), onSelect('draw'))
          }
          style={
            drawLock
              ? lockedStyle
              : {
                  background: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }
          }>
          {drawLock ? '🔒 ' : ''}Draw
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
            onClick={() =>
              buildingLock ? setNote(buildingLock) : togglePicker('building')
            }
            style={
              buildingLock
                ? lockedStyle
                : {
                    background: '#795548',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }
            }>
            {buildingLock ? '🔒 ' : ''}Build Building
            {buildingLock ? '' : showBuildingPicker ? ' ▲' : ' ▼'}
          </button>
        )}
        {shipCards.length > 0 && (
          <button
            onClick={() =>
              shipLock ? setNote(shipLock) : togglePicker('ship')
            }
            style={
              shipLock
                ? lockedStyle
                : {
                    background: '#795548',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }
            }>
            {shipLock ? '🔒 ' : ''}Build Ship
            {shipLock ? '' : showShipPicker ? ' ▲' : ' ▼'}
          </button>
        )}
      </div>

      {note && (
        <p
          style={{
            margin: '0 0 12px',
            padding: '8px 12px',
            background: '#fbeaea',
            border: '1px solid #e0b4b4',
            borderRadius: 6,
            color: '#922',
            fontSize: 13,
          }}>
          🔒 {note}
        </p>
      )}

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
