import ICard from './ICard'
import IFort from './IFort'
import { ShellReserve } from 'game/Game'
import { IBaseContainer } from './IBase'

export default interface IPlayer {
  id: string
  name: string
  colonists: number
  coins: number
  attackDice: number
  diceRerolls: number

  // Custom interfaces & types
  hand: ICard[]
  forts: IFort[]
  ships: IBaseContainer[]
  shells: ShellReserve

  // track ship
  recentAttackedPlayerID?: string
}
