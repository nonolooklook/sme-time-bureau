import { displayBalance } from '@/utils/display'
import { SimpleTip } from '../Tooltip'
import { useContext } from 'react'
import { FetcherContext } from '@/contexts/FetcherContext'
import classNames from 'classnames'

export function AuthBalanceFee({
  auth,
  maximum,
  balance,
  fee,
  className,
}: {
  auth?: bigint
  maximum?: bigint
  balance?: bigint | boolean
  fee?: boolean
  className?: string
}) {
  const { collateralBalance } = useContext(FetcherContext)
  return (
    <div className={classNames('my-3 text-gray-400 pl-4 text-lg flex flex-col items-center', className)}>
      {!!auth && (
        <div className={'text-white'}>
          Authorization required for <span className='font-bold text-xl'>{displayBalance(auth)}</span> USDC{' '}
          <SimpleTip content='You are required to authorize the maximum price, and any difference will be refunded if the final transaction price is less than the maximum price.' />
        </div>
      )}
      {!!maximum && (
        <div className={'text-white'}>
          Maximum price: <span className='text-xl font-bold'>{displayBalance(maximum)}</span> USDC
        </div>
      )}
      {!!balance && (
        <div className='text-center'>USDC Balance: {displayBalance(typeof balance === 'bigint' ? balance : collateralBalance)}</div>
      )}
      {fee && <div className='text-center'>Transaction fees：0.5%</div>}
    </div>
  )
}
