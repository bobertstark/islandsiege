import IGameState from 'common/IGameState'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'

export function redactStateForPlayer(
  state: IGameState,
  viewerIdx: number,
): IGameStateView {
  const isInitDraw = state.phase === 'initDraw'

  const players: IPlayerView[] = state.players.map((p, i) => {
    const { hand, id: _id, ...rest } = p
    if (i === viewerIdx) {
      // During initDraw, hide hand so cards only appear in drawnCards
      return { ...rest, hand: isInitDraw ? [] : hand }
    }
    return { ...rest, hand: hand.length }
  })

  // During initDraw, surface the viewer's own hand as drawnCards
  const drawnCards = isInitDraw
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
    diceBank: state.diceBank,
    winningPlayerIndex: state.winningPlayerIndex,
    buildContext: state.buildContext,
    pendingBuildCardID: state.pendingBuildCardID,
    // rngSeed intentionally omitted
  }
}
