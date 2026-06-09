import React from 'react'
import { getSliderState, MainStep } from './phaseSliderLogic'

const DIM = '#bbb'
const ACTIVE = '#1a1a1a'
const ACTIVE_BG = '#e8f5e9'
const CONNECTOR = '#ddd'

const nodeStyle = (active: boolean): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: active ? 700 : 400,
  color: active ? ACTIVE : DIM,
  background: active ? ACTIVE_BG : 'transparent',
  border: `1px solid ${active ? '#aaa' : CONNECTOR}`,
  borderRadius: 4,
  padding: '1px 6px',
  whiteSpace: 'nowrap',
})

const line: React.CSSProperties = {
  width: 16,
  height: 1,
  background: CONNECTOR,
  flexShrink: 0,
  alignSelf: 'center',
}

const MAIN_LABELS: Record<MainStep, string> = {
  victory: 'victory',
  colonize: 'colonize',
  action: 'action',
}

const PhaseSlider: React.FC<{ phase: string }> = ({ phase }) => {
  const state = getSliderState(phase)

  if (state.track === 'main') {
    const steps: MainStep[] = ['victory', 'colonize', 'action']
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <div style={line} />}
            <div style={nodeStyle(state.activeStep === step)}>
              {MAIN_LABELS[step]}
            </div>
          </React.Fragment>
        ))}
      </div>
    )
  }

  // Attack track
  const { activeStep } = state
  const reinforceActive = activeStep === 'reinforce'
  const wave2Active = activeStep === 'wave2'

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={nodeStyle(activeStep === 'attackRoll')}>attack roll</div>
      <div style={line} />
      <div style={nodeStyle(activeStep === 'leadership')}>leadership</div>
      <div style={line} />
      <div style={nodeStyle(activeStep === 'firstWave')}>first wave</div>
      <div style={line} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={nodeStyle(reinforceActive)}>reinforce</div>
        <div style={nodeStyle(wave2Active)}>wave 2</div>
      </div>
      <div style={line} />
      <div style={nodeStyle(activeStep === 'destruction')}>destruction</div>
    </div>
  )
}

export default PhaseSlider
