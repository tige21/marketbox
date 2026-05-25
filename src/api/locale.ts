import { useTranslation } from 'react-i18next'

export type Lang = 'ru' | 'uz'

/**
 * Backend returns text fields in one of three shapes:
 *   1. { ru: "...", uz: "..." }   — both locales
 *   2. { ru: "..." } or { uz: null } — partial, other side missing/null
 *   3. plain string                — when/if backend switches to single-locale mode
 * This union covers all three so call sites stay boring.
 */
export type Localized<T = string> =
  | { ru?: T | null; uz?: T | null }
  | T
  | null
  | undefined

/**
 * Pick a value from a Localized<T> with graceful fallback:
 * preferred lang → opposite lang → null.
 */
export function pickLocale<T = string>(
  value: Localized<T>,
  lang: Lang,
): T | null {
  if (value == null) return null
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as { ru?: T | null; uz?: T | null }
    const primary = obj[lang]
    if (primary != null) return primary
    const other: Lang = lang === 'ru' ? 'uz' : 'ru'
    const fallback = obj[other]
    return fallback ?? null
  }
  return value as T
}

/**
 * String-specialized pick that always returns a string (empty when nothing).
 * Use in JSX where `null` would render as the literal "null" string.
 */
export function pickLocaleStr(value: Localized, lang: Lang): string {
  return pickLocale(value, lang) ?? ''
}

/** Current i18n language as a narrow `'ru' | 'uz'` literal. */
export function useLang(): Lang {
  const { i18n } = useTranslation()
  return i18n.language === 'uz' ? 'uz' : 'ru'
}
