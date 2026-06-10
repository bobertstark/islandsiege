import express from 'express'
import IGameState from 'common/IGameState'
import { getGame, setGame } from './gameRegistry'
import { broadcastToGame } from './socketHandler'
import { gameReducer } from 'common/gameReducer'

const AUTO_PHASES = new Set([
  'victory',
  'colonize',
  'draw',
  'attackReinforce',
  'attackDestroy',
  'endTurn',
])

const router = express.Router()

router.get('/games/:id/state', (req, res) => {
  const state = getGame(req.params.id)
  if (!state) return void res.status(404).json({ error: 'game not found' })
  res.json({ state })
})

router.patch('/games/:id/state', (req, res) => {
  const state = getGame(req.params.id)
  if (!state) return void res.status(404).json({ error: 'game not found' })
  const delta = req.body as Partial<IGameState>
  let updated: IGameState = { ...state, ...delta }

  // If the patch explicitly sets an auto-phase, advance through it so the
  // client lands in an interactive state (same loop the socket handler uses).
  if (delta.phase && AUTO_PHASES.has(delta.phase)) {
    let guard = 0
    while (AUTO_PHASES.has(updated.phase) && guard++ < 10) {
      try {
        updated = gameReducer(updated, { type: updated.phase as any })
      } catch {
        break
      }
    }
  }

  setGame(req.params.id, updated)
  broadcastToGame(req.params.id, updated)
  res.json({ state: updated })
})

export default router
