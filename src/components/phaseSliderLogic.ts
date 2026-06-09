export type MainStep = 'victory' | 'colonize' | 'action'
export type AttackStep =
  | 'attackRoll'
  | 'leadership'
  | 'firstWave'
  | 'reinforce'
  | 'wave2'
  | 'destruction'

export type SliderState =
  | { track: 'main'; activeStep: MainStep }
  | { track: 'attack'; activeStep: AttackStep }

const ATTACK_PHASES: Record<string, AttackStep> = {
  attackRoll: 'attackRoll',
  attackLeadership: 'leadership',
  attackWave1: 'firstWave',
  attackReinforceOrWave2: 'firstWave',
  attackReinforce: 'reinforce',
  attackWave2: 'wave2',
  attackDestroy: 'destruction',
}

const MAIN_PHASES: Record<string, MainStep> = {
  victory: 'victory',
  colonize: 'colonize',
  action: 'action',
  draw: 'action',
  drawPick: 'action',
  buildFort: 'action',
  buildBuilding: 'action',
  buildShip: 'action',
  endTurn: 'action',
}

export function getSliderState(phase: string): SliderState {
  if (phase in ATTACK_PHASES) {
    return { track: 'attack', activeStep: ATTACK_PHASES[phase] }
  }
  return { track: 'main', activeStep: MAIN_PHASES[phase] ?? 'action' }
}
