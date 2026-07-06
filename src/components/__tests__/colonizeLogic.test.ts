import { colonizeBanNote } from '../colonizeLogic'
import { createPlayer } from 'common/player'
import { createFortById, createBuildingById } from 'common/cardRegistry'

describe('colonizeBanNote', () => {
  it('returns undefined when no opponent has a Prison', () => {
    const players = [
      createPlayer('p0', 'p0', { forts: [createFortById('startingFort')] }),
      createPlayer('p1', 'p1', { forts: [createFortById('startingFort')] }),
    ]
    expect(colonizeBanNote({ players }, 0)).toBeUndefined()
  })

  it('names the blocking Prison and its owner', () => {
    const prisonFort = createFortById('startingFort')
    prisonFort.buildings.push(createBuildingById('prison'))
    const players = [
      createPlayer('p0', 'p0', { forts: [createFortById('startingFort')] }),
      createPlayer('p1', 'p1', { forts: [prisonFort] }),
    ]
    expect(colonizeBanNote({ players }, 0)).toBe(
      "p1's Prison blocks your forts from gaining colonists this turn.",
    )
  })

  it('does not block the Prison owner themselves', () => {
    const prisonFort = createFortById('startingFort')
    prisonFort.buildings.push(createBuildingById('prison'))
    const players = [
      createPlayer('p0', 'p0', { forts: [prisonFort] }),
      createPlayer('p1', 'p1', { forts: [createFortById('startingFort')] }),
    ]
    expect(colonizeBanNote({ players }, 0)).toBeUndefined()
  })
})
