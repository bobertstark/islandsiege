import IGameState from 'common/IGameState'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'

export function redactStateForPlayer(
  state: IGameState,
  viewerIdx: number,
): IGameStateView {
  const isInitDiscard = state.phase === 'initDiscard'

  const players: IPlayerView[] = state.players.map((p, i) => {
    const { hand, id: _id, ...rest } = p
    if (i === viewerIdx) {
      // During initDiscard, hide hand so cards only appear in drawnCards
      return { ...rest, hand: isInitDiscard ? [] : hand }
    }
    return { ...rest, hand: hand.length }
  })

  // During initDiscard, surface the viewer's own hand as drawnCards
  const drawnCards = isInitDiscard
    ? (state.players[viewerIdx]?.hand ?? [])
    : state.drawnCards

  return {
    players,
    playerCount: state.phase === 'lobby' ? state.playerCount : undefined,
    readyPlayers: state.readyPlayers,
    currentPlayerIndex: state.currentPlayerIndex,
    deckCount: state.deck.length,
    discard: state.discard,
    shuffleCount: state.shuffleCount,
    drawnCards,
    phase: state.phase,
    pending: state.pending,
    shipLocations: state.shipLocations,
    shellReserve: state.shellReserve,
    attackIsOpenWater: state.attackIsOpenWater,
    attackRoll: state.attackRoll,
    attackRerollsRemaining: state.attackRerollsRemaining,
    attackValueCounts: state.attackValueCounts,
    winningPlayerIndex: state.winningPlayerIndex,
    // rngSeed intentionally omitted
  }
}
