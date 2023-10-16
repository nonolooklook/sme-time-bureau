'use client'

import { Header } from '@/components/Header'
import Image from 'next/image'
import { useState } from 'react'
import { useMint } from '@/hooks/useMint'
import * as Dialog from '@radix-ui/react-dialog'
import { Spinner } from '@/components/Spinner'
import { InputWithButton } from '@/components/InputWithButton'
import { PortfolioListed } from '@/components/portfolio/PortfolioListed'
import { PortfolioAvailable } from '@/components/portfolio/PortfolioAvailable'

export default function Portfolio() {
  const [type, setType] = useState(0)

  return (
    <>
      <Header />

      <div className='container mx-auto mt-32'>
        <div className='flex'>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 0 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(0)}
          >
            Available for listing
          </div>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 1 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(1)}
          >
            Listed
          </div>
          <div
            className={`cursor-pointer px-6 rounded-t-lg py-2 ${type === 2 ? 'text-gray-900 bg-primary bg-opacity-5' : ''}`}
            onClick={() => setType(2)}
          >
            My bidding
          </div>
        </div>
        <div className={`bg-primary bg-opacity-5 px-8 py-8 rounded-2xl ${type === 0 ? 'rounded-tl-sm' : ''}`}>
          {type === 0 && <PortfolioAvailable />}
          {type === 1 && <PortfolioListed />}
          {type === 2 && <PortfolioListed />}
        </div>
      </div>
    </>
  )
}
