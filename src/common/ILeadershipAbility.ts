export type LeadershipEffect = 'destroyShip'

export default interface ILeadershipAbility {
  cost: number
  effect: LeadershipEffect
}
