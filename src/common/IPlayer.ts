import ICard from './ICard'
import IFort from './IFort'
import IShip from './IShip'
import { ShellReserve } from './colors'

export default interface IPlayer {
  id: string
  name: string
  color?: string // display colour, chosen at setup
  colonists: number
  coins: number
  attackDice: number
  diceRerolls: number

  hand: ICard[]
  forts: IFort[]
  ships: IShip[]
  shells: ShellReserve
}
