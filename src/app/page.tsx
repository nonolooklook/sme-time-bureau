'use client'

import { Header } from '@/components/Header'
import React from 'react'
import { useOrders } from '@/hooks/useOrders'
import { Bebas_Neue } from 'next/font/google'
import Link from 'next/link'
import { TelegramIcon } from '@/components/icons/Telegram'
import { MediumIcon } from '@/components/icons/Medium'
import { TwitterIcon } from '@/components/icons/Twitter'
import { GithubIcon } from '@/components/icons/Github'
import { DiscordIcon } from '@/components/icons/Discord'

const bebas = Bebas_Neue({ subsets: ['latin-ext'], weight: '400' })

export default function Page() {
  return (
    <div
      className={'relative min-h-screen bg-contain bg-no-repeat'}
      style={{ background: 'url(/home-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center center' }}
    >
      <Header />
      <div className={'container mx-auto text-white min-h-screen flex items-center uppercase'}>
        <div className={'text-[80px] tracking-[2%]'}>
          <div className={`${bebas.className} -mb-2`}>Time weavers of the</div>
          <div className={bebas.className}>Stochastic Universe</div>
        </div>
      </div>
      <div className='fixed bottom-0 w-full bg-gradient-to-b from-transparent gap-10 to-black py-10 flex items-center justify-center'>
        <Link href={'https://t.me/CrustNetwork'} target={'_blank'} className={'link-icon'}>
          <TelegramIcon />
        </Link>
        <Link href={'https://crustnetwork.medium.com/'} target={'_blank'} className={'link-icon'}>
          <MediumIcon />
        </Link>
        <Link href={'https://twitter.com/CrustNetwork'} target={'_blank'} className={'link-icon'}>
          <TwitterIcon />
        </Link>
        <Link href={'https://github.com/crustio'} target={'_blank'} className={'link-icon'}>
          <GithubIcon />
        </Link>
        <Link href={'https://discord.com/invite/Jbw2PAUSCR'} target={'_blank'} className={'link-icon'}>
          <DiscordIcon />
        </Link>
      </div>
    </div>
  )
}
