import { Component, type ReactNode, type ErrorInfo } from 'react'
import { isAxiosError } from 'axios'
import i18n from '@/utils/i18n'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  copied: boolean
}

function describeError(err: Error | null, info: ErrorInfo | null): string {
  if (!err) return ''
  const parts: string[] = []
  parts.push(`${err.name ?? 'Error'}: ${err.message ?? '(no message)'}`)

  if (isAxiosError(err)) {
    const status = err.response?.status
    const url = err.config?.url
    const method = err.config?.method?.toUpperCase()
    parts.push(`HTTP ${status ?? 'no-response'} ${method ?? ''} ${url ?? ''}`)
    const data = err.response?.data
    if (data) {
      const body = typeof data === 'string' ? data : JSON.stringify(data)
      parts.push(`Response: ${body.slice(0, 800)}`)
    }
  }

  if (err.stack) {
    parts.push('')
    parts.push(err.stack.split('\n').slice(0, 8).join('\n'))
  }

  if (info?.componentStack) {
    parts.push('')
    parts.push(`Component stack:${info.componentStack.split('\n').slice(0, 8).join('\n')}`)
  }

  return parts.join('\n')
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, copied: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ errorInfo: info })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false })
  }

  handleCopy = async () => {
    const detail = describeError(this.state.error, this.state.errorInfo)
    if (!detail) return
    try {
      await navigator.clipboard.writeText(detail)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const detail = describeError(this.state.error, this.state.errorInfo)

    if (this.props.fallback) return this.props.fallback

    return (
      <div style={{
        padding: '24px',
        color: '#fafafa',
        background: '#121212',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ fontSize: '48px' }}>&#9888;&#65039;</div>
        <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
          {i18n.t('common:error.generic')}
        </p>

        {detail && (
          <pre
            onClick={this.handleCopy}
            style={{
              margin: 0,
              padding: '10px 12px',
              maxWidth: '90vw',
              maxHeight: '40vh',
              overflow: 'auto',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '10px',
              color: 'rgba(250,250,250,0.85)',
              fontSize: '10px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              textAlign: 'left',
              cursor: 'copy',
              userSelect: 'all',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
            title="Tap to copy"
          >{detail}</pre>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {detail && (
            <button
              type="button"
              onClick={this.handleCopy}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fafafa',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {this.state.copied ? 'Скопировано' : 'Скопировать ошибку'}
            </button>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              background: '#ac9dff',
              color: '#121212',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {i18n.t('common:error.retry')}
          </button>
        </div>
      </div>
    )
  }
}
