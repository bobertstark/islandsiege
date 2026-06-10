import express from 'express'
import IGameState from 'common/IGameState'
import { getGame, setGame } from './gameRegistry'
import { broadcastToGame } from './socketHandler'

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
  const updated: IGameState = { ...state, ...delta }
  setGame(req.params.id, updated)
  broadcastToGame(req.params.id, updated)
  res.json({ state: updated })
})

export default router
