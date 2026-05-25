const MONTHS_RU_SHORT = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЯ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
const MONTHS_RU_LONG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/** "15 МАЯ" — used in news, events, tour badges */
export function formatBadgeDate(iso?: string): string {
  if (!iso) return ''
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso
  try {
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS_RU_SHORT[d.getMonth()] ?? ''}`.trim()
  } catch {
    return iso
  }
}

/** "15 марта 2026, 21:00" — transactions */
export function formatTransactionDate(iso: string): string {
  try {
    const d = new Date(iso)
    const day = d.getDate()
    const month = MONTHS_RU_LONG[d.getMonth()] ?? ''
    const year = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hh}:${mm}`
  } catch {
    return ''
  }
}

/** "1234 5678 9012 3456" — formats card number with spaces */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}
