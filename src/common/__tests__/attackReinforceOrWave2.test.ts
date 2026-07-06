import { resolvePostWave1Phase } from '../handlers/attackReinforceOrWave2'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFort } from 'common/fort'
import { addFort } from 'common/player'
import type IGameState from 'common/IGameState'

function stateWithFort(
  diceBank: IGameState['diceBank'],
  gridSpec: [number, number, string][] = [[0, 0, 'B']],
): IGameState {
  const fort = createFort({
    id: 'f1',
    name: 'Test Fort',
    description: '',
    gridSpec,
    slots: 2,
  })
  const base = mockGameState({ phase: 'attackReinforce', diceBank })
  const players = [...base.players]
  players[1] = addFort(players[1], fort)
  return {
    ...base,
    players,
    shipLocations: { 0: { targetPlayerIndex: 1, fortID: 'f1' } },
  }
}

describe('resolvePostWave1Phase', () => {
  it('returns attackDestroy when no dice remain', () => {
    const state = stateWithFort({})
    expect(resolvePostWave1Phase(state)).toBe('attackDestroy')
  })

  it('returns attackReinforce when only shell dice remain', () => {
    const state = stateWithFort({ B: 2 })
    expect(resolvePostWave1Phase(state)).toBe('attackReinforce')
  })

  it('returns attackWave2 when only T dice remain and shells exist on target', () => {
    const state = stateWithFort({ T: 1 })
    expect(resolvePostWave1Phase(state)).toBe('attackWave2')
  })

  it('returns null when both T dice and shell dice remain (player chooses)', () => {
    const state = stateWithFort({ T: 1, W: 1 })
    expect(resolvePostWave1Phase(state)).toBeNull()
  })

  it('returns attackReinforce when T dice remain but no shells left on target', () => {
    // Critical bug case: T > 0 but all shells already destroyed → canWave2 = false
    const emptyGrid: [number, number, string][] = [[0, 0, '.']]
    const state = stateWithFort({ T: 2, B: 1 }, emptyGrid)
    expect(resolvePostWave1Phase(state)).toBe('attackReinforce')
  })

  it('returns attackDestroy when T dice remain but no shells and no shell dice', () => {
    const emptyGrid: [number, number, string][] = [[0, 0, '.']]
    const state = stateWithFort({ T: 1 }, emptyGrid)
    expect(resolvePostWave1Phase(state)).toBe('attackDestroy')
  })

  it('returns attackDestroy when skipReinforce is set, even with shell dice', () => {
    const state = {
      ...stateWithFort({ B: 2 }),
      attackFlags: {
        attackerDiceMinus: 0,
        attackerRerollsMinus: 0,
        banRerollFaces: [],
        mustRerollAll: false,
        skipReinforce: true,
        banShipAbilities: false,
        banBuildingAbilities: false,
        defenderReroll1: false,
        defenderChoosesWave2: false,
      },
    }
    expect(resolvePostWave1Phase(state)).toBe('attackDestroy')
  })
})
