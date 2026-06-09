import React, { useState } from 'react'
import { sectionLabel } from './styles'
import IGameStateView from 'common/IGameStateView'
import IShip from 'common/IShip'
import FortGroup from './FortGroup'
import Ship from './Ship'
import CardInfoPopover from './CardInfoPopover'
import { shipTooltip } from './cardTooltip'
import { rotateFrom } from 'common/order'
import PlayerShip from './PlayerShip'

interface TableauPanelProps {
  view: IGameStateView
  playerIdx: number
}

// Ships highlight individually (forts/buildings highlight as a group); the
// flex wrapper stretches to the row height so the card matches fort height.
const ShipCard: React.FC<{ ship: IShip; color?: string }> = ({
  ship,
  color,
}) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', padding: 6 }}>
      <CardInfoPopover info={shipTooltip(ship)} style={{ display: 'flex' }}>
        <Ship ship={ship} highlighted={hovered} fill color={color} />
      </CardInfoPopover>
    </div>
  )
}

const TableauPanel: React.FC<TableauPanelProps> = ({ view, playerIdx }) => {
  // Build map: fortKey (`playerIdx:fortID`) → list of attacking ships
  const attackingShipsMap: Record<
    string,
    { color?: string; attackerName: string }[]
  > = {}
  for (const [attackerIdxStr, loc] of Object.entries(view.shipLocations)) {
    if (loc.targetPlayerIndex === undefined || loc.fortID === undefined)
      continue
    const attackerIdx = Number(attackerIdxStr)
    const key = `${loc.targetPlayerIndex}:${loc.fortID}`
    if (!attackingShipsMap[key]) attackingShipsMap[key] = []
    attackingShipsMap[key].push({
      color: view.players[attackerIdx]?.color,
      attackerName: view.players[attackerIdx]?.name ?? '',
    })
  }

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
      {rotateFrom(view.players, playerIdx).map((player, i) => {
        const idx = (playerIdx + i) % view.players.length
        const shipIsHome =
          view.shipLocations[idx]?.targetPlayerIndex === undefined

        return (
          <div
            key={idx}
            style={{ borderBottom: '1px solid #eee', paddingBottom: 12 }}>
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}>
              {i === playerIdx ? (
                <span style={sectionLabel}>Your Tableau</span>
              ) : (
                <span
                  style={{
                    fontWeight: 700,
                    color: player.color ?? undefined,
                    fontSize: 15,
                  }}>
                  {player.name}'s Tableau
                </span>
              )}
              {shipIsHome && <PlayerShip color={player.color} size={24} />}
            </div>
            {/* Forts and ships in one horizontal row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {player.forts.map(fort => {
                const key = `${idx}:${fort.id}`
                return (
                  <FortGroup
                    key={fort.id}
                    fort={fort}
                    buildings={fort.buildings ?? []}
                    attackingShips={attackingShipsMap[key] ?? []}
                    color={player.color}
                  />
                )
              })}
              {player.ships.map(ship => (
                <ShipCard key={ship.id} ship={ship} color={player.color} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TableauPanel
