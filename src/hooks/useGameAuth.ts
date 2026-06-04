export interface GameAuth {
  playerIdx: number
  playerId: string
}

export function saveAuth(gameId: string, auth: GameAuth): void {
  sessionStorage.setItem(`game-auth:${gameId}`, JSON.stringify(auth))
}

export function loadAuth(gameId: string): GameAuth | null {
  const raw = sessionStorage.getItem(`game-auth:${gameId}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameAuth
  } catch {
    return null
  }
}
