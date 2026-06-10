import IGameState from 'common/IGameState'
import { CARD_EFFECTS } from 'common/cardEffects'
import { ILogEntry } from 'common/ILog'
import { removeColonists } from 'common/fort'
import { createRng } from 'common/rng'
import { destroyBuilding, destroyShip } from 'common/player'

export interface EffectTarget {
  targetPlayerIndex?: number
  buildingID?: string
  shipID?: string
  fortColonistRemovals?: Record<string, number>
}

function effectLog(
  builderIdx: number,
  data: Record<string, unknown>,
): ILogEntry {
  return {
    phase: 'buildBuilding',
    playerIndex: builderIdx,
    turn: builderIdx,
    timestamp: new Date().toISOString(),
    data,
  }
}

// Resolve the opponent the effect targets. With no explicit target, auto-pick
// only when there is exactly one opponent. Returns -1 when unresolved.
function resolveOpponent(
  state: IGameState,
  builderIdx: number,
  target?: EffectTarget,
): number {
  if (target?.targetPlayerIndex !== undefined) {
    const idx = target.targetPlayerIndex
    if (idx === builderIdx || idx < 0 || idx >= state.players.length)
      throw new Error(`Invalid on-build target: ${idx}`)
    return idx
  }
  const opponents = state.players.map((_, i) => i).filter(i => i !== builderIdx)
  return opponents.length === 1 ? opponents[0] : -1
}

// Fire a building's one-shot on-build effect (if any) immediately after it is
// placed. Best-effort: a missing/absent target is skipped; a provided but
// invalid target throws.
export function applyOnBuildEffect(
  state: IGameState,
  builderIdx: number,
  buildingID: string,
  target?: EffectTarget,
): IGameState {
  const effect = CARD_EFFECTS[buildingID]?.onBuild
  if (!effect) return state

  switch (effect.type) {
    case 'returnOpponentFortColonist':
      return returnOpponentFortColonist(state, builderIdx)
    case 'discardOpponentCard':
      return discardOpponentCard(state, builderIdx, target)
    case 'destroyOpponentBuilding':
      return destroyOpponentBuilding(state, builderIdx, target)
    case 'destroyOpponentShip':
      return destroyOpponentShip(state, builderIdx, target)
    case 'convertColonistsToCoins':
      return convertColonistsToCoins(state, builderIdx, target)
    default:
      return state
  }
}

function returnOpponentFortColonist(
  state: IGameState,
  builderIdx: number,
): IGameState {
  const returned: { playerIndex: number; fortID: string }[] = []
  const players = state.players.map((p, idx) => {
    if (idx === builderIdx) return p
    let colonists = p.colonists
    const forts = p.forts.map(fort => {
      if (fort.usedSlots <= 0) return fort
      const { fort: next, removed } = removeColonists(fort, 1)
      if (removed) {
        colonists += 1
        returned.push({ playerIndex: idx, fortID: fort.id })
      }
      return next
    })
    return { ...p, colonists, forts }
  })
  return {
    ...state,
    players,
    log: [
      ...state.log,
      effectLog(builderIdx, {
        onBuild: 'returnOpponentFortColonist',
        returned,
      }),
    ],
  }
}

function discardOpponentCard(
  state: IGameState,
  builderIdx: number,
  target?: EffectTarget,
): IGameState {
  const targetIdx = resolveOpponent(state, builderIdx, target)
  if (targetIdx < 0) return state
  const opponent = state.players[targetIdx]
  if (opponent.hand.length === 0) return state

  const rng = createRng(state.rngSeed)
  const pick = Math.floor(rng.next() * opponent.hand.length)
  const card = opponent.hand[pick]
  const players = [...state.players]
  players[targetIdx] = {
    ...opponent,
    hand: opponent.hand.filter((_, i) => i !== pick),
  }
  return {
    ...state,
    players,
    discard: [...state.discard, card],
    rngSeed: rng.seed(),
    log: [
      ...state.log,
      effectLog(builderIdx, {
        onBuild: 'discardOpponentCard',
        targetPlayerIndex: targetIdx,
        cardID: card.id,
      }),
    ],
  }
}

function destroyOpponentBuilding(
  state: IGameState,
  builderIdx: number,
  target?: EffectTarget,
): IGameState {
  if (
    target?.targetPlayerIndex === undefined ||
    target.buildingID === undefined
  )
    return state
  const targetIdx = resolveOpponent(state, builderIdx, target)
  const opponent = state.players[targetIdx]
  const fort = opponent.forts.find(f =>
    f.buildings.some(b => b.id === target.buildingID),
  )
  if (!fort)
    throw new Error(`Player ${targetIdx} has no building ${target.buildingID}`)
  const { player, card } = destroyBuilding(opponent, fort.id, target.buildingID)
  const players = [...state.players]
  players[targetIdx] = player
  return {
    ...state,
    players,
    discard: [...state.discard, card],
    log: [
      ...state.log,
      effectLog(builderIdx, {
        onBuild: 'destroyOpponentBuilding',
        targetPlayerIndex: targetIdx,
        buildingID: target.buildingID,
      }),
    ],
  }
}

function destroyOpponentShip(
  state: IGameState,
  builderIdx: number,
  target?: EffectTarget,
): IGameState {
  if (target?.targetPlayerIndex === undefined || target.shipID === undefined)
    return state
  const targetIdx = resolveOpponent(state, builderIdx, target)
  const opponent = state.players[targetIdx]
  if (!opponent.ships.some(s => s.id === target.shipID))
    throw new Error(`Player ${targetIdx} has no ship ${target.shipID}`)
  const { player, card } = destroyShip(opponent, target.shipID)
  const players = [...state.players]
  players[targetIdx] = player
  return {
    ...state,
    players,
    discard: [...state.discard, card],
    log: [
      ...state.log,
      effectLog(builderIdx, {
        onBuild: 'destroyOpponentShip',
        targetPlayerIndex: targetIdx,
        shipID: target.shipID,
      }),
    ],
  }
}

function convertColonistsToCoins(
  state: IGameState,
  builderIdx: number,
  target?: EffectTarget,
): IGameState {
  const removals = target?.fortColonistRemovals ?? {}
  const entries = Object.entries(removals).filter(([, count]) => count > 0)
  if (entries.length === 0) return state

  const player = state.players[builderIdx]
  let forts = [...player.forts]
  let total = 0

  for (const [fortID, count] of entries) {
    const idx = forts.findIndex(f => f.id === fortID)
    if (idx === -1)
      throw new Error(`Player ${builderIdx} has no fort ${fortID}`)
    const fort = forts[idx]
    if (count > fort.usedSlots)
      throw new Error(
        `Cannot remove ${count} colonists from ${fortID} (only ${fort.usedSlots} available)`,
      )
    forts = [
      ...forts.slice(0, idx),
      removeColonists(fort, count).fort,
      ...forts.slice(idx + 1),
    ]
    total += count
  }

  const players = [...state.players]
  players[builderIdx] = { ...player, coins: player.coins + total, forts }
  return {
    ...state,
    players,
    log: [
      ...state.log,
      effectLog(builderIdx, {
        onBuild: 'convertColonistsToCoins',
        coinsGained: total,
        removals,
      }),
    ],
  }
}
