import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import router from './router'
import { attachWebSocket } from './socketHandler'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

const app = express()
app.use(express.json())
app.use('/api', router)

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })
attachWebSocket(wss)

server.listen(PORT, () => console.log(`listening on ${PORT}`))
