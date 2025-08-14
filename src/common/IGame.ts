import { IBase } from './IBase'
import IPlayer from './IPlayer'
import ICard from './ICard'
import { ShellReserve } from 'game/Game'

export default interface IGame extends IBase {
  players: IPlayer[]
  activePlayerIdx: number
  turn: number

  deck: ICard[]
  discard: ICard[]
  shellReserve: ShellReserve
}
