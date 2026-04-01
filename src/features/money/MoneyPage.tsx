import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassHeader } from '@/components/GlassHeader'
import { moneyApi } from '@/api/endpoints'
import { triggerHaptic } from '@/utils'
import type { Transaction, WithdrawRequest } from '@/api/types'
import { Skeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { bem, cn } from '@/utils/cn'
import './MoneyPage.scss'

const b = 'money-page'
type View = 'main' | 'withdraw'

// ─── Icons ───────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 14V3C2 2.45 2.45 2 3 2H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
      <rect x="0.75" y="0.75" width="20.5" height="15.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="0" y="5" width="22" height="3.5" fill="currentColor" />
      <rect x="3" y="11" width="5" height="2" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="18" height="17" viewBox="0 0 24 22" fill="none">
      <path d="M20.84 3.61C20.3292 3.099 19.7228 2.694 19.0554 2.417C18.3879 2.141 17.6725 1.998 16.95 1.998C16.2275 1.998 15.5121 2.141 14.8446 2.417C14.1772 2.694 13.5708 3.099 13.06 3.61L12 4.67L10.94 3.61C9.9083 2.578 8.50903 1.999 7.05 1.999C5.59096 1.999 4.19169 2.578 3.16 3.61C2.1283 4.642 1.54871 6.041 1.54871 7.5C1.54871 8.959 2.1283 10.358 3.16 11.39L12 20.23L20.84 11.39C21.351 10.879 21.7563 10.273 22.0329 9.605C22.3095 8.938 22.4518 8.223 22.4518 7.5C22.4518 6.778 22.3095 6.062 22.0329 5.395C21.7563 4.727 21.351 4.121 20.84 3.61Z" fill="white" />
    </svg>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

function MainView({ onWithdraw }: { onWithdraw: () => void }) {
  const { t } = useTranslation('money')
  const [copied, setCopied] = useState(false)

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['money', 'balance'],
    queryFn: () => moneyApi.getBalance().then(r => r.data.data),
  })

  const { data: referral } = useQuery({
    queryKey: ['money', 'referral'],
    queryFn: () => moneyApi.getReferralStats().then(r => r.data.data),
  })

  function handleCopy() {
    triggerHaptic('tap')
    const link = referral?.link ?? 'https://t.me/mamaevest_money?start=ref_6348551853'
    navigator.clipboard.writeText(link).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={bem(b, 'main-view')}>
      <GlassHeader showBack title={t('title')} />

      <div className={bem(b, 'content')}>
        {/* Intro card */}
        <div className={bem(b, 'intro-wrapper')}>
          <div className={bem(b, 'intro-card')}>
            <div className={bem(b, 'intro-card-top')}>
              <h2 className={bem(b, 'intro-title')}>{t('intro_title')}</h2>
              <button type="button" className={bem(b, 'intro-heart-btn')} aria-label="В избранное">
                <HeartIcon />
              </button>
            </div>
            <div className={bem(b, 'intro-thumbnail-wrap')}>
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop"
                alt=""
                className={bem(b, 'intro-thumbnail')}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className={bem(b, 'intro-materials')}>
            <div className={bem(b, 'intro-materials-bar')}>
              <img src="/images/courses/materials-icon.svg" alt="" aria-hidden="true" className={bem(b, 'intro-materials-icon')} />
              <span>{t('lessons_title')}</span>
            </div>
          </div>
        </div>

        {/* Referral card */}
        <div className={bem(b, 'referral-card')}>
          <p className={bem(b, 'referral-hint')}>{t('referral_hint')}</p>
          <div className={bem(b, 'referral-row')}>
            <div className={bem(b, 'referral-link-box')}>
              <span className={bem(b, 'referral-link')}>
                {referral?.link ?? 'https://t.me/mamaevest_money?start=ref_6348551853'}
              </span>
            </div>
            <button
              type="button"
              className={bem(b, 'referral-copy-btn')}
              onClick={handleCopy}
              aria-label={copied ? t('copied') : t('referral_copy')}
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div className={bem(b, 'stats-card')}>
          <h3 className={bem(b, 'stats-title')}>{t('stats_title')}</h3>
          <div className={bem(b, 'stats-rows')}>
            <div className={bem(b, 'stats-row')}>
              <span className={bem(b, 'stats-label')}>{t('stats_invited')}</span>
              <span className={bem(b, 'stats-value')}>{referral?.invitedCount ?? 0}</span>
            </div>
            <div className={bem(b, 'stats-divider')} />
            <div className={bem(b, 'stats-row')}>
              <span className={bem(b, 'stats-label')}>{t('stats_active')}</span>
              <span className={cn(bem(b, 'stats-value'), bem(b, 'stats-value', { green: true }))}>{referral?.activeCount ?? 0}</span>
            </div>
            <div className={bem(b, 'stats-divider')} />
            <div className={bem(b, 'stats-row')}>
              <span className={bem(b, 'stats-label')}>{t('stats_commission')}</span>
              <span className={cn(bem(b, 'stats-value'), bem(b, 'stats-value', { purple: true }))}>{referral?.percentage ?? 20}%</span>
            </div>
          </div>
          <p className={bem(b, 'stats-status-title')}>{t('your_status')}</p>
          <div className={bem(b, 'status-badges')}>
            <span className={cn(bem(b, 'status-badge'), bem(b, 'status-badge', { active: true }))}>
              PREMIUM - 20%
            </span>
            <span className={bem(b, 'status-badge')}>
              {t('status_partner')} - 25%
            </span>
            <span className={bem(b, 'status-badge')}>
              {t('status_top')} - 30%
            </span>
          </div>
        </div>

        {/* Balance card */}
        <div className={bem(b, 'balance-card')}>
          <span className={bem(b, 'balance-label')}>{t('total_balance')}</span>
          <div className={bem(b, 'balance-main')}>
            {balanceLoading ? (
              <Skeleton variant="text" width={120} height={44} />
            ) : (
              <span className={bem(b, 'balance-amount')}>
                {balance?.amount.toLocaleString() ?? '0'} {balance?.currency ?? '₽'}
              </span>
            )}
            <button
              type="button"
              className={bem(b, 'withdraw-btn')}
              onClick={() => { triggerHaptic('tap'); onWithdraw() }}
            >
              {t('withdraw_btn')}
            </button>
          </div>
          <div className={bem(b, 'balance-divider')} />
          <div className={bem(b, 'balance-row')}>
            <span className={bem(b, 'balance-row-label')}>{t('available')}</span>
            <span className={bem(b, 'balance-row-value')}>
              {(balance?.availableAmount ?? balance?.amount ?? 0).toLocaleString()} {balance?.currency ?? '₽'}
            </span>
          </div>
          <div className={bem(b, 'balance-divider')} />
          <div className={bem(b, 'balance-row')}>
            <span className={bem(b, 'balance-row-label')}>{t('pending_label')}</span>
            <span className={bem(b, 'balance-row-value')}>
              {(balance?.pendingAmount ?? 0).toLocaleString()} {balance?.currency ?? '₽'}
            </span>
          </div>
        </div>

        {/* History row */}
        <button
          type="button"
          className={bem(b, 'history-row')}
          onClick={() => { triggerHaptic('tap'); onWithdraw() }}
        >
          <span className={bem(b, 'history-row-icon')}><CardIcon /></span>
          <span className={bem(b, 'history-row-label')}>{t('withdraw_history')}</span>
          <span className={bem(b, 'history-row-chevron')}><ChevronRightIcon /></span>
        </button>
      </div>
    </div>
  )
}

