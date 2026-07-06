import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { GlassHeader } from '@/components/GlassHeader'
import { useAuthStore } from '@/stores/authStore'
import { userApi } from '@/api/endpoints'
import { bem } from '@/utils/cn'
import { triggerHaptic } from '@/utils'
import './ProfileSubPage.scss'
import './ProfileEditPage.scss'

const b = 'profile-sub'

function formatError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status ?? 'no-response'
    const url = err.config?.url ?? ''
    const data = err.response?.data
    const body = data ? typeof data === 'string' ? data : JSON.stringify(data) : err.message
    return `[${status}] ${url}\n${body}`
  }
  if (err instanceof Error) return err.message
  return String(err)
}

export function ProfileEditPage() {
  const { t } = useTranslation('profile')
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  // Don't throw on the profile query: we want the page to render even
  // when /user is 401, and surface the error inline rather than fall
  // through to the global ErrorBoundary.
  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
    throwOnError: false,
    retry: false,
  })

  const initialFirst = profileData?.firstName ?? user?.firstName ?? ''
  const initialLast = profileData?.lastName ?? user?.lastName ?? ''

  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [savedTick, setSavedTick] = useState(false)

  // Re-sync inputs once when the profile query resolves (the user may
  // open the page before /user finishes loading).
  useEffect(() => {
    setFirstName(initialFirst)
    setLastName(initialLast)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFirst, initialLast])

  const patchUser = useAuthStore((s) => s.patchUser)

  const updateMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string }) =>
      userApi.updateProfile(data).then((r) => r.data.data),
    onSuccess: (updated) => {
      // 1. React Query cache for ['profile'] — read by ProfileMain.
      qc.setQueryData(['profile'], updated)
      qc.invalidateQueries({ queryKey: ['profile'] })
      // 2. authStore — read by HomePage header (and persisted to
      //    localStorage so the new name survives reloads).
      patchUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
      })
      setSavedTick(true)
      setTimeout(() => setSavedTick(false), 1500)
    },
  })

  const trimmedFirst = firstName.trim()
  const trimmedLast = lastName.trim()
  const dirty = trimmedFirst !== initialFirst.trim() || trimmedLast !== initialLast.trim()
  const canSave = dirty && !updateMutation.isPending && !!trimmedFirst

  const handleSave = () => {
    if (!canSave) return
    triggerHaptic('tap')
    updateMutation.mutate({
      firstName: trimmedFirst,
      lastName: trimmedLast,
    })
  }

  // Show whichever error is more relevant: a fresh save failure, or the
  // initial /user load failure (so the user can copy & forward it).
  const displayError = updateMutation.error ?? profileError
  const errorText = displayError ? formatError(displayError) : null

  return (
    <div className={b}>
      <GlassHeader showBack size="medium" title={t('pages.edit_title')} />
      <div className={bem(b, 'content')}>
        <span className={bem(b, 'section-label')}>{t('edit')}</span>

        <div className={bem('profile-edit', 'form')}>
          <label className={bem('profile-edit', 'field')}>
            <span className={bem('profile-edit', 'field-label')}>
              {t('rows.first_name')}
            </span>
            <input
              type="text"
              className={bem('profile-edit', 'field-input')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={64}
              autoComplete="given-name"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="next"
              disabled={updateMutation.isPending}
            />
          </label>

          <label className={bem('profile-edit', 'field')}>
            <span className={bem('profile-edit', 'field-label')}>
              {t('rows.last_name')}
            </span>
            <input
              type="text"
              className={bem('profile-edit', 'field-input')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={64}
              autoComplete="family-name"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="done"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur()
                  handleSave()
                }
              }}
              disabled={updateMutation.isPending}
            />
          </label>

          <button
            type="button"
            className={bem('profile-edit', 'save', { saved: savedTick })}
            onClick={handleSave}
            disabled={!canSave}
          >
            {updateMutation.isPending
              ? 'Сохраняем…'
              : savedTick
                ? 'Сохранено'
                : 'Сохранить'}
          </button>

          {errorText && (
            <details className={bem('profile-edit', 'error')}>
              <summary>Ошибка сохранения — нажмите, чтобы скопировать</summary>
              <pre
                className={bem('profile-edit', 'error-detail')}
                onClick={() => {
                  navigator.clipboard.writeText(errorText).catch(() => {})
                }}
              >{errorText}</pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
