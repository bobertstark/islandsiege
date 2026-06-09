import { handleAttackWave1 } from '../handlers/attackWave1'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFort } from 'common/fort'
import { addFort } from 'common/player'
import type IGameState from 'common/IGameState'

function stateWithFort(diceBank: IGameState['diceBank']): IGameState {
  const fort = createFort({
    id: 'f1',
    name: 'Test Fort',
    description: '',
    gridSpec: [
      [0, 0, 'B'],
      [0, 1, 'B'],
    ],
    slots: 2,
  })
  const base = mockGameState({ phase: 'attackWave1', diceBank })
  const players = [...base.players]
  players[1] = addFort(players[1], fort)
  return {
    ...base,
    players,
    shipLocations: { 0: { targetPlayerIndex: 1, fortID: 'f1' } },
  }
}

describe('handleAttackWave1', () => {
  it('destroys the targeted shell group and removes color dice from bank', () => {
    const state = stateWithFort({ B: 3, W: 1 })
    const next = handleAttackWave1(state, {
      attackColor: 'B',
      attackLoc: [0, 0],
    })
    expect(next.phase).toBe('attackReinforce')
    expect(next.diceBank.B).toBeUndefined()
    expect(next.diceBank.W).toBe(1)
    const fort = next.players[1].forts.find(f => f.id === 'f1')!
    // both connected B shells destroyed
    expect(fort.grid[0][0]).toMatchObject({ type: 'shell', color: null })
    expect(fort.grid[0][1]).toMatchObject({ type: 'shell', color: null })
  })

  it('removes color dice but leaves grid unchanged when attackLoc is absent', () => {
    const state = stateWithFort({ B: 1, W: 1 })
    const next = handleAttackWave1(state, { attackColor: 'B' })
    expect(next.phase).toBe('attackReinforce')
    expect(next.diceBank.B).toBeUndefined()
    expect(next.diceBank.W).toBe(1)
    const fort = next.players[1].forts.find(f => f.id === 'f1')!
    // shells untouched
    expect(fort.grid[0][0]).toMatchObject({ type: 'shell', color: 'black' })
    expect(fort.grid[0][1]).toMatchObject({ type: 'shell', color: 'black' })
  })
})
