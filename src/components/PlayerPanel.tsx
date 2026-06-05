import React from 'react'
import IPlayer from 'common/IPlayer'
import Fort from './Fort'
import Building from './Building'
import Ship from './Ship'
import Hand from './Hand'
import PlayerShip from './PlayerShip'

interface PlayerPanelProps {
  player: IPlayer
  color?: string
  active?: boolean
  onCardSelect?: (cardID: string) => void
  selectedCardID?: string
  shipIsAway?: boolean
  dockedShips?: { color?: string }[]
  handCount?: number
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  color,
  active,
  onCardSelect,
  selectedCardID,
  shipIsAway = false,
  dockedShips = [],
  handCount,
}) => {
  const buildings = player.forts.flatMap(f => f.buildings)

  return (
    <div
      style={{
        border: active ? '3px solid #222' : '1px solid #ccc',
        borderRadius: 8,
        padding: 16,
        minWidth: 320,
        boxShadow: active ? '0 0 10px #222' : undefined,
      }}>
      <h2 style={{ color }}>{player.name}</h2>
      <p>
        Colonists:{' '}
        <span style={{ color: player.colonists === 0 ? 'red' : undefined }}>
          {player.colonists}
        </span>
      </p>
      <p>
        Coins:{' '}
        <span style={{ color: player.coins >= 20 ? 'red' : undefined }}>
          {player.coins}
        </span>
      </p>
      <p>Shells:</p>
      <ul>
        <li>Black: {player.shells.black}</li>
        <li>Gray: {player.shells.gray}</li>
        <li>White: {player.shells.white}</li>
      </ul>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
        {!shipIsAway && <PlayerShip color={color} size={32} />}
        {dockedShips.map((s, i) => (
          <PlayerShip key={i} color={s.color} size={32} />
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <h3>
          Hand (
          {handCount ??
            (typeof player.hand === 'number'
              ? player.hand
              : player.hand.length)}
          )
        </h3>
        <Hand
          cards={typeof player.hand === 'number' ? [] : player.hand}
          onCardSelect={onCardSelect}
          selectedCardID={selectedCardID}
        />
        <h3>Forts</h3>
        {player.forts?.length === 0 ? (
          <p>None</p>
        ) : (
          player.forts?.map((fort, i) => (
            <div key={fort.id ?? i}>
              <Fort fort={fort} />
            </div>
          ))
        )}
        <h3>Buildings</h3>
        {buildings.length === 0 ? (
          <p>None</p>
        ) : (
          buildings.map((building, i) => (
            <Building key={building.id ?? i} building={building} />
          ))
        )}
        <h3>Ships</h3>
        {player.ships?.length === 0 ? (
          <p>None</p>
        ) : (
          player.ships?.map((ship, i) => (
            <Ship key={ship.id ?? i} ship={ship} />
          ))
        )}
      </div>
    </div>
  )
}

export default PlayerPanel
