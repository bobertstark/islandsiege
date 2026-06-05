import React from 'react'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'
import FortGroup from './FortGroup'
import PlayerShip from './PlayerShip'

interface TableauPanelProps {
  view: IGameStateView
}

const TableauPanel: React.FC<TableauPanelProps> = ({ view }) => {
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
      {view.players.map((player: IPlayerView, idx: number) => {
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
              <span
                style={{
                  fontWeight: 700,
                  color: player.color ?? undefined,
                  fontSize: 15,
                }}>
                {player.name}'s Tableau
              </span>
              {shipIsHome && <PlayerShip color={player.color} size={24} />}
            </div>
            {/* Fort groups */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(160px, max-content))',
                gap: 8,
              }}>
              {player.forts.map(fort => {
                const key = `${idx}:${fort.id}`
                return (
                  <FortGroup
                    key={fort.id}
                    fort={fort}
                    buildings={fort.buildings ?? []}
                    attackingShips={attackingShipsMap[key] ?? []}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TableauPanel
