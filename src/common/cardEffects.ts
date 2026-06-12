import { DieValue } from './die'
import IPlayer from './IPlayer'
import type ILeadershipAbility from './ILeadershipAbility'
import { DefenderChoiceSpec } from './IGameState'

export type OnBuildEffect =
  | { type: 'discardOpponentCard' }
  | { type: 'returnOpponentFortColonist' }
  | { type: 'convertColonistsToCoins' }
  | { type: 'destroyOpponentBuilding' }
  | { type: 'destroyOpponentShip' }

export type PassiveEffect =
  // Attacker side
  | { type: 'addDieOnAttack'; face: DieValue } // armory, cannonSmith, cannonballForge, gunpowderHouse
  | { type: 'academyExtraReroll' }
  | { type: 'observatorySkipGive' }
  | { type: 'spyOutpostPeek' }
  // Defender side
  | { type: 'attackerRollsMinus1' } // formidableFortress
  | { type: 'attackerRerollsMinus1' } // supportedStronghold
  | { type: 'banRerollFace'; face: DieValue } // bracedStronghold, fortifiedStronghold, reinforcedStronghold
  | { type: 'mustRerollAll' } // steepWalledStronghold
  | { type: 'skipReinforce' } // secretFortress
  | { type: 'defenderChoosesWave2' } // guardedFortress
  | { type: 'defenderReroll1' } // barricadedFortress
  | { type: 'flotillaRollMinus1' } // flotillaOutpost (other forts, not this one)
  | { type: 'banShipAbilities' } // reefsideFortress
  | { type: 'banBuildingAbilities' } // secludedFortress
  | { type: 'returnAttackerShipColonist' } // coveOutpost
  | { type: 'saboteurDestroyCube' } // saboteurOutpost
  | { type: 'returnDestroyedShipToHand' } // lighthouseOutpost
  | { type: 'robustGainCoin' } // robustStronghold
  | { type: 'scoutBuildPenalty' } // scoutOutpost
  // Prohibitions (own buildings restrict opponents)
  | { type: 'banDraw' } // governorsMansion
  | { type: 'banFortColonistGain' } // prison
  | { type: 'banBuildBuilding' } // tradeCompany
  | { type: 'banBuildShip' } // watchtower

export interface CardEffects {
  onBuild?: OnBuildEffect
  passive?: PassiveEffect
  shipAbility?: ILeadershipAbility
}

// Dice/reroll modifiers a defender's forts impose on the current attack.
export interface AttackFlags {
  attackerDiceMinus: number // formidableFortress, flotillaOutpost
  attackerRerollsMinus: number // supportedStronghold
  banRerollFaces: DieValue[] // braced/fortified/reinforcedStronghold
  mustRerollAll: boolean // steepWalledStronghold
  skipReinforce: boolean // secretFortress
  banShipAbilities: boolean // reefsideFortress
  banBuildingAbilities: boolean // secludedFortress
  defenderReroll1: boolean // barricadedFortress
  defenderChoosesWave2: boolean // guardedFortress
}

export const CARD_EFFECTS: Record<string, CardEffects> = {
  armory: { passive: { type: 'addDieOnAttack', face: 'G' } },
  cannonSmith: { passive: { type: 'addDieOnAttack', face: 'B' } },
  cannonballForge: { passive: { type: 'addDieOnAttack', face: 'W' } },
  gunpowderHouse: { passive: { type: 'addDieOnAttack', face: 'T' } },
  academy: { passive: { type: 'academyExtraReroll' } },
  observatory: { passive: { type: 'observatorySkipGive' } },
  spyOutpost: { passive: { type: 'spyOutpostPeek' } },
  formidableFortress: { passive: { type: 'attackerRollsMinus1' } },
  supportedStronghold: { passive: { type: 'attackerRerollsMinus1' } },
  bracedStronghold: { passive: { type: 'banRerollFace', face: 'L' } },
  fortifiedStronghold: { passive: { type: 'banRerollFace', face: 'B' } },
  reinforcedStronghold: { passive: { type: 'banRerollFace', face: 'T' } },
  steepWalledStronghold: { passive: { type: 'mustRerollAll' } },
  secretFortress: { passive: { type: 'skipReinforce' } },
  guardedFortress: { passive: { type: 'defenderChoosesWave2' } },
  barricadedFortress: { passive: { type: 'defenderReroll1' } },
  flotillaOutpost: { passive: { type: 'flotillaRollMinus1' } },
  reefsideFortress: { passive: { type: 'banShipAbilities' } },
  secludedFortress: { passive: { type: 'banBuildingAbilities' } },
  coveOutpost: { passive: { type: 'returnAttackerShipColonist' } },
  saboteurOutpost: { passive: { type: 'saboteurDestroyCube' } },
  lighthouseOutpost: { passive: { type: 'returnDestroyedShipToHand' } },
  robustStronghold: { passive: { type: 'robustGainCoin' } },
  scoutOutpost: { passive: { type: 'scoutBuildPenalty' } },
  governorsMansion: {
    onBuild: { type: 'discardOpponentCard' },
    passive: { type: 'banDraw' },
  },
  prison: {
    onBuild: { type: 'returnOpponentFortColonist' },
    passive: { type: 'banFortColonistGain' },
  },
  tradeCompany: {
    onBuild: { type: 'destroyOpponentBuilding' },
    passive: { type: 'banBuildBuilding' },
  },
  watchtower: {
    onBuild: { type: 'destroyOpponentShip' },
    passive: { type: 'banBuildShip' },
  },
  silverSmelter: { onBuild: { type: 'convertColonistsToCoins' } },
  raven: { shipAbility: { cost: 1, effect: 'addDie', face: 'B' } },
  sisterCatarina: { shipAbility: { cost: 1, effect: 'addDie', face: 'G' } },
  stDaniel: { shipAbility: { cost: 1, effect: 'addDie', face: 'W' } },
  victory: { shipAbility: { cost: 1, effect: 'addDie', face: 'T' } },
  dominica: { shipAbility: { cost: 1, effect: 'returnFortColonist' } },
  magnifique: { shipAbility: { cost: 1, effect: 'gainCoin' } },
}

