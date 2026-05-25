import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SkeletonGrid } from '@/components/SkeletonGrid'
import { EmptyState } from '@/components/EmptyState'
import { BackButton } from '@/components/BackButton'
import { toast } from '@/components/Toast'
import { userApi, withdrawalsApi } from '@/api/endpoints'
import { triggerHaptic, formatTransactionDate, formatCardNumber } from '@/utils'
import { bem, cn } from '@/utils/cn'
import type { BackendWithdrawal, BackendWithdrawalStatus } from '@/api/types'
import './MoneyWithdrawalPage.scss'

const b = 'money-withdrawal'

type WithdrawMethod = 'card' | 'crypto' | 'cash'

// Map backend status code → fronted SCSS modifier (`completed` is the
// "approved" terminal state, the others stay as-is).
function statusKeyOf(code: string): 'completed' | 'pending' | 'failed' {
  if (code === 'approved') return 'completed'
  if (code === 'rejected') return 'failed'
  return 'pending'
}

interface TransactionCardProps {
  withdrawal: BackendWithdrawal
  statuses: BackendWithdrawalStatus[]
}

function TransactionCard({ withdrawal, statuses }: TransactionCardProps) {
  const { t } = useTranslation('money')
  const statusKey = statusKeyOf(withdrawal.status)
  const statusLabel =
    statuses.find((s) => s.code === withdrawal.status)?.title ??
    t(`statuses.${statusKey}`)

  return (
    <div className={bem(b, 'tx-card')}>
      <span className={bem(b, 'tx-date')}>
        {formatTransactionDate(withdrawal.created_at ?? '')}
      </span>
      <div className={bem(b, 'tx-main')}>
        <span className={bem(b, 'tx-method')}>{t('method_card_label')}</span>
        <span className={cn(bem(b, 'tx-amount'), bem(b, 'tx-amount', { [statusKey]: true }))}>
          -{withdrawal.amount.toLocaleString('ru-RU')} ₽
        </span>
      </div>
      <div className={bem(b, 'tx-divider')} />
      <div className={bem(b, 'tx-status-row')}>
        <span className={bem(b, 'tx-status-label')}>{t('status_label')}</span>
        <span className={cn(bem(b, 'tx-status'), bem(b, 'tx-status', { [statusKey]: true }))}>
          {statusLabel}
        </span>
      </div>
    </div>
  )
}

export function MoneyWithdrawalPage() {
  const { t } = useTranslation('money')
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [method, setMethod] = useState<WithdrawMethod>('card')

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data.data),
    staleTime: 60_000,
  })

  const { data: withdrawals = [], isLoading: txLoading } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => withdrawalsApi.getList().then((r) => r.data),
  })

  const { data: statuses = [] } = useQuery({
    queryKey: ['withdrawals', 'statuses'],
    queryFn: () => withdrawalsApi.getStatuses().then((r) => r.data),
    staleTime: 60 * 60_000,
  })

  const withdrawMutation = useMutation({
    mutationFn: (amt: number) => withdrawalsApi.create(amt),
    onSuccess: () => {
      triggerHaptic('success')
      toast.success(t('toast_withdraw_sent'))
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setAmount('')
      setCardNumber('')
    },
    onError: (e: unknown) => {
      triggerHaptic('error')
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 422) toast.error(t('toast_insufficient_balance', {
        defaultValue: 'Недостаточно средств',
      }))
      else toast.error(t('toast_withdraw_failed'))
    },
  })

  const balance = profile?.balance ?? 0

  const numericAmount = Number(amount)
  const canSubmit =
    !!amount &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 1 &&
    numericAmount <= balance &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    method === 'card' &&
    !withdrawMutation.isPending

  function handleSubmit() {
    if (!canSubmit) return
    triggerHaptic('tap')
    withdrawMutation.mutate(numericAmount)
  }

  return (
    <div className={b}>
      <BackButton block={b} to="/money" />
      <h1 className={bem(b, 'title')}>{t('withdraw_title')}</h1>

      <div className={bem(b, 'content')}>
        {/* Withdrawal form card */}
        <div className={bem(b, 'form-card')}>
          <label className={bem(b, 'label')} htmlFor="withdraw-amount">
            {t('amount_label_full')}
          </label>
          <div className={bem(b, 'input-wrap')}>
            <input
              id="withdraw-amount"
              type="number"
              inputMode="numeric"
              className={bem(b, 'input')}
              placeholder={t('amount_placeholder_full')}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <span className={bem(b, 'label')}>{t('method_label')}</span>
          <div className={bem(b, 'methods')}>
            <button
              type="button"
              className={cn(bem(b, 'method'), bem(b, 'method', { active: method === 'card' }))}
              onClick={() => { triggerHaptic('select'); setMethod('card') }}
            >
              <span className={bem(b, 'method-emoji')} aria-hidden="true">💳</span>
              <span className={bem(b, 'method-label')}>
                <span>{t('method_card_line1')}</span>
                <span>{t('method_card_line2')}</span>
              </span>
            </button>
            <button
              type="button"
              className={cn(bem(b, 'method'), bem(b, 'method', { disabled: true }))}
              disabled
            >
              <img
                src="/app/images/money/crypto.jpg"
                alt=""
                aria-hidden="true"
                className={bem(b, 'method-image')}
              />
              <span className={bem(b, 'method-label')}>
                <span>{t('method_crypto_line1')}</span>
                <span>{t('method_crypto_line2')}</span>
              </span>
            </button>
            <button
              type="button"
              className={cn(bem(b, 'method'), bem(b, 'method', { disabled: true }))}
              disabled
            >
              <span className={cn(bem(b, 'method-emoji'), bem(b, 'method-emoji', { faded: true }))} aria-hidden="true">💵</span>
              <span className={bem(b, 'method-label')}>
                <span>{t('method_cash_line1')}</span>
                <span>{t('method_cash_line2')}</span>
              </span>
            </button>
          </div>

          <label className={bem(b, 'label')} htmlFor="withdraw-card">
            {t('card_number_label_full')}
          </label>
          <div className={bem(b, 'input-wrap')}>
            <input
              id="withdraw-card"
              type="text"
              inputMode="numeric"
              className={bem(b, 'input')}
              placeholder={t('card_number_placeholder')}
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />
          </div>

          <button
            type="button"
            className={bem(b, 'submit')}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {withdrawMutation.isPending ? t('loading') : t('submit_withdraw')}
          </button>

          <p className={bem(b, 'footnote')}>{t('disclaimer')}</p>
        </div>

        {/* History */}
        <h2 className={bem(b, 'history-title')}>{t('history_transfers')}</h2>

        <div className={bem(b, 'history-list')}>
          {txLoading && <SkeletonGrid count={3} height={90} borderRadius={16} />}

          {!txLoading && withdrawals.length === 0 && (
            <EmptyState
              icon="💸"
              title={t('no_transactions')}
              description={t('no_transactions_desc')}
            />
          )}

          {!txLoading && withdrawals.map((w) => (
            <TransactionCard key={w.id} withdrawal={w} statuses={statuses} />
          ))}
        </div>
      </div>
    </div>
  )
}
