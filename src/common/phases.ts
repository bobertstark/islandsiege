// Game Phases
// Victory - check if player has 0 colonists or >20 gold
// Colonize - move colonists to empty fort spaces
// Action - return fleet and take one of the following sub-actions
//  1. Draw cards - draw 3, keep 2 and give 1 to opponent
//  2. Build (Fort) - play from hand to tableau, add designed cube from general supply, add other cubes from personal supply (score 1 coin per cube)
//  3. Build (Building) - play from hand to fort, move colonists from fort to building, repair fort, score coins
//  4. Build (Ship) - play from hand to tableau, move colonists from (single) fort to ship, score coins
//  5. Attack - move ship to fort
//      5a. Roll dice, use up to # of rerolls
//      5b. Leadership - resolve ship symbols (ship abilities, ship destruction)
//          5b1. Ship - If ship is destroyed, return colonists
//      5c. First wave (fort) - select 1 color (black, gray, white) and use all of that color
//      5d. Choose
//          5d1. Reinforce - add 1 cube to supply for remaining colored dice
//          5d2. Second Wave - resolve red
//      5e. Destruction - If no cubes left, destroy fort and buildings, return colonists

export type Phase =
  | 'initGame'
  | 'resetGame'
  | 'victory'
  | 'colonize'
  | 'action'
  | 'draw'
  | 'giveCard'
  | 'buildFort'
  | 'addFortCubes'
  | 'buildBuilding'
  | 'buildShip'
  | 'attackStart'
  | 'attackRoll'
  | 'attackLeadership'
  | 'attackWave1'
  | 'attackReinforce'
  | 'attackWave2'
  | 'endTurn'
  | 'gameOver'

export const GamePhases = {
  // Game Setup
  initGame: 'initGame',
  resetGame: 'resetGame',
  // Automatic Phases
  victory: 'victory',
  colonize: 'colonize',
  action: 'action',
  // Sub-actions
  draw: 'draw',
  giveCard: 'giveCard',
  buildFort: 'buildFort',
  addFortCubes: 'addFortCubes',
  buildBuilding: 'buildBuilding',
  buildShip: 'buildShip',
  attackStart: 'attackStart',
  attackRoll: 'attackRoll',
  attackLeadership: 'attackLeadership',
  attackWave1: 'attackWave1',
  attackReinforce: 'attackReinforce',
  attackWave2: 'attackWave2',
  // Post-Action Phase
  endTurn: 'endTurn',
  gameOver: 'gameOver',
} as const

export type Action = (typeof GamePhases)[keyof typeof GamePhases]

export const initGame = (playerNames: string[]) => ({
  type: GamePhases.initGame,
  payload: { playerNames },
})

export const drawCards = () => ({
  type: GamePhases.draw,
})

export const giveCard = (toPlayerIndex: number, cardId: string) => ({
  type: GamePhases.giveCard,
  payload: { toPlayerIndex, cardId },
})
