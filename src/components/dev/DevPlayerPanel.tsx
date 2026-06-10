import React from 'react'
import IGameState from 'common/IGameState'
import { ShellColor } from 'common/colors'

const SHELL_COLORS: { color: ShellColor; symbol: string }[] = [
  { color: 'black', symbol: 'B' },
  { color: 'white', symbol: 'W' },
  { color: 'gray', symbol: 'G' },
]

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevPlayerPanel: React.FC<Props> = ({ fullState, updateDraft }) => {
  const update = (
    playerIdx: number,
    patch: Partial<(typeof fullState.players)[0]>,
  ) => {
    updateDraft({
      players: fullState.players.map((p, i) =>
        i === playerIdx ? { ...p, ...patch } : p,
      ),
    })
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <strong>Player</strong>
      <div
        style={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
        {fullState.players.map((p, i) => (
          <div key={p.id}>
            <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 4 }}>
              {p.name}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
              <label>
                colonists{' '}
                <input
                  type="number"
                  min={0}
                  defaultValue={p.colonists}
                  style={{ width: 40 }}
                  onChange={e =>
                    update(i, { colonists: parseInt(e.target.value) || 0 })
                  }
                />
              </label>
              <label>
                coins{' '}
                <input
                  type="number"
                  min={0}
                  defaultValue={p.coins}
                  style={{ width: 40 }}
                  onChange={e =>
                    update(i, { coins: parseInt(e.target.value) || 0 })
                  }
                />
              </label>
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ opacity: 0.5, fontSize: 11 }}>shells</span>
                {SHELL_COLORS.map(({ color, symbol }) => (
                  <label key={color}>
                    {symbol}{' '}
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.shells[color] ?? 0}
                      style={{ width: 35 }}
                      onChange={e =>
                        update(i, {
                          shells: {
                            ...p.shells,
                            [color]: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
