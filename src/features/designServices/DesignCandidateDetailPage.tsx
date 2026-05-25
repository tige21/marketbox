import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { designServicesBackendApi } from '@/api/endpoints'
import { pickLocale, pickLocaleStr, useLang } from '@/api/locale'
import { PersonDetailScreen } from '@/components/PersonDetailScreen'

const STALE = 5 * 60 * 1000

export function DesignCandidateDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { t } = useTranslation('designServices')
  const lang = useLang()
  const numId = Number(id)
  const validId = Number.isFinite(numId) && numId > 0 ? numId : undefined

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['design-candidates', 'detail', validId, lang],
    queryFn: () =>
      designServicesBackendApi
        .getCandidate(validId as number, { lang })
        .then((r) => r.data.data),
    enabled: validId != null,
    staleTime: STALE,
  })

  const name = candidate
    ? `${pickLocaleStr(candidate.name, lang)} ${pickLocaleStr(candidate.surname, lang)}`.trim()
    : ''
  const photo = candidate ? pickLocale(candidate.photo, lang) : null
  const preview = candidate ? pickLocaleStr(candidate.preview_text, lang) : ''
  const skills = candidate ? pickLocaleStr(candidate.ability, lang) : ''
  const experience = candidate ? pickLocaleStr(candidate.experience, lang) : ''
  const address = candidate ? pickLocaleStr(candidate.address, lang) : ''
  const age = candidate?.age ?? undefined
  const ctaUrl = candidate?.url ?? null

  return (
    <PersonDetailScreen
      categoryTitle={t('person_category', { defaultValue: 'Дизайнеры' })}
      name={name}
      backTo="/design-services"
      photoUrl={photo}
      preview={preview}
      age={age}
      skills={skills}
      experience={experience}
      address={address}
      contactUrl={ctaUrl}
      isLoading={isLoading}
      error={error ?? undefined}
    />
  )
}
