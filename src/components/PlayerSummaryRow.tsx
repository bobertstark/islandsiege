import React from 'react'
import { IPlayerView } from 'common/IGameStateView'
import MeepleIcon from './MeepleIcon'
import CoinIcon from './CoinIcon'
import HandIcon from './HandIcon'
import { ShellColor, ShellColors } from 'common/colors'
import { rotateFrom } from 'common/order'
import { iconLabel } from './styles'

interface PlayerSummaryRowProps {
  players: IPlayerView[]
  activePlayerIndex: number
  controllingPlayerIndex: number
}

const PlayerSummaryRow: React.FC<PlayerSummaryRowProps> = ({
  players,
  activePlayerIndex,
  controllingPlayerIndex,
}) => {
  const sorted = rotateFrom(
    players.map((player, idx) => ({ player, idx })),
    controllingPlayerIndex,
  )
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '10px 16px',
        background: '#fafafa',
        borderBottom: '1px solid #ddd',
        flexWrap: 'wrap',
      }}>
      {sorted.map(({ player, idx }) => {
        const isActive = idx === activePlayerIndex
        const handCount =
          typeof player.hand === 'number' ? player.hand : player.hand.length
        return (
          <div
            key={idx}
            style={{
              border: isActive
                ? `2px solid ${player.color ?? '#222'}`
                : '1px solid #ddd',
              borderRadius: 8,
              padding: '8px 12px',
              minWidth: 140,
              boxShadow: isActive
                ? `0 0 6px ${player.color ?? '#222'}44`
                : undefined,
              background: '#fff',
            }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
              <span
                style={{
                  fontWeight: 700,
                  color: player.color ?? undefined,
                  fontSize: 14,
                }}>
                {player.name}
              </span>
              <span style={iconLabel}>
                <MeepleIcon size={16} color={player.color} />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: player.colonists === 0 ? '#c0392b' : undefined,
                  }}>
                  {player.colonists}
                </span>
              </span>
              <span style={iconLabel}>
                <CoinIcon size={16} />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: player.coins >= 20 ? '#c0392b' : undefined,
                  }}>
                  {player.coins}
                </span>
              </span>
              <span style={iconLabel}>
                <HandIcon size={16} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {handCount}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {(['black', 'gray', 'white'] as ShellColor[]).map(
                  shellColor => (
                    <span
                      key={shellColor}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#333',
                      }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          background: ShellColors[shellColor],
                          border:
                            shellColor === 'white'
                              ? '1px solid #bbb'
                              : undefined,
                          flexShrink: 0,
                        }}
                      />
                      ×{player.shells[shellColor] ?? 0}
                    </span>
                  ),
                )}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PlayerSummaryRow
