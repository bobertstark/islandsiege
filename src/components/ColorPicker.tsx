import React from 'react'
import './shared.css'

interface Color {
  name: string
  value: string
}

interface ColorPickerProps {
  allColors: Color[]
  disabledColors?: string[]
  selectedColor: string
  onSelect: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  allColors,
  disabledColors = [],
  selectedColor,
  onSelect,
}) => (
  <div className="color-picker">
    {allColors.map(color => {
      const isDisabled =
        disabledColors.includes(color.value) && color.value !== selectedColor
      return (
        <div
          key={color.value}
          className={`color-swatch${selectedColor === color.value ? ' selected' : ''}`}
          onClick={() => !isDisabled && onSelect(color.value)}
          style={{
            background: color.value,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.3 : 1,
            boxShadow:
              selectedColor === color.value ? '0 0 6px #222' : undefined,
            transition: 'opacity 0.2s',
          }}
          title={color.name}
        />
      )
    })}
  </div>
)

export default ColorPicker
