import IGameState from 'common/IGameState'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'

export function redactStateForPlayer(
  state: IGameState,
  viewerIdx: number,
): IGameStateView {
  const players: IPlayerView[] = state.players.map((p, i) => {
    const { hand, ...rest } = p
    return i === viewerIdx
      ? { ...rest, hand } // own hand: full
      : { ...rest, hand: hand.length } // opponent: count only
  })

  return {
    players,
    playerCount: state.phase === 'lobby' ? state.playerCount : undefined,
    readyPlayers: state.readyPlayers,
    currentPlayerIndex: state.currentPlayerIndex,
    deckCount: state.deck.length,
    discard: state.discard,
    shuffleCount: state.shuffleCount,
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