// ─── Withdraw view ───────────────────────────────────────────────────────────

type WithdrawMethod = 'card' | 'crypto' | 'cash'

function WithdrawView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('money')
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [method, setMethod] = useState<WithdrawMethod>('card')

  const { data: balance } = useQuery({
    queryKey: ['money', 'balance'],
    queryFn: () => moneyApi.getBalance().then(r => r.data.data),
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['money', 'transactions'],
    queryFn: () => moneyApi.getTransactions().then(r => r.data.data),
  })

  const withdrawMutation = useMutation({
    mutationFn: (req: WithdrawRequest) => moneyApi.withdraw(req),
    onSuccess: () => {
      triggerHaptic('success')
      queryClient.invalidateQueries({ queryKey: ['money'] })
      setAmount('')
      setCardNumber('')
    },
    onError: () => {
      triggerHaptic('error')
    },
  })

  const formatCard = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const transactions = txData ?? []

  return (
    <div className={bem(b, 'withdraw-view')}>
      <GlassHeader
        title={t('withdraw_title')}
        left={
          <button
            className="glass-header__back"
            onClick={() => { triggerHaptic('tap'); onBack() }}
            aria-label="Назад"
          >
            <svg viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        }
      />

      <div className={bem(b, 'withdraw-content')}>
        {/* Withdraw form card */}
        <div className={bem(b, 'form-card')}>
          <div className={bem(b, 'field')}>
            <label className={bem(b, 'field-label')} htmlFor="withdraw-amount">
              {t('amount_label_full')}
            </label>
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

          <div className={bem(b, 'field')}>
            <span className={bem(b, 'field-label')}>{t('method_label')}</span>
            <div className={bem(b, 'methods')}>
              <button
                type="button"
                className={cn(bem(b, 'method'), bem(b, 'method', { active: method === 'card' }))}
                onClick={() => { triggerHaptic('select'); setMethod('card') }}
              >
                <span className={bem(b, 'method-emoji')}>💳</span>
                <span className={bem(b, 'method-label')}>{t('method_card')}</span>
              </button>
              <button
                type="button"
                className={cn(bem(b, 'method'), bem(b, 'method', { disabled: true }))}
                disabled
              >
                <span className={bem(b, 'method-icon-t')}>₸</span>
                <span className={bem(b, 'method-label')}>{t('method_crypto')}</span>
              </button>
              <button
                type="button"
                className={cn(bem(b, 'method'), bem(b, 'method', { disabled: true }))}
                disabled
              >
                <span className={bem(b, 'method-emoji')}>💵</span>
                <span className={bem(b, 'method-label')}>{t('method_cash')}</span>
              </button>
            </div>
          </div>

          <div className={bem(b, 'field')}>
            <label className={bem(b, 'field-label')} htmlFor="withdraw-card">
              {t('card_number_label_full')}
            </label>
            <input
              id="withdraw-card"
              type="text"
              inputMode="numeric"
              className={bem(b, 'input')}
              placeholder={t('card_number_placeholder')}
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              maxLength={19}
            />
          </div>

          <button
            className={bem(b, 'submit-btn')}
            disabled={
              !amount ||
              Number(amount) < 1000 ||
              cardNumber.replace(/\s/g, '').length < 16 ||
              withdrawMutation.isPending
            }
            onClick={() => {
              if (!amount || !cardNumber) return
              withdrawMutation.mutate({
                amount: Number(amount),
                currency: balance?.currency ?? '₽',
                cardNumber: cardNumber.replace(/\s/g, ''),
              })
            }}
          >
            {withdrawMutation.isPending ? t('loading') : t('submit_withdraw')}
          </button>

          <p className={bem(b, 'form-disclaimer')}>{t('disclaimer')}</p>
        </div>

        {/* History */}
        <h3 className={bem(b, 'history-title-centered')}>{t('history_transfers')}</h3>

        {txLoading && (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={bem(b, 'tx-card')}>
              <Skeleton variant="text" height={10} width="40%" />
              <Skeleton variant="text" height={14} width="70%" />
              <Skeleton variant="text" height={10} width="30%" />
            </div>
          ))
        )}

        {!txLoading && transactions.length === 0 && (
          <EmptyState
            icon="💸"
            title={t('no_transactions')}
            description={t('no_transactions_desc')}
            className={bem(b, 'tx-empty')}
          />
        )}

        {!txLoading && transactions.map(tx => (
          <TransactionCard key={tx.id} tx={tx} />
        ))}
      </div>
    </div>
  )
}

