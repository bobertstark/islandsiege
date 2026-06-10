import express from 'express'
import http from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'
import router from './router'
import devRouter from './devRouter'
import { attachWebSocket } from './socketHandler'
import { setGame } from './gameRegistry'
import { createPlayer } from 'common/player'
import { createDeck } from 'common/deck'
import { GamePhases } from 'common/phases'
import { handleStartGame } from 'common/handlers/startGame'
import { handleInitDraw } from 'common/handlers/initDraw'
import IGameState from 'common/IGameState'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

const app = express()
app.use(express.json())
app.use('/api', router)
if (process.env.NODE_ENV !== 'production') {
  app.use('/dev', devRouter)
}

const buildDir = path.join(process.cwd(), 'dist')
app.use(express.static(buildDir))
app.get('/{*splat}', (_req, res) =>
  res.sendFile(path.join(buildDir, 'index.html')),
)

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })
attachWebSocket(wss)

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
  if (process.env.NODE_ENV !== 'production') {
    const deckState = createDeck()
    const lobby: IGameState = {
      playerCount: 2,
      players: [
        createPlayer('dev0', 'Calico Jack', { color: 'red' }),
        createPlayer('dev1', 'Blackbeard', { color: 'black' }),
      ],
      waitingPlayers: [],
      readyPlayers: [],
      currentPlayerIndex: 0,
      deck: deckState.deck,
      discard: deckState.discard,
      shuffleCount: deckState.shuffleCount,
      drawnCards: [],
      phase: GamePhases.lobby,
      pending: {},
      shipLocations: {},
      shellReserve: {},
      attackIsOpenWater: false,
      attackRoll: undefined,
      attackRerollsRemaining: 0,
      diceBank: {},
      winningPlayerIndex: undefined,
      rngSeed: 42,
      log: [],
    }
    const afterStart = handleStartGame(lobby)
    const initCards = afterStart.initDrawCards ?? {}
    const s1 = handleInitDraw(afterStart, {
      playerIdx: 0,
      cardID: initCards[0][0].id,
    })
    const devState = handleInitDraw(s1, {
      playerIdx: 1,
      cardID: initCards[1][0].id,
    })
    setGame('dev', devState)
    console.log('dev game ready — open /?dev=0 and /?dev=1')
  }
})
