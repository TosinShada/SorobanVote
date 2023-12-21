import { FC, Fragment, ReactElement, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { formatAmount } from '@/lib/utils'

const ANIMATION_MINIMUM_STEP_TIME = 75

export interface FlowingBalanceProps {
  deposit: bigint
  decimal: number
  startTime: bigint
  stopTime: bigint
}

const FlowingBalance: FC<FlowingBalanceProps> = ({
  deposit,
  decimal,
  startTime,
  stopTime,
}): ReactElement => {
  let totalStreamed = 0n
  const [amount, setAmount] = useState<bigint>(totalStreamed)

  useEffect(() => setAmount(totalStreamed), [totalStreamed])

  //If balance in settings is 0, then show smart flowing balance
  useEffect(() => {
    let stopAnimation = false
    let lastAnimationTimestamp: DOMHighResTimeStamp = 0

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      if (stopAnimation) {
        return
      }

      if (
        currentAnimationTimestamp - lastAnimationTimestamp >
        ANIMATION_MINIMUM_STEP_TIME
      ) {
        const currentTimestamp = BigInt(moment().unix())

        if (currentTimestamp < startTime) {
          return
        }

        if (currentTimestamp > stopTime) {
          totalStreamed = deposit
          return
        }

        const streamPercent = ((currentTimestamp - startTime) * 10000000n) / (stopTime - startTime)

        totalStreamed = (deposit * streamPercent) / 10000000n

        setAmount(totalStreamed)

        lastAnimationTimestamp = currentAnimationTimestamp
      }

      window.requestAnimationFrame(animationStep)
    }

    window.requestAnimationFrame(animationStep)

    return () => {
      stopAnimation = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deposit, startTime, stopTime])

  return <Fragment>{formatAmount(amount, decimal)}</Fragment>
}

export default FlowingBalance
