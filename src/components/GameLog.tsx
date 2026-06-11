import React from 'react'
import { ILogEntry } from 'common/ILog'
import { IPlayerView } from 'common/IGameStateView'
import { ALL_CARDS } from 'common/cardRegistry'

function playerName(players: IPlayerView[], index: number): string {
  return players[index]?.name ?? `Player ${index + 1}`
}

function cardName(cardID: string): string {
  return ALL_CARDS.find(c => c.id === cardID)?.name ?? cardID
}

function formatLogEntry(entry: ILogEntry, players: IPlayerView[]): string {
  const actor = playerName(players, entry.playerIndex)
  const d = entry.data

  switch (entry.phase) {
    case 'endTurn':
      return `— ${actor}'s turn —`
    case 'action': {
      switch (d.defenderEffect) {
        case 'diceMinus':
          return `${actor} rolls ${d.amount} fewer di${d.amount === 1 ? 'e' : 'ce'}`
        case 'rerollsMinus':
          return `${actor} has ${d.amount} fewer reroll${d.amount !== 1 ? 's' : ''}`
        case 'banReroll':
          return `${actor} cannot reroll [${d.face}] results`
        case 'mustRerollAll':
          return `${actor} must reroll all dice`
        case 'skipReinforce':
          return `${actor} cannot reinforce (Secret Fortress)`
        case 'banShipAbilities':
          return `${actor}'s ships' abilities are disabled (Reefside Fortress)`
        case 'banBuildingAbilities':
          return `${actor}'s building abilities are disabled (Secluded Fortress)`
        case 'returnAttackerShipColonist':
          return `${actor} loses a colonist from ${cardName(d.shipID as string)} (Cove Outpost)`
        case 'saboteurDestroyCube':
          return `${actor} loses 1 ${d.shellColor} shell (Saboteur Outpost)`
      }
      if (d.openWater) return `${actor} attacked open water`
      const target = playerName(players, d.targetPlayerIndex as number)
      const fort = d.fortID ? cardName(d.fortID as string) : ''
      return `${actor} attacked ${target}${fort ? `'s ${fort}` : ''}`
    }
    case 'drawPick': {
      const ids = d.cardIDs as string[] | undefined
      const count = d.drawnCount as number
      const discarded = d.discardedCardID as string
      const drew = ids
        ? ids
            .filter(id => id !== discarded)
            .map(cardName)
            .join(', ')
        : `${count - 1} card${count - 1 !== 1 ? 's' : ''}`
      return `${actor} drew ${drew} and discarded ${ids ? cardName(discarded) : 'a card'}`
    }
    case 'buildFort':
      return `${actor} built ${cardName(d.cardID as string)} (+${d.shellsAdded} shells, +${d.coinsGained} coins)`
    case 'buildBuilding':
      switch (d.onBuild) {
        case 'returnOpponentFortColonist':
          return `${actor}'s Prison returned colonists from opponents' forts`
        case 'discardOpponentCard':
          return `${actor} discarded ${cardName(d.cardID as string)} from ${playerName(players, d.targetPlayerIndex as number)}'s hand`
        case 'destroyOpponentBuilding':
          return `${actor} destroyed ${playerName(players, d.targetPlayerIndex as number)}'s ${cardName(d.buildingID as string)}`
        case 'destroyOpponentShip':
          return `${actor} destroyed ${playerName(players, d.targetPlayerIndex as number)}'s ${cardName(d.shipID as string)}`
        case 'convertColonistsToCoins':
          return `${actor}'s Silver Smelter converted colonists into ${d.coinsGained} coin${(d.coinsGained as number) !== 1 ? 's' : ''}`
        case 'robustGainCoin':
          return `${actor} gains 1 coin (Robust Stronghold)`
      }
      return `${actor} built ${cardName(d.cardID as string)} on ${cardName(d.fortID as string)}, moving ${d.colonistsMoved} colonist${(d.colonistsMoved as number) !== 1 ? 's' : ''}${d.repairUsed ? ' (repair used)' : ''}`
    case 'buildShip':
      return `${actor} built ${cardName(d.cardID as string)}, moving ${d.colonistsMoved} colonist${(d.colonistsMoved as number) !== 1 ? 's' : ''}`
    case 'attackRoll': {
      if (d.bonusDie !== undefined)
        return `${actor}'s ${cardName(d.cardID as string)} adds [${d.bonusDie}] to attack`
      const rollArr =
        (d.roll as string[] | undefined) ?? (d.finalRoll as string[])
      const rollStr = rollArr.join(', ')
      if (d.finalRoll !== undefined) {
        const rerolls = d.totalRerolls as number
        return `${actor} kept roll: [${rollStr}]${rerolls > 0 ? ` after ${rerolls} reroll${rerolls !== 1 ? 's' : ''}` : ''}`
      }
      const remaining = d.rerollsRemaining as number
      // Initial roll: remaining equals full pool (no rerolls used yet at this point would be ambiguous,
      // so we just show it uniformly as "rolled")
      return `${actor} rolled [${rollStr}] (${remaining} reroll${remaining !== 1 ? 's' : ''} remaining)`
    }
    case 'attackLeadership': {
      if (d.skip) return `${actor} skipped leadership`
      switch (d.effect) {
        case 'destroyShip':
          return `${actor} destroyed ${cardName(d.destroyedCardID as string)} (${d.lSpent}L spent)`
        case 'addDie':
          return `${actor} added [${d.face}] to attack (${d.lSpent}L spent)`
        case 'gainCoin':
          return `${actor} gained 1 coin (${d.lSpent}L spent)`
        case 'returnFortColonist':
          return `${actor} returned a colonist from ${cardName(d.fortID as string)} (${d.lSpent}L spent)`
      }
      return `${actor} used leadership (${d.lSpent}L spent)`
    }
    case 'attackWave1':
      return `${actor} attacked ${playerName(players, d.targetPlayerIndex as number)} with ${d.strength} ${d.attackColor} dice`
    case 'attackWave2':
      return `${actor} wave 2 attacked ${playerName(players, d.targetPlayerIndex as number)} (${(d.attackLocs as unknown[]).length} hit${(d.attackLocs as unknown[]).length !== 1 ? 's' : ''})`
    case 'attackReinforce': {
      const added = d.shellsAdded as Record<string, number>
      const parts = Object.entries(added).map(([c, n]) => `${n} ${c}`)
      return parts.length > 0
        ? `${actor} reinforced: ${parts.join(', ')}`
        : `${actor} reinforced (no shells available)`
    }
    case 'attackDestroy':
      return `${actor} destroyed ${playerName(players, d.targetPlayerIndex as number)}'s ${cardName(d.fortID as string)}`
    case 'colonize':
      if (d.prohibited === 'banFortColonistGain')
        return `${actor}'s forts cannot gain colonists (Prison)`
      return `${actor} moved ${d.colonistsMoved} colonist${(d.colonistsMoved as number) !== 1 ? 's' : ''} to forts`
    case 'victory':
      return `${playerName(players, d.winningPlayerIndex as number)} wins!`
    case 'lobbyJoin':
      return `${d.playerName ?? actor} joined`
    case 'lobbyKick':
      return `${d.kickedName ?? actor} was removed`
    case 'lobbyReady':
      return `${actor} is ready`
    case 'lobbyUnready':
      return `${actor} is no longer ready`
    case 'lobbyStart':
      return 'Game started'
    default:
      return `${actor}: ${entry.phase}`
  }
}

interface GameLogProps {
  log: ILogEntry[]
  players: IPlayerView[]
}

const GameLog: React.FC<GameLogProps> = ({ log, players }) => {
  const [showTimestamps, setShowTimestamps] = React.useState(true)

  return (
    <div
      style={{
        width: 300,
        minWidth: 300,
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#fafafa',
      }}>
      <div
        style={{
          padding: '10px 12px',
          fontWeight: 600,
          fontSize: 13,
          borderBottom: '1px solid #ddd',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        Game Log
        <label
          style={{
            fontSize: 11,
            fontWeight: 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
          <input
            type="checkbox"
            checked={showTimestamps}
            onChange={e => setShowTimestamps(e.target.checked)}
          />
          show time
        </label>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {log.length === 0 && (
          <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            No events yet.
          </div>
        )}
        {log.map((entry, i) => (
          <div
            key={i}
            style={{
              fontSize: 12,
              padding: '4px 0',
              borderBottom: '1px solid #eee',
              color: '#333',
            }}>
            {showTimestamps && (
              <span style={{ color: '#999', marginRight: 6 }}>
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            )}
            {formatLogEntry(entry, players)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameLog
