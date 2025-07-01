import { IBaseContainer } from './IBase'

export type FortGridSymbol = '.' | 'G' | 'B' | 'W'
export type FortGridSpec = [number, number, FortGridSymbol][]

export default interface IFort extends IBaseContainer {
  slots: number
  grid: FortGridSpec
  buildings: IBaseContainer[]
}
