import React from 'react'
import type ICard from 'common/ICard'
import { createFortGrid } from 'common/fortGrid'
import { colorToSymbol } from 'common/colors'
import { DIE_STYLE } from 'common/die'
import FortGrid from 'components/FortGrid'
import MeepleIcon from 'components/MeepleIcon'
import CoinIcon from 'components/CoinIcon'
import HammerIcon from 'components/HammerIcon'
import DescriptionText from 'components/DescriptionText'
import './shared.css'

interface CardProps {
  card: ICard
  selected?: boolean
  dimmed?: boolean
  hideType?: boolean
  onClick?: (cardID: string) => void
}

const isBuilding = (card: ICard) => card.type === 'building'
const isShip = (card: ICard) => card.type === 'ship'

// TODO: Color coordinate card types for easier visual digest
const Card: React.FC<CardProps> = ({
  card,
  selected,
  dimmed,
  hideType,
  onClick,
}) => {
  const fortGrid = card.gridSpec ? createFortGrid(card.gridSpec) : undefined
  const cls = ['card', selected && 'selected', dimmed && 'dimmed']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} onClick={() => onClick?.(card.id)}>
      <div className="card-title">{card.name}</div>
      {!hideType && <div className="card-type">{card.type}</div>}
      {isBuilding(card) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            margin: '8px 0',
          }}>
          {typeof card.cost === 'number' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MeepleIcon size={16} color="#555" />
              <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                {card.cost}
              </span>
            </span>
          )}
          {typeof card.coins === 'number' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <CoinIcon size={16} />
              <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                {card.coins}
              </span>
            </span>
          )}
          {card.repair && card.repair.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <HammerIcon size={16} />
              {card.repair.map((color, i) => {
                const sym = colorToSymbol(color)
                const s = DIE_STYLE[sym as keyof typeof DIE_STYLE]
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 16,
                      height: 16,
                      background: s?.bg ?? '#ccc',
                      color: s?.text ?? '#000',
                      border: '1px solid #555',
                      borderRadius: 3,
                      fontWeight: 'bold',
                      fontSize: 10,
                    }}>
                    {sym}
                  </span>
                )
              })}
            </span>
          )}
        </div>
      )}
      {isShip(card) &&
        (typeof card.cost === 'number' || typeof card.coins === 'number') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              margin: '8px 0',
            }}>
            {typeof card.cost === 'number' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <MeepleIcon size={16} color="#555" />
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                  {card.cost}
                </span>
              </span>
            )}
            {typeof card.coins === 'number' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <CoinIcon size={16} />
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>
                  {card.coins}
                </span>
              </span>
            )}
          </div>
        )}
      {fortGrid && (
        <div
          style={{
            margin: '8px 0',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <FortGrid grid={fortGrid} view="hand" showLabels />
        </div>
      )}
      {typeof card.slots === 'number' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            margin: '6px 0',
          }}>
          {Array.from({ length: card.slots }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '2px solid #888',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>
      )}
      <div className="card-description">
        <DescriptionText text={card.description} />
      </div>
    </div>
  )
}

export default Card
