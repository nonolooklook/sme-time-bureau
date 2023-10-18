import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export const PortfolioListed = () => {
  const { address } = useAccount()
  const [list, setList] = useState([])
  useEffect(() => {
    fetch('https://sme-demo.mcglobal.ai/order?type=1&offerer=' + address, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((r) => r.json())
      .then((r) => {
        setList(r?.data)
      })
      .catch((e) => console.error(e))
  }, [])
  console.log(list)
  return (
    <>
      <div className='flex w-full text-gray-500 mb-8'>
        <div className='w-1/6'>Order</div>
        <div className='w-1/6'>Quantity</div>
        <div className='w-1/6'>Min</div>
        <div className='w-1/6'>Expected</div>
        <div className='w-1/6'>Max</div>
      </div>
      <div className={'flex flex-col gap-6'}>
        {Array.from(Array(3)).map((_, i) => (
          <div key={i}>
            <div className='flex w-full text-gray-900'>
              <div className='w-1/6'>{i + 1}</div>
              <div className='w-1/6'>3</div>
              <div className='w-1/6'>$9.23</div>
              <div className='w-1/6'>$10.23</div>
              <div className='w-1/6'>$11.23</div>
              <div>
                <button className={'btn btn-primary'}>Cancel listing</button>
              </div>
            </div>
            <div className='divider' />
          </div>
        ))}
      </div>
    </>
  )
}
