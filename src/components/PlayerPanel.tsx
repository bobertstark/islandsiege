import React from 'react'
import { Player } from '../game/Player'
import Fort from './Fort'
import Building from './Building'
import Ship from './Ship'
import Hand from './Hand'

interface PlayerPanelProps {
  player: Player
  color?: string
  active?: boolean
  onCardSelect?: (cardID: string) => void
  selectedCardID?: string
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  color,
  active,
  onCardSelect,
  selectedCardID,
}) => {
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
      <p>ID: {player.id}</p>
      <p>Colonists: {player.colonists}</p>
      <p>Coins: {player.coins}</p>
      <p>Shells:</p>
      <ul>
        <li>Black: ...</li>
        <li>Gray: ...</li>
        <li>White: ...</li>
      </ul>
      <div style={{ marginTop: 16 }}>
        <h3>Hand ({player.hand.length})</h3>
        <Hand
          cards={player.hand ?? []}
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
        {player.buildings?.length === 0 ? (
          <p>None</p>
        ) : (
          player.buildings?.map((building, i) => (
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
