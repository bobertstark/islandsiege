import { getSliderState } from '../phaseSliderLogic'

describe('getSliderState', () => {
  describe('main track', () => {
    it('maps victory to victory step', () => {
      const s = getSliderState('victory')
      expect(s.track).toBe('main')
      expect(s.activeStep).toBe('victory')
    })

    it('maps colonize to colonize step', () => {
      const s = getSliderState('colonize')
      expect(s.track).toBe('main')
      expect(s.activeStep).toBe('colonize')
    })

    it('maps action to action step', () => {
      expect(getSliderState('action').activeStep).toBe('action')
    })

    it('maps draw to action step', () => {
      expect(getSliderState('draw').activeStep).toBe('action')
    })

    it('maps drawPick to action step', () => {
      expect(getSliderState('drawPick').activeStep).toBe('action')
    })

    it('maps buildFort to action step', () => {
      expect(getSliderState('buildFort').activeStep).toBe('action')
    })

    it('maps buildBuilding to action step', () => {
      expect(getSliderState('buildBuilding').activeStep).toBe('action')
    })

    it('maps buildShip to action step', () => {
      expect(getSliderState('buildShip').activeStep).toBe('action')
    })

    it('maps endTurn to action step', () => {
      expect(getSliderState('endTurn').activeStep).toBe('action')
    })
  })

  describe('attack track', () => {
    it('maps attackRoll to attackRoll step', () => {
      const s = getSliderState('attackRoll')
      expect(s.track).toBe('attack')
      expect(s.activeStep).toBe('attackRoll')
    })

    it('maps attackLeadership to leadership step', () => {
      const s = getSliderState('attackLeadership')
      expect(s.track).toBe('attack')
      expect(s.activeStep).toBe('leadership')
    })

    it('maps attackWave1 to firstWave step', () => {
      expect(getSliderState('attackWave1').activeStep).toBe('firstWave')
    })

    it('maps attackReinforceOrWave2 to firstWave step (decision pending, wave1 still highlighted)', () => {
      expect(getSliderState('attackReinforceOrWave2').activeStep).toBe(
        'firstWave',
      )
    })

    it('maps attackReinforce to reinforce step', () => {
      expect(getSliderState('attackReinforce').activeStep).toBe('reinforce')
    })

    it('maps attackWave2 to wave2 step', () => {
      expect(getSliderState('attackWave2').activeStep).toBe('wave2')
    })

    it('maps attackDestroy to destruction step', () => {
      expect(getSliderState('attackDestroy').activeStep).toBe('destruction')
    })
  })
})
