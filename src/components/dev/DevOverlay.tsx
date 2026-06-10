import React, { useState, useCallback } from 'react'
import IGameState from 'common/IGameState'
import { DevAttackPanel } from './DevAttackPanel'
import { DevPhasePanel } from './DevPhasePanel'
import { DevCardsPanel } from './DevCardsPanel'
import { DevPlayerPanel } from './DevPlayerPanel'
import { DevTableauPanel } from './DevTableauPanel'

interface Props {
  gameId: string
}

export const DevOverlay: React.FC<Props> = ({ gameId }) => {
  const [open, setOpen] = useState(false)
  const [fullState, setFullState] = useState<IGameState | null>(null)
  const [draft, setDraft] = useState<Partial<IGameState>>({})
  const [status, setStatus] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    setFetchError(null)
    try {
      const res = await fetch(`/dev/games/${gameId}/state`)
      if (!res.ok) {
        setFetchError(`${res.status} ${res.statusText}`)
        return
      }
      const { state } = await res.json()
      setFullState(state)
      setDraft({})
    } catch (e) {
      setFetchError(String(e))
    }
  }, [gameId])

  const handleOpen = () => {
    setOpen(true)
    fetchState()
  }

  const updateDraft = useCallback((delta: Partial<IGameState>) => {
    setDraft(prev => ({ ...prev, ...delta }))
  }, [])

  const handleApply = async () => {
    if (Object.keys(draft).length === 0) return
    setStatus('Applying…')
    await fetch(`/dev/games/${gameId}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    await fetchState()
    setStatus('Applied ✓')
    setTimeout(() => setStatus(''), 1500)
  }

  const hasDraft = Object.keys(draft).length > 0

  return (
    <>
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 9999,
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: 'monospace',
        }}>
        {open ? '✕ Dev' : '⚙ Dev'}
      </button>
      {open && fetchError && (
        <div
          style={{
            position: 'fixed',
            bottom: 56,
            right: 16,
            zIndex: 9998,
            background: '#2d1a1a',
            color: '#f88',
            padding: 12,
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 13,
            maxWidth: 360,
          }}>
          Failed to load state: {fetchError}
          <br />
          <button onClick={fetchState} style={{ marginTop: 8 }}>
            Retry
          </button>
        </div>
      )}
      {open && fullState && (
        <div
          style={{
            position: 'fixed',
            bottom: 56,
            right: 16,
            zIndex: 9998,
            background: '#1a1a2e',
            color: '#eee',
            padding: 16,
            borderRadius: 8,
            width: 360,
            maxHeight: '80vh',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: 13,
            boxShadow: '0 4px 24px #0008',
          }}>
          <h3 style={{ margin: '0 0 12px' }}>Dev Sandbox</h3>
          {(() => {
            // Merge draft into fullState so panels always read accumulated changes,
            // not the stale snapshot. Without this, each panel update rebuilds from
            // the original fetch and overwrites prior edits.
            const liveState: IGameState = { ...fullState, ...draft }
            return (
              <>
                <DevPhasePanel
                  fullState={liveState}
                  updateDraft={updateDraft}
                />
                {liveState.phase.startsWith('attack') && (
                  <DevAttackPanel
                    fullState={liveState}
                    updateDraft={updateDraft}
                  />
                )}
                <DevCardsPanel
                  fullState={liveState}
                  updateDraft={updateDraft}
                />
                <DevPlayerPanel
                  fullState={liveState}
                  updateDraft={updateDraft}
                />
                <DevTableauPanel
                  fullState={liveState}
                  updateDraft={updateDraft}
                />
              </>
            )
          })()}
          <hr style={{ borderColor: '#444', margin: '12px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleApply} disabled={!hasDraft}>
              Apply
            </button>
            <button onClick={fetchState} style={{ opacity: 0.7 }}>
              Refresh
            </button>
            {status && <span style={{ opacity: 0.8 }}>{status}</span>}
          </div>
        </div>
      )}
    </>
  )
}
