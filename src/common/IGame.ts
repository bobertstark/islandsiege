import IGameState from './IGameState'

// A game record: gameID + state. Server metadata (lobby, ownership) can grow
// here without touching IGameState.
export default interface IGame {
  id: string
  state: IGameState
}
