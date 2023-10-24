import Image from 'next/image'
import { InputWithButton } from '@/components/InputWithButton'
import { BetaD3Chart } from '@/components/BetaD3Chart'
import { PriceInput } from '@/components/PriceInput'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { parseEther, parseUnits } from 'viem'
import * as Dialog from '@radix-ui/react-dialog'
import Stepper from 'awesome-react-stepper'
import { Spinner } from '@/components/Spinner'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useRouter } from 'next/navigation'
import { Cross1Icon } from '@radix-ui/react-icons'
import { Seaport } from '@opensea/seaport-js'
import { SEAPORT_ADDRESS } from '@/config/seaport'
import { sepolia } from 'viem/chains'
import { CONDUIT_KEYS_TO_CONDUIT } from '@/config/key'
import { ItemType } from '@opensea/seaport-js/lib/constants'
import { NFTContractAddress } from '@/config/contract'
import { ERC20_ADDRESS } from '@/config/erc20'
import { erc20ABI, useAccount, useContractReads } from 'wagmi'
import { displayBalance } from '@/utils/display'
import { ERC1155ABI } from '@/config/abi/ERC1155'
import { useApprove } from '@/hooks/useApprove'
import { toast } from 'sonner'

export const PlaceBid = () => {
  const { address } = useAccount()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [min, setMin] = useState('0.96')
  const [max, setMax] = useState('1.2')
  const mid = parseEther(min as `${number}`) / 2n + parseEther(max as `${number}`) / 2n
  const [amount, setAmount] = useState('1')
  const [loading, setLoading] = useState(false)

  const total = parseUnits(max as `${number}`, 18) * parseUnits(amount as `${number}`, 0)

  const signer = useEthersSigner()

  const { data } = useContractReads({
    contracts: [
      {
        address: ERC20_ADDRESS[sepolia.id] as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, NFTContractAddress],
      },
    ],
    watch: true,
  })

  const allowance = data?.[0]?.result ?? 0n
  const shouldApprove = allowance < total

  const { approve, isApproveLoading } = useApprove(() => {})
  const [wrong, setWrong] = useState(false)
  useEffect(() => setWrong(min >= max), [min, max])

  const createOrder = useCallback(async () => {
    if (!signer) return
    setLoading(true)
    try {
      const seaport = new Seaport(signer, {
        overrides: { contractAddress: SEAPORT_ADDRESS[sepolia.id] },
        conduitKeyToConduit: CONDUIT_KEYS_TO_CONDUIT,
      })

      console.log(seaport)
      console.log('amount', amount)
      const makerOrder = {
        zone: '0x0000000000000000000000000000000000000000',
        conduitKey: '0x28c73a60ccf8c66c14eba8935984e616df2926e3aaaaaaaaaaaaaaaaaaaaaa00',
        startTime: Math.floor(new Date().getTime() / 1000).toString(),
        endTime: Math.floor(new Date().getTime() / 1000 + 2 * 30 * 24 * 60 * 60).toString(),
        offer: [
          {
            amount: (parseEther(min as `${number}`) * parseUnits(amount as `${number}`, 0)).toString(),
            endAmount: (parseEther(max as `${number}`) * parseUnits(amount as `${number}`, 0)).toString(),
            token: ERC20_ADDRESS[sepolia.id],
            recipient: address,
          },
        ],
        consideration: [
          {
            itemType: ItemType.ERC1155,
            token: NFTContractAddress,
            identifier: '0',
            amount: amount,
          },
        ],
      }
      const { executeAllActions } = await seaport.createOrder(makerOrder, address)

      const order = await executeAllActions()
      const hash = seaport.getOrderHash(order.parameters)
      await fetch('https://sme-demo.mcglobal.ai/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash,
          entry: order,
          type: 2,
        }),
      }).catch((e) => console.error(e))
      router.push('/market')
    } catch (e) {
      console.error(e)
      toast.error(e?.toString())
    }
    setLoading(false)
  }, [signer, min, max, amount])

  return (
    <>
      <div className='flex items-start gap-10 card-shadow rounded-xl'>
        <div className='w-[520px] bg-primary bg-opacity-5 rounded-l-xl grow shrink-0'>
          <Image src={'/demo-1.png'} alt={'demo'} width={260} height={420} className={'mt-10 mx-auto mb-6'} />
          <div className='flex justify-center gap-14'>
            <div>
              <div className={'text-gray-600 mb-6 text-center'}>Real-time Fair Price</div>
              <div className={'text-4xl font-semibold text-center'}>$ 9.32</div>
            </div>
            <div>
              <div className={'text-gray-600 mb-6 text-center'}>Set the quantity you want</div>
              <InputWithButton amount={amount} setAmount={setAmount} />
            </div>
          </div>

          <button className={'btn btn-outline mx-auto mt-12 mb-10'}>Duration continues until the end of the event</button>
        </div>

        <div className={'px-10 py-8 w-full'}>
          <div className='text-2xl'>Set the price range per NFT</div>
          <BetaD3Chart minPrice={parseEther(min as `${number}`)} expectedPrice={mid} maxPrice={parseEther(max as `${number}`)} />

          <div className={'grid grid-cols-2 gap-4'}>
            <div className='col-span-1'>
              <PriceInput title={'Min'} value={min} setValue={setMin} minimum={'0'} maximum={max} wrong={wrong} />
            </div>

            <div className='col-span-1'>
              <PriceInput title={'Max'} value={max} setValue={setMax} minimum={min} maximum={'10000000000000'} wrong={wrong} />
            </div>
          </div>

          <div className={'text-center font-semibold my-4'}>Authorization required for ${displayBalance(total)}</div>
          {shouldApprove ? (
            <button className={'btn btn-primary w-full'} onClick={approve} disabled={isApproveLoading || !approve}>
              {loading && <Spinner />}
              Approve
            </button>
          ) : (
            <button className={'btn btn-primary w-full'} onClick={createOrder} disabled={loading}>
              {loading && <Spinner />}
              Place a bid
            </button>
          )}
        </div>
      </div>
    </>
  )
}
