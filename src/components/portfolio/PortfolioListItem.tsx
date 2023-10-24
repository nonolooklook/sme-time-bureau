import { displayBalance } from '@/utils/display'
import { parseUnits } from 'viem'
import { useCancelList } from '@/hooks/useCancelList'
import { Spinner } from '@/components/Spinner'

export const PortfolioListItem = ({ mutate, isBid, order, i }: { mutate: any; isBid: boolean; order: any; i: number }) => {
  const ps = order?.entry.parameters
  const csd = ps.consideration
  const offer = ps.offer
  const count = parseUnits(isBid ? csd?.[0]?.startAmount : (offer?.[0]?.startAmount as `${number}`), 0)
  const min = parseUnits(isBid ? offer?.[0]?.startAmount : (csd?.[0]?.startAmount as `${number}`), 0) / count
  const max = parseUnits(isBid ? offer?.[0]?.endAmount : csd?.[0]?.endAmount, 0) / count
  const expected = min / 2n + max / 2n
  const { cancelList, isCancelLoading } = useCancelList(order, () => {
    mutate?.()
  })

  return (
    <div key={i}>
      <div className='flex w-full text-gray-900'>
        <div className='w-1/6'>{i + 1}</div>
        <div className='w-1/6'>{count?.toString()}</div>
        <div className='w-1/6'>${displayBalance(min)}</div>
        <div className='w-1/6'>${displayBalance(expected)}</div>
        <div className='w-1/6'>${displayBalance(max)}</div>
        <div>
          <button className={'btn btn-primary'} onClick={() => cancelList(order)} disabled={isCancelLoading}>
            {isCancelLoading && <Spinner />}
            Cancel listing
          </button>
        </div>
      </div>
      <div className='divider' />
    </div>
  )
}
