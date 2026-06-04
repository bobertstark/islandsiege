import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InitPage } from 'components/pages/InitPage'
import { LobbyPage } from 'components/pages/LobbyPage'
import { GamePage } from 'components/pages/GamePage'

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<InitPage />} />
      <Route path="/lobby/:gameId" element={<LobbyPage />} />
      <Route path="/game/:gameId" element={<GamePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)

export default App
