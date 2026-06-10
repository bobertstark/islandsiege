import IGameState from 'common/IGameState'
import IGameStateView, { IPlayerView } from 'common/IGameStateView'
import { ILogEntry } from 'common/ILog'
import IPlayer from 'common/IPlayer'

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

function redactPlayer(p: IPlayer, isViewer: boolean): IPlayerView {
  const { hand, id: _id, ...rest } = p
  return isViewer ? { ...rest, hand } : { ...rest, hand: hand.length }
}

export function redactStateForPlayer(
  state: IGameState,
  viewerIdx: number,
): IGameStateView {
  const players: IPlayerView[] = state.players.map((p, i) =>
    redactPlayer(p, i === viewerIdx),
  )
  const waitingPlayers: IPlayerView[] = (state.waitingPlayers ?? []).map(p =>
    redactPlayer(p, false),
  )

  const drawnCards =
    state.phase === 'initDraw'
      ? (state.initDrawCards?.[viewerIdx] ?? [])
      : state.drawnCards

  return {
    myPlayerIndex: viewerIdx,
    players,
    playerCount: state.phase === 'lobby' ? state.playerCount : undefined,
    waitingPlayers,
    isSeated: true,
    isCreator: state.creatorId === state.players[viewerIdx]?.id,
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
    pendingBuildCardID: state.pendingBuildCardID,
    attackFlags: state.attackFlags,
    log: redactLog(state.log, viewerIdx),
  }
}

export function redactStateForWaiting(
  state: IGameState,
  waitingIdx: number,
): IGameStateView {
  const players: IPlayerView[] = state.players.map(p => redactPlayer(p, false))
  const waitingPlayers: IPlayerView[] = (state.waitingPlayers ?? []).map(
    (p, i) => redactPlayer(p, i === waitingIdx),
  )

  return {
    myPlayerIndex: -1,
    players,
    playerCount: state.playerCount,
    waitingPlayers,
    isSeated: false,
    isCreator: false,
    queuePosition: waitingIdx + 1,
    readyPlayers: state.readyPlayers,
    currentPlayerIndex: state.currentPlayerIndex,
    deckCount: state.deck.length,
    discard: state.discard,
    shuffleCount: state.shuffleCount,
    drawnCards: [],
    phase: state.phase,
    pending: undefined,
    shipLocations: state.shipLocations,
    shellReserve: state.shellReserve,
    attackIsOpenWater: state.attackIsOpenWater,
    attackRoll: state.attackRoll,
    attackRerollsRemaining: state.attackRerollsRemaining,
    diceBank: state.diceBank,
    winningPlayerIndex: state.winningPlayerIndex,
    attackFlags: state.attackFlags,
    log: redactLog(state.log, -1),
  }
}
