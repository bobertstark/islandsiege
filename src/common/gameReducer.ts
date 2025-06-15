import type { GameState } from '../game/GameState'
import { Fort } from '../game/Fort'
import { Building } from '../game/Building'
import { Ship } from '../game/Ship'
import { Player } from '../game/Player'
import { GamePhases, Phase } from './phases'

export function gameReducer(
  state: GameState,
  phase: { type: Phase; payload?: any },
): GameState {
  switch (phase.type) {
    case GamePhases.initGame:
      return {
        ...state,
        players: phase.payload.playerNames.map(
          (name: string, idx: number) => new Player(name, idx + 1),
        ),
        phase: 'draw',
      }

    case GamePhases.draw: {
      let updatedPlayers
      if (state.currentPlayerIndex === undefined) {
        // Simultaneous: all players draw
        updatedPlayers = state.players.map(player => {
          const drawn = state.deck.draw(3)
          return { ...player, hand: [...player.hand, ...drawn] }
        })
      } else {
        // Only current player draws
        updatedPlayers = state.players.map((player, idx) => {
          if (idx === state.currentPlayerIndex) {
            const drawn = state.deck.draw(3)
            return { ...player, hand: [...player.hand, ...drawn] }
          }
          return player
        })
      }
      return {
        ...state,
        deck: state.deck,
        phase: 'giveCard',
      }
    }

    case GamePhases.giveCard: {
      const { targetPlayerIndex, cardID } = phase.payload

      const players = [...state.players]
      const player = players[state.currentPlayerIndex]
      const target = players[targetPlayerIndex]

      const removedCard = player.removeCardInHand(cardID)
      // TODO: Add case where card is discarded instead
      target.hand = [...target.hand, removedCard]

      // If this is the first time this phase is performed
      // denote that draws will be synchronous from now on.
      if (!state.initDrawComplete) {
        state.initDrawComplete = true
      }
      return {
        ...state,
        phase: 'action', // or end turn
      }
    }

    case GamePhases.victory: {
      const player = state.players[state.currentPlayerIndex]
      if (player.colonists <= 0) {
        state.gameOver = true
        state.winningPlayerIndex = state.currentPlayerIndex
        return {
          ...state,
          phase: 'gameOver',
        }
      }
      if (player.coins >= 20) {
        const opponentWithMore = state.players.some(
          (opp, idx) =>
            idx !== state.currentPlayerIndex && opp.coins >= player.coins,
        )
        if (!opponentWithMore) {
          state.gameOver = true
          state.winningPlayerIndex = state.currentPlayerIndex
          return {
            ...state,
            phase: 'gameOver',
          }
        }
      }
      return {
        ...state,
        phase: 'colonize',
      }
    }

    case GamePhases.colonize: {
      const player = state.players[state.currentPlayerIndex]
      player.populateForts()
      state.players[state.currentPlayerIndex] = player
      return {
        ...state,
        phase: 'action',
      }
    }

    case GamePhases.action: {
      const { actionChosen } = phase.payload
      switch (actionChosen) {
        // TODO: Verify action is valid for player prior to returning
        case 'draw':
          // TODO: Check if any opponents block this action
          return { ...state, phase: GamePhases.draw }
        case 'buildFort':
          return { ...state, phase: GamePhases.buildFort }
        case 'buildBuilding':
          // TODO: Check if any opponents block this action
          return { ...state, phase: GamePhases.buildBuilding }
        case 'buildShip':
          // TODO: Check if any opponents block this action
          return { ...state, phase: GamePhases.buildShip }
        case 'attack':
          return { ...state, phase: GamePhases.attackTarget }
        default:
          throw new Error(`Invalid action ${actionChosen}`)
      }
    }

    case GamePhases.buildFort: {
      const { fortCard } = phase.payload
      const player = state.players[state.currentPlayerIndex]

      const fort = new Fort(fortCard)
      player.addFort(fort)
      state.players[state.currentPlayerIndex] = player
      return {
        ...state,
        phase: 'addFortCubes',
      }
    }

    case GamePhases.addFortCubes: {
      const { fortID, fortGridSpec } = phase.payload

      const player = state.players[state.currentPlayerIndex]
      const fort = player.findFort(fortID)
      // Need to verify this is properly propagated
      // Otherwise, add buildSpec method to Fort class
      const grid = fort.grid
      const cubesBuilt = grid.buildSpec(fortGridSpec)
      if (fortGridSpec.length > cubesBuilt) {
        // sanity check for not all requested builds completing
        throw new Error(`Could not build all ${fortGridSpec} on ${fort.id}`)
      }
      // TODO: Check if opponents reduce this action
      player.coins += cubesBuilt
      state.players[state.currentPlayerIndex] = player
      return {
        ...state,
        phase: 'endTurn',
      }
    }

    case GamePhases.buildBuilding: {
      const { fortID, buildingCard } = phase.payload
      const player = state.players[state.currentPlayerIndex]

      const building = new Building(buildingCard)
      const fort = player.findFort(fortID)
      fort.addBuilding(building) // not sure this gets propagated to player
      state.players[state.currentPlayerIndex] = player
      return {
        ...state,
        phase: 'endTurn',
      }
    }

    case GamePhases.buildBuilding: {
      const { fortID, shipCard } = phase.payload
      const player = state.players[state.currentPlayerIndex]

      const ship = new Ship(shipCard)
      player.addShip(ship, fortID)
      state.players[state.currentPlayerIndex] = player
      return {
        ...state,
        phase: 'endTurn',
      }
    }

    case GamePhases.attackStart: {
      const { targetPlayerIndex } = phase.payload
      const targetPlayer = state.players[targetPlayerIndex]
      if (!targetPlayer.forts) {
        // Check if can open water attack
      }
    }

    // 6/14 TODO:
    // Attack target -> open waters if no opponent forts
    // Attack roll -> reroll -> finalize
    // Attack Phases:
    // Leadership, first wave, reinforce if no target rolls, otherwise choice

    case GamePhases.endTurn: {
      const playerCount = state.players.length
      let nextPlayerIndex = (state.currentPlayerIndex += 1)
      if (nextPlayerIndex > playerCount) {
        nextPlayerIndex = 0
      }
      state.currentPlayerIndex = nextPlayerIndex
      return {
        ...state,
        phase: 'victory',
      }
    }

    case GamePhases.gameOver: {
    }

    default:
      return state
  }
}
