import { DieValue } from './die'
import IPlayer from './IPlayer'

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
}

// Fixed bonus dice contributed by a player's in-play buildings (i.e. armory).
// Appended after the rolled dice; they are not rerollable.
export function attackerBonusDice(player: Pick<IPlayer, 'forts'>): DieValue[] {
  return player.forts
    .flatMap(f => f.buildings)
    .flatMap(b => {
      const fx = CARD_EFFECTS[b.id]?.passive
      return fx?.type === 'addDieOnAttack' ? [fx.face] : []
    })
}
