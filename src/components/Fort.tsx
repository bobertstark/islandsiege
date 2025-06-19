import React from 'react'
import { Fort as FortModel } from '../game/Fort'
import FortGrid from './FortGrid'

interface FortProps {
  fort: FortModel
}

const Fort: React.FC<FortProps> = ({ fort }) => (
  <div
    style={{
      border: '1px solid #888',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
    <strong>{fort.name}</strong>
    <div
      style={{
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        color: '#555',
        marginBottom: 6,
        textAlign: 'center',
        maxWidth: 220,
      }}>
      {fort.description}
    </div>
    <div style={{ margin: '8px 0' }}>
      <FortGrid grid={fort.grid.allCells} view="tableau" showLabels={false} />
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
      }}>
      {Array.from({ length: fort.slots }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '2px solid #888',
            background: i < fort.usedSlots ? '#f1c40f' : '#fff',
            boxSizing: 'border-box',
            transition: 'background 0.2s',
          }}
          title={i < fort.usedSlots ? 'Occupied' : 'Empty'}
        />
      ))}
    </div>
    {fort.buildings && fort.buildings.length > 0 && (
      <div style={{ marginTop: 8 }}>
        <em>Buildings in Fort:</em>
        <ul>
          {fort.buildings.map(b => (
            <li key={b.id}>{b.name}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)

export default Fort
