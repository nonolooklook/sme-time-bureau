export function shortStr(str?: string, startLen: number = 6, endLen: number = 6) {
  if (!str) return ''
  if (str.length <= startLen + endLen) return str
  const start = str?.substring(0, startLen) || ''
  const end = str?.substring(str.length - endLen) || ''
  return `${start}...${end}`
}
