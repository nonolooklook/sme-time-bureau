import { ReactNode } from 'react'

export const CircleProgress = ({ ratio, children }: { ratio: number; children: ReactNode }) => {
  return (
    <div className={'relative'}>
      <svg width='60' height='60' viewBox='0 0 60 60' className={'-rotate-90'}>
        <circle cx='30' cy='30' r='28' fill='none' stroke='transparent' stroke-width='1' />
        <circle
          strokeDasharray={100}
          strokeDashoffset={100 - ratio * 100}
          cx='30'
          cy='30'
          r='28'
          fill='none'
          stroke='#fff'
          stroke-width='2'
          pathLength='100'
        />
      </svg>
      <div className='absolute w-[55px] h-[55px] top-[2px] left-[2px] rounded-full bg-opacity-20 bg-gray-400'>{children}</div>
    </div>
  )
}
