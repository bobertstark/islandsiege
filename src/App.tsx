import GameBoard from 'components/GameBoard'
import GameDie from 'components/utilities/Die'
import { DEFAULT_DIE_FACE, DieValue } from 'lib/Die'
import React, { useState } from 'react'

// Render state of the game
function GameState(): React.ReactNode {
  const [dieVal, setDieVal] = useState(DEFAULT_DIE_FACE as DieValue) //die value
  const [dieLimit, setDieLimit] = useState(2 as number) // limit of rolls for the dice

  // callback function used by the die to update parent die value
  function updateDieVal(val_: DieValue): void {
    setDieVal(val_)
  }

  // pass limit and callback function to die
  return (
    <>
      <GameBoard />
      <p>Die value in app is: {dieVal}</p>
      <button
        onClick={() => {
          setDieLimit(dieLimit + 1)
        }}>
        Increase Roll Limit
      </button>
      <GameDie rollLimit={dieLimit} sendValue={updateDieVal} />
    </>
  )
}

const App = () => {
  return (
    <>
      <GameState />
    </>
  )
}

export default App
