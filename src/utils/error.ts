import { toast } from 'sonner'
import { ERROR_SIGN_REJECTED, ERROR_SYSTEM } from '@/config/error'

export const handleError = (e: any) => {
  const err = e.toString()
  console.error(err)
  if (err.includes('rejected signing')) {
    toast.error(ERROR_SIGN_REJECTED)
  } else {
    toast.error(ERROR_SYSTEM)
  }
}