// Maps a target fort's passive effect to the defender choice it triggers, given
// the attacker's current state. Returns undefined if the effect doesn't apply
// or the precondition isn't met.
export function deriveDefenderChoice(
  passive: PassiveEffect | undefined,
  attacker: IPlayer,
): DefenderChoiceSpec | undefined {
  if (!passive) return undefined
  switch (passive.type) {
    case 'returnAttackerShipColonist':
      return attacker.ships.some(s => s.colonists > 0)
        ? { type: 'coveShip' }
        : undefined
    case 'saboteurDestroyCube':
      return Object.values(attacker.shells).some(n => (n ?? 0) > 0)
        ? { type: 'saboteurShell' }
        : undefined
    default:
      return undefined
  }
}

// Dice/reroll modifiers the defender's forts impose on an attack targeting
// `targetFortId`. Most effects apply only to their own fort; flotillaOutpost
// applies when *another* of the defender's forts is the target.
export function deriveAttackFlags(
  defenderForts: { id: string }[],
  targetFortId: string,
): AttackFlags {
  const flags: AttackFlags = {
    attackerDiceMinus: 0,
    attackerRerollsMinus: 0,
    banRerollFaces: [],
    mustRerollAll: false,
    skipReinforce: false,
    banShipAbilities: false,
    banBuildingAbilities: false,
    defenderReroll1: false,
    defenderChoosesWave2: false,
  }
  for (const fort of defenderForts) {
    const fx = CARD_EFFECTS[fort.id]?.passive
    if (!fx) continue
    const isTarget = fort.id === targetFortId
    switch (fx.type) {
      case 'attackerRollsMinus1':
        if (isTarget) flags.attackerDiceMinus += 1
        break
      case 'attackerRerollsMinus1':
        if (isTarget) flags.attackerRerollsMinus += 1
        break
      case 'banRerollFace':
        if (isTarget) flags.banRerollFaces.push(fx.face)
        break
      case 'mustRerollAll':
        if (isTarget) flags.mustRerollAll = true
        break
      case 'flotillaRollMinus1':
        if (!isTarget) flags.attackerDiceMinus += 1
        break
      case 'skipReinforce':
        if (isTarget) flags.skipReinforce = true
        break
      case 'banShipAbilities':
        if (isTarget) flags.banShipAbilities = true
        break
      case 'banBuildingAbilities':
        if (isTarget) flags.banBuildingAbilities = true
        break
      case 'defenderReroll1':
        if (isTarget) flags.defenderReroll1 = true
        break
      case 'defenderChoosesWave2':
        if (isTarget) flags.defenderChoosesWave2 = true
        break
    }
  }
  return flags
}

// Persistent restrictions a building imposes on its owner's opponents.
export type ProhibitionType =
  | 'banDraw' // governorsMansion
  | 'banFortColonistGain' // prison
  | 'banBuildBuilding' // tradeCompany
  | 'banBuildShip' // watchtower

const PROHIBITION_TYPES = new Set<string>([
  'banDraw',
  'banFortColonistGain',
  'banBuildBuilding',
  'banBuildShip',
])

// Prohibitions imposed on `playerIndex` by every *other* player's in-play
// buildings. A prohibition never restricts its own owner.
export function prohibitionsAgainst(
  players: Pick<IPlayer, 'forts'>[],
  playerIndex: number,
): ProhibitionType[] {
  const types = new Set<ProhibitionType>()
  players.forEach((player, idx) => {
    if (idx === playerIndex) return
    for (const fort of player.forts)
      for (const building of fort.buildings) {
        const fx = CARD_EFFECTS[building.id]?.passive
        if (fx && PROHIBITION_TYPES.has(fx.type))
          types.add(fx.type as ProhibitionType)
      }
  })
  return [...types]
}

// Fixed bonus dice contributed by a player's in-play buildings (e.g. armory).
// Returns {face, cardID} pairs so callers can log which building contributed.
export function attackerBonusDice(
  player: Pick<IPlayer, 'forts'>,
): { face: DieValue; cardID: string }[] {
  return player.forts
    .flatMap(f => f.buildings)
    .flatMap(b => {
      const fx = CARD_EFFECTS[b.id]?.passive
      return fx?.type === 'addDieOnAttack'
        ? [{ face: fx.face, cardID: b.id }]
        : []
    })
}
