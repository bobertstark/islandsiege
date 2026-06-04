import React from 'react'
import './shared.css'

interface PlayerProps {
  children?: React.ReactNode
}

const Player: React.FC<PlayerProps> = ({ children }) => (
  <div className="player">{children}</div>
)

export default Player
