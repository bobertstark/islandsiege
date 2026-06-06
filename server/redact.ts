import IGameState from 'common/IGameState'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'
import { ILogEntry } from 'common/ILog'

function redactLog(
  log: ILogEntry[] | undefined,
  viewerIdx: number,
): ILogEntry[] {
  return (log ?? []).map(entry => {
    if (entry.phase === 'drawPick' && entry.playerIndex !== viewerIdx) {
      const { cardIDs: _cardIDs, ...rest } = entry.data as {
        cardIDs: string[]
        drawnCount: number
        discardedCardID: string
      }
      return { ...entry, data: { ...rest } }
    }
    return entry
  })
}

export function redactStateForPlayer(
  state: IGameState,
  viewerIdx: number,
): IGameStateView {
  const players: IPlayerView[] = state.players.map((p, i) => {
    const { hand, id: _id, ...rest } = p
    if (i === viewerIdx) return { ...rest, hand }
    return { ...rest, hand: hand.length }
  })

  const drawnCards =
    state.phase === 'initDraw'
      ? (state.initDrawCards?.[viewerIdx] ?? [])
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
    log: redactLog(state.log, viewerIdx),
    // rngSeed intentionally omitted
  }
}
