import IGameState from 'common/IGameState'
import { handleBuildBuilding } from './buildBuilding'
import { handleBuildShip } from './buildShip'
import { ILogEntry } from 'common/ILog'
import {
  CARD_EFFECTS,
  deriveAttackFlags,
  prohibitionsAgainst,
} from 'common/cardEffects'
import { removeColonists as removeShipColonists } from 'common/ship'
import { EffectTarget } from 'common/handlers/onBuildEffects'

export function handleAction(
  state: IGameState,
  payload: {
    actionChosen: string
    cardID?: string
    fortID?: string
    repairAt?: [number, number]
    targetPlayerIndex?: number
    effectTarget?: EffectTarget
  },
): IGameState {
  const action = payload.actionChosen
  const base = {
    ...state,
    pendingBuildCardID: payload.cardID,
  }
  const prohibited = prohibitionsAgainst(
    state.players,
    state.currentPlayerIndex,
  )
  switch (action) {
    case 'draw':
      if (prohibited.includes('banDraw'))
        throw new Error('Draw is prohibited by an opponent building')
      return { ...base, phase: 'draw' }
    case 'buildFort':
      return { ...base, phase: 'buildFort' }
    case 'buildBuilding':
      if (prohibited.includes('banBuildBuilding'))
        throw new Error(
          'Building buildings is prohibited by an opponent building',
        )
      if (payload.cardID && payload.fortID) {
        return handleBuildBuilding(state, {
          buildingID: payload.cardID,
          fortID: payload.fortID,
          repairAt: payload.repairAt,
          effectTarget: payload.effectTarget,
        })
      }
      return { ...base, phase: 'buildBuilding' }
    case 'buildShip':
      if (prohibited.includes('banBuildShip'))
        throw new Error('Building ships is prohibited by an opponent building')
      if (payload.cardID && payload.fortID) {
        return handleBuildShip(state, {
          shipID: payload.cardID,
          fortID: payload.fortID,
        })
      }
      return { ...base, phase: 'buildShip' }
    case 'attack': {
      const shipLocations: IGameState['shipLocations'] = {
        ...state.shipLocations,
        [state.currentPlayerIndex]: {},
      }
      const targetPlayerIndex = payload.targetPlayerIndex
      const openWaterAttack =
        targetPlayerIndex === -1 ||
        !state.players.some(
          (p, i) => i !== state.currentPlayerIndex && p.forts.length >= 1,
        )
      if (openWaterAttack) {
        const openWaterEntry: ILogEntry = {
          phase: 'action',
          playerIndex: state.currentPlayerIndex,
          turn: state.currentPlayerIndex,
          timestamp: new Date().toISOString(),
          data: { actionChosen: 'attack', openWater: true },
        }
        return {
          ...base,
          shipLocations,
          attackIsOpenWater: true,
          phase: 'attackRoll',
          log: [...(state.log ?? []), openWaterEntry],
        }
      }
      if (targetPlayerIndex === undefined || targetPlayerIndex < 0) {
        throw new Error('Attack requires a target')
      }
      const alreadyTargeted = Object.values(shipLocations).some(
        loc => loc.targetPlayerIndex === targetPlayerIndex,
      )
      if (alreadyTargeted) {
        throw new Error(`${targetPlayerIndex} cannot be attacked.`)
      }
      const attackEntry: ILogEntry = {
        phase: 'action',
        playerIndex: state.currentPlayerIndex,
        turn: state.currentPlayerIndex,
        timestamp: new Date().toISOString(),
        data: {
          actionChosen: 'attack',
          targetPlayerIndex,
          fortID: payload.fortID ?? '',
        },
      }
      const attackFlags = deriveAttackFlags(
        state.players[targetPlayerIndex].forts,
        payload.fortID ?? '',
      )
      const effectEntry = (data: Record<string, unknown>): ILogEntry => ({
        phase: 'action',
        playerIndex: state.currentPlayerIndex,
        turn: state.currentPlayerIndex,
        timestamp: new Date().toISOString(),
        data,
      })
      const effectEntries: ILogEntry[] = []
      if (attackFlags.attackerDiceMinus > 0)
        effectEntries.push(
          effectEntry({
            defenderEffect: 'diceMinus',
            amount: attackFlags.attackerDiceMinus,
          }),
        )
      if (attackFlags.attackerRerollsMinus > 0)
        effectEntries.push(
          effectEntry({
            defenderEffect: 'rerollsMinus',
            amount: attackFlags.attackerRerollsMinus,
          }),
        )
      for (const face of attackFlags.banRerollFaces)
        effectEntries.push(effectEntry({ defenderEffect: 'banReroll', face }))
      if (attackFlags.mustRerollAll)
        effectEntries.push(effectEntry({ defenderEffect: 'mustRerollAll' }))
      if (attackFlags.skipReinforce)
        effectEntries.push(effectEntry({ defenderEffect: 'skipReinforce' }))
      if (attackFlags.banShipAbilities)
        effectEntries.push(effectEntry({ defenderEffect: 'banShipAbilities' }))
      if (attackFlags.banBuildingAbilities)
        effectEntries.push(
          effectEntry({ defenderEffect: 'banBuildingAbilities' }),
        )

      const targetFortPassive = CARD_EFFECTS[payload.fortID ?? '']?.passive
      const attackerPlayers = [...state.players]
      let attacker = attackerPlayers[state.currentPlayerIndex]

      if (targetFortPassive?.type === 'returnAttackerShipColonist') {
        const shipIdx = attacker.ships.findIndex(s => s.colonists > 0)
        if (shipIdx >= 0) {
          const ships = [...attacker.ships]
          ships[shipIdx] = removeShipColonists(ships[shipIdx], 1)
          attacker = { ...attacker, ships }
          attackerPlayers[state.currentPlayerIndex] = attacker
          effectEntries.push(
            effectEntry({
              defenderEffect: 'returnAttackerShipColonist',
              shipID: ships[shipIdx].id,
            }),
          )
        }
      }

      if (targetFortPassive?.type === 'saboteurDestroyCube') {
        if (attacker.colonists > 0) {
          attacker = { ...attacker, colonists: attacker.colonists - 1 }
          attackerPlayers[state.currentPlayerIndex] = attacker
          effectEntries.push(
            effectEntry({ defenderEffect: 'saboteurDestroyCube' }),
          )
        }
      }

      return {
        ...base,
        players: attackerPlayers,
        attackIsOpenWater: false,
        shipLocations: {
          ...shipLocations,
          [state.currentPlayerIndex]: {
            targetPlayerIndex,
            fortID: payload.fortID ?? '',
          },
        },
        attackFlags,
        phase: 'attackRoll',
        log: [...(state.log ?? []), attackEntry, ...effectEntries],
      }
    }
    default:
      throw new Error(`Invalid action: ${action}`)
  }
}
