import { handleStartGame } from '../handlers/startGame'
import { mockGameState } from '../__mocks__/mockGameState'
import { GamePhases } from '../phases'

// Build a lobby-like state: players exist but have no hand/forts yet
function lobbyState() {
  const state = mockGameState()
  return {
    ...state,
    phase: GamePhases.lobby,
    players: state.players.map(p => ({
      ...p,
      hand: [],
      forts: [],
      shells: {},
    })),
  }
}

describe('handleStartGame', () => {
  it('deals 3 cards to each player', () => {
    const result = handleStartGame(lobbyState())
    result.players.forEach(p => expect(p.hand).toHaveLength(3))
  })

  it('gives each player a Starting Fort', () => {
    const result = handleStartGame(lobbyState())
    result.players.forEach(p => {
      expect(p.forts).toHaveLength(1)
      expect(p.forts[0].id).toBe('startingFort')
    })
  })

  it('transitions to initDiscard phase', () => {
    const result = handleStartGame(lobbyState())
    expect(result.phase).toBe(GamePhases.initDiscard)
  })

  it('preserves player ids and names', () => {
    const lobby = lobbyState()
    const result = handleStartGame(lobby)
    result.players.forEach((p, i) => {
      expect(p.id).toBe(lobby.players[i].id)
      expect(p.name).toBe(lobby.players[i].name)
    })
  })

  it('clears readyPlayers', () => {
    const lobby = { ...lobbyState(), readyPlayers: [0, 1] }
    const result = handleStartGame(lobby)
    expect(result.readyPlayers).toEqual([])
  })

  it('sets shellReserve', () => {
    const result = handleStartGame(lobbyState())
    expect(result.shellReserve).toEqual({ black: 5, white: 5, gray: 5 })
  })

  it('gives each player starting shells', () => {
    const result = handleStartGame(lobbyState())
    result.players.forEach(p =>
      expect(p.shells).toMatchObject({ black: 1, white: 1 }),
    )
  })

  it('sets currentPlayerIndex within player bounds', () => {
    const lobby = lobbyState()
    const result = handleStartGame(lobby)
    expect(result.currentPlayerIndex).toBeGreaterThanOrEqual(0)
    expect(result.currentPlayerIndex).toBeLessThan(lobby.players.length)
  })

  it('ignores ready before lobby is full', () => {
    // lobbyState() has 2 players but playerCount matches — make it underfull
    const state = { ...lobbyState(), playerCount: 3 }
    const result = handleStartGame(state, { playerIdx: 0 })
    expect(result.readyPlayers).toEqual([])
    expect(result.phase).toBe(GamePhases.lobby)
  })

  it('adds playerIdx to readyPlayers once lobby is full', () => {
    const result = handleStartGame(lobbyState(), { playerIdx: 0 })
    expect(result.phase).toBe(GamePhases.lobby)
    expect(result.readyPlayers).toEqual([0])
  })

  it('does not duplicate a playerIdx already in readyPlayers', () => {
    const state = { ...lobbyState(), readyPlayers: [0] }
    const result = handleStartGame(state, { playerIdx: 0 })
    expect(result.readyPlayers).toEqual([0])
    expect(result.phase).toBe(GamePhases.lobby)
  })

  it('starts the game when the last player goes ready', () => {
    const state = { ...lobbyState(), readyPlayers: [0] }
    const result = handleStartGame(state, { playerIdx: 1 })
    expect(result.phase).toBe(GamePhases.initDiscard)
    result.players.forEach(p => expect(p.hand).toHaveLength(3))
  })

  it('is deterministic for a fixed rngSeed', () => {
    const lobby = { ...lobbyState(), rngSeed: 12345 }
    const r1 = handleStartGame(lobby)
    const r2 = handleStartGame(lobby)
    expect(r1.currentPlayerIndex).toBe(r2.currentPlayerIndex)
    expect(r1.players[0].hand.map((c: any) => c.id)).toEqual(
      r2.players[0].hand.map((c: any) => c.id),
    )
  })
})
