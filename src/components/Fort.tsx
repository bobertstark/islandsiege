import React from 'react'
import IFort from 'common/IFort'
import FortGrid from './FortGrid'
import DescriptionText from 'components/DescriptionText'

interface FortProps {
  fort: IFort
  // highlighted by an enclosing group (e.g. hover) — fort and its buildings light up together
  highlighted?: boolean
  // interactive grid props — when provided the grid becomes clickable (e.g. wave phases)
  highlights?: [number, number][]
  dims?: [number, number][]
  selectedGroup?: [number, number][]
  onCellClick?: (loc: [number, number]) => void
}

const Fort: React.FC<FortProps> = ({
  fort,
  highlighted,
  highlights,
  dims,
  selectedGroup,
  onCellClick,
}) => (
  <div
    style={{
      border: highlighted ? '1px solid #aac' : '1px solid #888',
      borderRadius: 6,
      padding: 8,
      marginBottom: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: highlighted ? '#f0f4ff' : '#fff',
      transition: 'background 0.15s, border-color 0.15s',
    }}>
    <strong>{fort.name}</strong>
    <div
      style={{
        whiteSpace: 'pre-line',
        wordBreak: 'break-word',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        lineHeight: 1.35,
        color: '#555',
        marginBottom: 6,
        textAlign: 'center',
        // fixed width + reserved height so every fort wraps identically and
        // cards align in height regardless of an attached building's pressure
        width: 200,
        minHeight: 74,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <DescriptionText text={fort.description} />
    </div>
    <div style={{ margin: '8px 0' }}>
      <FortGrid
        grid={fort.grid}
        view="tableau"
        showLabels
        highlights={highlights}
        dims={dims}
        selectedGroup={selectedGroup}
        onCellClick={onCellClick}
      />
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
  </div>
)

export default Fort
