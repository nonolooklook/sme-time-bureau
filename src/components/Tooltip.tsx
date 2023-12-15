import * as Tooltip from '@radix-ui/react-tooltip'
import Image from 'next/image'
import { ReactNode } from 'react'

export function SimpleTip({ content }: { content: ReactNode }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Image className='inline align-text-top' src={'/help-icon.svg'} alt='help' width={24} height={24} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className='TooltipContent bg-white rounded' sideOffset={5}>
            <div className='max-w-[400px] p-3'>{content}</div>
            <Tooltip.Arrow className='TooltipArrow fill-white' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
