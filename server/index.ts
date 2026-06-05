import express from 'express'
import http from 'http'
import path from 'path'
import { WebSocketServer } from 'ws'
import router from './router'
import { attachWebSocket } from './socketHandler'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

const app = express()
app.use(express.json())
app.use('/api', router)

const buildDir = path.join(process.cwd(), 'dist')
app.use(express.static(buildDir))
app.get('/{*splat}', (_req, res) =>
  res.sendFile(path.join(buildDir, 'index.html')),
)

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })
attachWebSocket(wss)

server.listen(PORT, () => console.log(`listening on ${PORT}`))
