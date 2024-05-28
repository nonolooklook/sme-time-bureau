export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sme-demo.mcglobal.ai'

export const genURL = (path: `/${string}`) => `${BASE_URL}${path}`
