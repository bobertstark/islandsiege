import IPlayer from 'common/IPlayer'
import { CARD_EFFECTS, prohibitionsAgainst } from 'common/cardEffects'

// Note shown during colonize when an opponent's Prison is blocking this
// player's forts from gaining colonists this turn.
export function colonizeBanNote(
  view: { players: Pick<IPlayer, 'name' | 'forts'>[] },
  playerIndex: number,
): string | undefined {
  if (
    !prohibitionsAgainst(view.players, playerIndex).includes(
      'banFortColonistGain',
    )
  )
    return undefined
  for (let i = 0; i < view.players.length; i++) {
    if (i === playerIndex) continue
    const building = view.players[i].forts
      .flatMap(f => f.buildings)
      .find(b => CARD_EFFECTS[b.id]?.passive?.type === 'banFortColonistGain')
    if (building)
      return `${view.players[i].name}'s ${building.name} blocks your forts from gaining colonists this turn.`
  }
  return undefined
}
