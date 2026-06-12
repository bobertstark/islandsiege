import React from 'react'
import IGameStateView from 'common/IGameStateView'
import { shellInfo } from 'common/fortGrid'
import ActionInstructions from 'components/ActionInstructions'
import { useAttackTarget } from 'components/AttackTargetDisplay'
import Wave2ShellPicker from 'components/Wave2ShellPicker'

interface Props {
  view: IGameStateView
  isMyTurn: boolean
  dispatch: (action: { type: string; payload?: unknown }) => void
}

export const AttackWave2Phase: React.FC<Props> = ({
  view,
  isMyTurn,
  dispatch,
}) => {
  const { targetFort } = useAttackTarget(view)
  if (!targetFort) return null

  const numT = view.diceBank['T'] ?? 0
  const available = shellInfo(targetFort.grid).filter(
    s => s.color !== null,
  ).length
  const required = Math.min(numT, available)

  return (
    <div style={{ margin: '16px 0' }}>
      <ActionInstructions
        title="Second Wave Attack"
        description={
          isMyTurn
            ? `Select ${required} shell${required !== 1 ? 's' : ''} to destroy.`
            : 'Watching the attacker select shells to destroy.'
        }
      />
      <Wave2ShellPicker
        view={view}
        active={isMyTurn}
        onConfirm={attackLocs =>
          dispatch({ type: 'attackWave2', payload: { attackLocs } })
        }
      />
    </div>
  )
}
