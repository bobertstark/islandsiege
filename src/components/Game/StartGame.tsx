import ColorPicker from 'components/ColorPicker'
import { PLAYER_COLORS } from 'common/colors'

export const StartGame = ({
  playerNames,
  setPlayerNames,
  playerColors,
  setPlayerColors,
  handleStartGame,
}: any) => (
  <div className="start-game-container">
    <h2>Start a New Game</h2>
    {[0, 1].map(idx => (
      <div key={idx} className="player-row">
        <input
          name={`player${idx + 1}`}
          type="text"
          placeholder={`Player ${idx + 1} Name`}
          value={playerNames[idx]}
          onChange={e => {
            const names = [...playerNames]
            names[idx] = e.target.value
            setPlayerNames(names)
          }}
          className="player-input"
        />
        <ColorPicker
          allColors={PLAYER_COLORS}
          selectedColor={playerColors[idx]}
          disabledColors={playerColors.filter(
            (c: string, i: number) => i !== idx,
          )}
          onSelect={(color: string) => {
            const colors = [...playerColors]
            colors[idx] = color
            setPlayerColors(colors)
          }}
        />
      </div>
    ))}
    <button
      onClick={() => handleStartGame(playerNames, playerColors)}
      disabled={
        !playerNames[0] ||
        !playerNames[1] ||
        playerColors[0] === playerColors[1]
      }>
      Start Game
    </button>
  </div>
)
