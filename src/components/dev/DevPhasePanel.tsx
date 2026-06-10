import React from 'react'
import IGameState from 'common/IGameState'
import { Phase } from 'common/phases'

const ALL_PHASES: Phase[] = [
  'lobby',
  'initDraw',
  'victory',
  'colonize',
  'action',
  'draw',
  'drawPick',
  'buildFort',
  'buildBuilding',
  'buildShip',
  'attackRoll',
  'attackLeadership',
  'attackWave1',
  'attackReinforceOrWave2',
  'attackReinforce',
  'attackWave2',
  'attackDestroy',
  'endTurn',
  'gameOver',
]

interface Props {
  fullState: IGameState
  updateDraft: (delta: Partial<IGameState>) => void
}

export const DevPhasePanel: React.FC<Props> = ({ fullState, updateDraft }) => (
  <div style={{ marginBottom: 12 }}>
    <strong>Phase</strong>
    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
      <label>
        phase{' '}
        <select
          defaultValue={fullState.phase}
          onChange={e => updateDraft({ phase: e.target.value as Phase })}>
          {ALL_PHASES.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        player{' '}
        <input
          type="number"
          min={0}
          max={fullState.players.length - 1}
          defaultValue={fullState.currentPlayerIndex}
          style={{ width: 40 }}
          onChange={e =>
            updateDraft({ currentPlayerIndex: parseInt(e.target.value) || 0 })
          }
        />
      </label>
    </div>
  </div>
)
