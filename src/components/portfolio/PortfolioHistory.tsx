'use client'

import { getCurrentExploerUrl } from '@/config/contract'
import { useHistory } from '@/hooks/useHistory'
import { displayBalance } from '@/utils/display'
import { shortStr } from '@/utils/string'
import { Share2Icon } from '@radix-ui/react-icons'
import classNames from 'classnames'
import { useAccount } from 'wagmi'
import STable from '../SimpleTable'
import { utcFormat } from 'd3'

const getRole = (item: any, account: string) => {
  const isMaker = item.makerOffer == account
  const isTaker = item.takerOffer == account
  if (isMaker && !isTaker) return 'Maker'
  if (isTaker && !isMaker) return 'Taker'
  return '-'
}

const getSide = (item: any, role: string) => {
  const type = item?.fillOrderDetail?.takerOrders[0]?.parameters.offer[0]?.itemType
  const takerOfferIsUsdc = type === 1
  if (role == '-') return '-'
  return role == 'Taker' ? (takerOfferIsUsdc ? 'Buy' : 'Sale') : takerOfferIsUsdc ? 'Sale' : 'Buy'
}

const getDate = (item: any) => {
  const takerOrder = item?.fillOrderDetail?.takerOrders[0]
  const time = Number(takerOrder.parameters.startTime) * 1000
  return utcFormat('%Y-%m-%d %H:%M:%S')(new Date(time))
}

const getFraction = (num: number, den: number, value: bigint): bigint => {
  return (BigInt(num) * value) / BigInt(den)
}
const getMinMax = (item: any) => {
  const makerOrder = item?.fillOrderDetail?.makerOrders[0]
  const num = makerOrder?.numerator
  const den = makerOrder?.denominator
  const ops: any[] = makerOrder.parameters.offer[0]?.itemType == 1 ? makerOrder?.parameters.offer : makerOrder?.parameters.consideration
  let min = 0n,
    max = 0n
  ops.forEach((op) => {
    min += BigInt(op.startAmount)
    max += BigInt(op.endAmount)
  })
  return [getFraction(num, den, min), getFraction(num, den, max)]
}

export const PortfolioHistory = () => {
  const { history } = useHistory()
  const { address } = useAccount()
  return (
    <div className='trade-card overflow-x-auto'>
      <STable
        header={['Order number', 'Date', 'Pair', 'Side', 'Price', 'Executed', 'Role', 'MinPrice/MaxPrice', 'Fee', 'Total', 'Txn hash']}
        data={history.map((item: any) => {
          const role = getRole(item, address as any)
          const side = getSide(item, role)
          const [min, max] = getMinMax(item)
          const txLink = getCurrentExploerUrl() + '/tx/' + item.txHash
          const fee = (Number(item.transaction[0].price) * 0.005).toFixed(2);
          return [
            shortStr(item._id), // Order number
            getDate(item), // Date
            'NFT/USDC', // Pair
            <span
              key="side"
              className={classNames({
                'text-green-400': side == 'Buy',
                'text-red-400': side == 'Sale',
                'text-white': side == '-',
              })}
            >
              {side}
            </span>, // Side
            item.transaction[0].price + ' USDC', // Price
            item.transaction[0].price + ' USDC', // Executed
            role, // Role
            <div className='text-right' key="minmax">
              <div>{displayBalance(min)}</div>
              <div>{displayBalance(max)}</div>
            </div>, // Min Price/Max Price;
            fee + ' USDC', // Fee
            item.transaction[0].price + ' USDC', // Total
            <div className='flex items-center gap-2' key="txhash">
              <a href={txLink} target='_blank' rel='noreferrer'>
                {shortStr(item.txHash, 10, 10)}
              </a>
              <Share2Icon className='cursor-pointer text-yellow-400 text-2xl' onClick={() => window.open(txLink, '_blank')} />
            </div>,
          ]
        })}
      />
    </div>
  )
}
