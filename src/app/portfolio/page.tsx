'use client'

import { Header } from '@/components/Header'
import { PortfolioAvailable } from '@/components/portfolio/PortfolioAvailable'
import { PortfolioHistory } from '@/components/portfolio/PortfolioHistory'
import { PortfolioListed } from '@/components/portfolio/PortfolioListed'
import { FetcherContext } from '@/contexts/FetcherContext'
import { useAvailableAmount } from '@/hooks/useAvailableAmount'
import { useContext, useState } from 'react'

export default function Portfolio() {
  const { nftBalance, listedCount, bidCount } = useContext(FetcherContext)
  const { availableAmount } = useAvailableAmount()
  const [type, setType] = useState(0)

  return (
    <div
      className={'relative min-h-screen bg-no-repeat'}
      style={{ background: 'url(/trade-bg.png)', backgroundSize: '100%', backgroundPosition: 'center center' }}
    >
      <Header />

      <div className='container mx-auto text-white pt-32 pb-24'>
        <div className='flex gap-8'>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 0 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(0)}
          >
            Available for listing ({availableAmount})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 1 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(1)}
          >
            Listed ({listedCount})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 2 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(2)}
          >
            My bidding ({bidCount})
          </div>
          <div
            className={`cursor-pointer px-6 rounded-full border py-2 ${
              type === 3 ? 'text-primary border-primary' : 'text-white border-white'
            }`}
            onClick={() => setType(3)}
          >
            Trade History
          </div>
        </div>
        <div className={`pt-8 ${type === 0 ? 'rounded-tl-sm' : ''}`}>
          {type === 0 && <PortfolioAvailable />}
          {type === 1 && <PortfolioListed isBid={false} />}
          {type === 2 && <PortfolioListed isBid={true} />}
          {type === 3 && <PortfolioHistory/>}
        </div>
      </div>
    </div>
  )
}
