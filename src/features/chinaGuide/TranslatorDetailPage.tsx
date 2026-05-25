import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { chinaGuideApi } from '@/api/endpoints'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { PersonDetailScreen } from '@/components/PersonDetailScreen'

const STALE = 5 * 60 * 1000

export function TranslatorDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useTranslation(['chinaGuide', 'common'])
  const lang = useLang()
  const numId = Number(id)
  const validId = Number.isFinite(numId) && numId > 0 ? numId : undefined

  const { data: translator, isLoading, error } = useQuery({
    queryKey: ['translators', 'detail', validId, lang],
    queryFn: () =>
      chinaGuideApi
        .getTranslator(validId as number, { lang })
        .then((r) => r.data.data),
    enabled: validId != null,
    staleTime: STALE,
  })

  const name = translator
    ? `${pickLocaleStr(translator.name, lang)} ${pickLocaleStr(translator.surname, lang)}`.trim()
    : ''
  const photo = translator ? pickLocale(translator.photo, lang) : null
  const preview = translator ? pickLocaleStr(translator.preview_text, lang) : ''
  const address = translator ? pickLocaleStr(translator.address, lang) : ''
  const age = translator?.age ?? undefined

  // Languages + can_help come as array<{title}> — join into readable strings
  const languages = translator && Array.isArray(translator.languages)
    ? translator.languages
        .map((x) => pickLocaleStr(x.title, lang))
        .filter(Boolean)
        .join(', ')
    : ''
  const canHelp = translator && Array.isArray(translator.can_help)
    ? translator.can_help
        .map((x) => pickLocaleStr(x.title, lang))
        .filter(Boolean)
        .join(', ')
    : ''

  const ctaUrl = translator?.url ?? null

  return (
    <PersonDetailScreen
      categoryTitle={t('chinaGuide:list.translators_title', { defaultValue: 'Переводчики' })}
      name={name}
      backTo="/china-guide/translators"
      photoUrl={photo}
      preview={preview}
      age={age}
      skills={languages || canHelp}
      experience={canHelp && languages ? canHelp : ''}
      address={address}
      contactUrl={ctaUrl}
      isLoading={isLoading}
      error={error ?? undefined}
    />
  )
}
