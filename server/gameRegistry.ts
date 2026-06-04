import { randomBytes } from 'crypto'
import IGameState from 'common/IGameState'

const games = new Map<string, IGameState>()

function generateId(): string {
  return randomBytes(4).toString('base64url').slice(0, 6)
}

export function createGame(state: IGameState): string {
  let id = generateId()
  // avoid collisions
  while (games.has(id)) id = generateId()
  games.set(id, state)
  return id
}

export function getGame(id: string): IGameState | undefined {
  return games.get(id)
}

export function setGame(id: string, state: IGameState): void {
  games.set(id, state)
}

export function listGames(): string[] {
  return [...games.keys()]
}
