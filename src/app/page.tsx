'use client'

import { Header } from '@/components/Header'
import React, { useRef, useState } from 'react'
import { Bebas_Neue } from 'next/font/google'
import Link from 'next/link'
import { TelegramIcon } from '@/components/icons/Telegram'
import { MediumIcon } from '@/components/icons/Medium'
import { TwitterIcon } from '@/components/icons/Twitter'
import { GithubIcon } from '@/components/icons/Github'
import { DiscordIcon } from '@/components/icons/Discord'
import * as Dialog from '@radix-ui/react-dialog'
import { CheckIcon } from '@radix-ui/react-icons'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useInterval } from 'usehooks-ts'
import Cookies from 'ts-cookies'

const bebas = Bebas_Neue({ subsets: ['latin-ext'], weight: '400' })
let s = 0
export default function Page() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(true)

  const [checked, setChecked] = useState(false)

  const [end, setEnd] = useState(false)

  const [index, setIndex] = useState(0)

  useInterval(() => {
    if (!ref.current || s > 380) return
    s += 0.5
    if (s > 380) {
      setIndex(6)
    } else if (s > 340) {
      setIndex(5)
    } else if (s > 260) {
      setIndex(4)
    } else if (s > 170) {
      setIndex(3)
    } else if (s > 100) {
      setIndex(2)
    } else if (s > 50) {
      setIndex(1)
    } else {
      setIndex(0)
    }
    if (s === 250) setEnd(true)
    ref.current.scrollTop = s
  }, 40)
  console.log(checked)
  const shouldShow = Cookies.get('tutorial') !== 'true'

  return (
    <div
      className={'relative min-h-screen bg-contain bg-no-repeat'}
      style={{ background: 'url(/home-bg.png)', backgroundSize: '100% 100%', backgroundPosition: 'center center' }}
    >
      <Header />
      <Dialog.Root open={open && shouldShow} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <Dialog.Content
            className='border-none dialog-content w-[780px] h-[330px] backdrop-blur-sm'
            style={{ background: 'rgba(0, 0, 0, .85)' }}
          >
            <div className='flex items-center justify-between mb-6 gap-4'>
              <div className={'ml-auto flex gap-2 items-center'}>
                <Checkbox.Root checked={checked} onCheckedChange={(e: any) => setChecked(e)} className='checkbox-root' id='c1'>
                  <Checkbox.Indicator className='checkbox-indicator'>
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className='text-gray-400 cursor-pointer' htmlFor='c1'>
                  Don`t show again
                </label>
              </div>
              <Dialog.Close
                asChild
                onClick={() => {
                  if (checked) Cookies.set('tutorial', 'true')
                }}
              >
                <div
                  className={'w-[80px] cursor-pointer h-[24px] rounded-full flex items-center justify-center'}
                  style={{ boxShadow: '0px 4px 8px 0px rgba(255, 255, 255, 0.25) inset' }}
                >
                  Skip
                </div>
              </Dialog.Close>
            </div>
            <div
              className={`index-scroll flex flex-col items-center text-gray-400 text-center h-[240px] pt-14 pb-20 px-10 ${
                end ? 'overflow-hidden' : 'overflow-hidden'
              }`}
              ref={ref}
            >
              <div className={`${index === 0 ? 'active' : ''} min-h-[48px] flex items-center`}>Welcome to Stochastic Universe.</div>
              <div className={`${index === 1 ? 'active' : ''} min-h-[48px] flex items-center`}>You are a co-builder of this universe.</div>
              <div className={`${index === 2 ? 'active' : ''} min-h-[72px] flex items-center`}>
                As with all co-builders, you want to profit from trading Schrödinger`s Time Capsules.
              </div>
              <div className={`${index === 3 ? 'text-white text-[20px]' : ''} min-h-[99px] flex items-center`}>
                You have 5 chances to unearth the enigmatic Schrödinger`s Time Capsule from the Stochastic universe.
              </div>
              <div className={`${index === 4 ? 'text-white text-[18px]' : ''} min-h-[132px] flex items-center`}>
                After Mint Schrödinger`s Time Capsule, you can sell Schrödinger`s Time Capsule to Stochastic Universe Time Management. You
                can also wait for the last Time Reset Trade.
              </div>
              <div className={`${index === 5 ? 'active' : ''} min-h-[99px] flex items-center`}>
                Alternatively, you can choose to trade with a co-builder on the Stochastic Universe trading market.
              </div>
              <div className={`${index === 6 ? 'active' : ''} min-h-[48px] flex items-center`}>
                Now, start your Stochastic cosmic adventure!
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
