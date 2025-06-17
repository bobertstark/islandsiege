import React, { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_ROLL_LIMIT,
  Die,
  DieValue,
  DieProps,
  DieStats,
  DieStatsAccumulator,
  FaceConfig,
} from 'lib/Die'

export default function GameDie({
  rollLimit = DEFAULT_ROLL_LIMIT,
  sendValue = (value: DieValue) => {},
}: DieProps): React.ReactNode {
  const [die, setDie] = useState(new Die()) // Die Object
  const [dieStats, setDieStats] = useState([] as DieStats[]) // Die statistics
  const [showStats, setShowStats] = useState(false) // Show statistics
  const [statsComputed, setStatsComputed] = useState(false) // If new stats have been computed
  const updateDieCB = useCallback(updateDieObj, [die, sendValue, updateDieObj]) // Prevent unecessary rerenders
  const computeStatsCB = useCallback(computeStats, [
    die.rollCount,
    computeStats,
  ])
  const gatherStatsCB = useCallback(gatherStats, [
    computeStatsCB,
    die.statsAcc,
    showStats,
    statsComputed,
    gatherStats,
  ])
  // Determine whether to reset the die or not
  useEffect(() => {
    // If the die should not be reset do nothing
    if (!die.getResetState) {
      return
    }

    // Reset die
    die.resetDie()
    updateDieCB()
  }, [die, updateDieCB])

  // Determine whether a new set of statistics should be computed
  // and compute them asynchronously
  useEffect(() => {
    // Wait for statistics to be gathered
    ;(async () => {
      if (showStats && !statsComputed) {
        try {
          await gatherStatsCB() // This will populate the dieStats state
        } catch (error: any) {
          console.log(error)
        }
        setStatsComputed(true) //statistics have just been computed
      }
    })()
  }, [dieStats, showStats, statsComputed, gatherStatsCB])

  // Update die object, rerender, and send value to parent
  function updateDieObj() {
    setDie(Die.fromObject(die))
    sendValue(die.value)
  }

  // Roll the die
  function rollDie(): void {
    die.roll()
    setStatsComputed(false) // Recompute stats if needed
    updateDieCB()
  }

  // Compute statistics asynchronously
  async function computeStats(
    dieStats_: DieStatsAccumulator[],
  ): Promise<DieStats[]> {
    // Return promise for calling function to wait for
    return new Promise((resolve, reject) => {
      var computedStats: DieStats[] = [] as DieStats[]
      let count = die.rollCount
      if (!count) {
        reject(computeStats) // Fail if die has not been rolled
      }

      // Compute stats
      dieStats_.forEach((elem_, i_) => {
        computedStats.push({
          face: elem_.face,
          timesRolled: elem_.timesRolled,
          percentage: elem_.timesRolled / count,
        })
      })

      // Resolve promise
      resolve(computedStats)
    })
  }

  // Gather statitics asynchronously
  async function gatherStats(): Promise<void> {
    // If stats should not be shown or statistics have already
    // been computed there is no need to do anything
    if (!showStats || statsComputed) {
      return
    }

    // Wait for stats to be computed or log an error
    var computed: DieStats[] = [] as DieStats[]
    try {
      computed = await computeStatsCB(die.statsAcc)
    } catch (error: any) {
      console.log(error)
    }

    // Update statistics object
    setDieStats(computed)
  }

  // Toggle the showing of statisitcs
  function toggleStats() {
    // If showStats as false, set statsComputed to false
    // so that statistics are recomputed
    setStatsComputed(showStats)

    // Toggle statistics
    setShowStats(!showStats)
  }

  // Format a row of statistis
  function renderStat(stat_: DieStats, index: number): React.ReactNode {
    return (
      <div key={index}>
        <p>
          {stat_.face}: {stat_.timesRolled} (
          {(stat_.percentage * 100).toFixed(2)}%)
        </p>
      </div>
    )
  }

  // Render the statistics
  function renderStats(): React.ReactNode {
    let dieStats_: DieStats[] = dieStats
    return (
      <div>
        <p>This die has been rolled {die.rollCount} times!</p>
        {dieStats_.map((stat, i) => {
          return renderStat(stat, i)
        })}
      </div>
    )
  }

  // Render the die
  return (
    <div
      style={{
        backgroundColor: FaceConfig[die.value].color,
        width: 'fit-content',
      }}>
      <h1 style={{ textAlign: 'center' }}>{die.value}</h1>
      <p>
        Rolls: {die.rollCount}/{rollLimit}
      </p>
      {die.rollCount < rollLimit ? (
        <button onClick={rollDie}>Roll!</button>
      ) : (
        <></>
      )}
      <button onClick={toggleStats}>
        {!showStats ? 'show ' : 'hide '}Stats!
      </button>
      {!!showStats && statsComputed ? renderStats() : <></>}
    </div>
  )
}
