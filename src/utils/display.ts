import { formatEther } from 'viem'

export const ellipseAddress = (address: string | null | undefined, width = 4): string => {
  if (!address) {
    return ''
  }

  if (width === -1) {
    return address
  }

  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export const displayBalance = (balance: bigint | undefined, toFixed: number = 2): string => {
  if (!balance) return '0'
  const N = 10 ** toFixed
  return (Math.floor(Number(formatEther(balance)) * N) / N).toLocaleString('en-US', {
    maximumFractionDigits: toFixed,
    minimumFractionDigits: toFixed,
  }).replaceAll(',','')
  // return Number(formatEther(balance)).toLocaleString('en-US', {
  //   maximumFractionDigits: 3,
  // })
}

export const getMaxValue = (balance: bigint | undefined): string => {
  if (!balance) return '0'
  return (Math.floor(Number(formatEther(balance)) * 1000) / 1000).toFixed(3)
}
