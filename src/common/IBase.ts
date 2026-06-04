// Base interfaces

export interface IBase {
  // All game entities will have these properties
  id: string
  name: string
}

export interface IBaseContainer extends IBase {
  // Fort, Ship, and Building can all hold colonists
  colonists: number
}