// ─── Transaction card (withdraw view) ────────────────────────────────────────

function TransactionCard({ tx }: { tx: Transaction }) {
  const { t } = useTranslation('money')
  const formattedDate = new Date(tx.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const statusKey = tx.status as 'completed' | 'pending' | 'failed'

  return (
    <div className={bem(b, 'tx-card')}>
      <span className={bem(b, 'tx-card-date')}>{formattedDate}</span>
      <div className={bem(b, 'tx-card-main')}>
        <span className={bem(b, 'tx-card-desc')}>{t('method_card_label')}</span>
        <span className={cn(bem(b, 'tx-card-amount'), bem(b, 'tx-card-amount', { debit: tx.type === 'debit' }))}>
          -{tx.amount.toLocaleString()} {tx.currency}
        </span>
      </div>
      <div className={bem(b, 'tx-card-divider')} />
      <div className={bem(b, 'tx-card-status-row')}>
        <span className={bem(b, 'tx-card-status-label')}>{t('status_label')}</span>
        <span className={cn(bem(b, 'tx-card-status'), bem(b, 'tx-card-status', { [statusKey]: true }))}>
          {t(`statuses.${statusKey}`)}
        </span>
      </div>
    </div>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

export function MoneyPage() {
  const [view, setView] = useState<View>('main')

  return (
    <div className={b}>
      <AnimatePresence mode="wait" initial={false}>
        {view === 'main' ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <MainView onWithdraw={() => setView('withdraw')} />
          </motion.div>
        ) : (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22 }}
          >
            <WithdrawView onBack={() => setView('main')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
