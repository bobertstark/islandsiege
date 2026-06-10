import { handleAttackRoll } from '../handlers/attackRoll'
import { mockGameState } from 'common/__mocks__/mockGameState'
import { createFort } from 'common/fort'
import { createBuildingById } from 'common/cardRegistry'
import { DIE_FACES } from 'common/die'
import type IFort from 'common/IFort'
import type IGameState from 'common/IGameState'

function fortWithBuildings(buildingIds: string[]): IFort {
  const fort = createFort({
    id: 'f0',
    name: 'Test Fort',
    description: '',
    gridSpec: [
      [0, 0, 'B'],
      [0, 1, 'B'],
    ],
    slots: 2,
  })
  return { ...fort, buildings: buildingIds.map(createBuildingById) }
}

function attackerState(buildingIds: string[]): IGameState {
  const base = mockGameState({ attackRoll: undefined, rngSeed: 1 })
  const players = [...base.players]
  players[0] = {
    ...players[0],
    attackDice: 2,
    forts: [fortWithBuildings(buildingIds)],
  }
  return { ...base, players }
}

describe('attacker bonus dice (addDieOnAttack)', () => {
  it('appends one bonus die per in-play addDieOnAttack building', () => {
    const next = handleAttackRoll(attackerState(['armory']), { action: 'init' })
    expect(next.attackRoll).toHaveLength(3)
    expect(next.attackRoll!.slice(0, 2).every(d => DIE_FACES.includes(d))).toBe(
      true,
    )
    expect(next.attackRoll![2]).toBe('G')
  })

  it('appends the face matching each building (cannonSmith → B, cannonballForge → W, gunpowderHouse → T)', () => {
    const next = handleAttackRoll(
      attackerState(['cannonSmith', 'cannonballForge', 'gunpowderHouse']),
      { action: 'init' },
    )
    expect(next.attackRoll).toHaveLength(5)
    expect(next.attackRoll!.slice(2)).toEqual(['B', 'W', 'T'])
  })

  it('adds no extra dice when the attacker has no bonus buildings', () => {
    const next = handleAttackRoll(attackerState([]), { action: 'init' })
    expect(next.attackRoll).toHaveLength(2)
  })

  it('keeps bonus dice fixed when a reroll requests their indices', () => {
    const rolled = handleAttackRoll(attackerState(['armory']), {
      action: 'init',
    })
    const next = handleAttackRoll(rolled, {
      action: 'reroll',
      diceIndicesReroll: [0, 1, 2],
    })
    // index 2 is the armory bonus and must survive the reroll
    expect(next.attackRoll![2]).toBe('G')
    expect(next.attackRoll).toHaveLength(3)
  })
})
