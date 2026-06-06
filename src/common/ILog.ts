import { Phase } from 'common/phases'

export interface ILogEntry {
  phase: Phase
  playerIndex: number
  turn: number
  timestamp: string // ISO 8601 UTC
  data: Record<string, unknown>
}
