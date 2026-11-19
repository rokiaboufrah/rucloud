import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { accountsService } from '../services/accounts'
import { getApiErrorMessage } from '../services/errors'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const result = await accountsService.requestPasswordReset(email)
      setMessage(result.message || t('forgot.sent'))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t('forgot.error')))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{t('forgot.eyebrow')}</div>
        <h1 className="page-title">{t('forgot.title')}</h1>
      </header>

      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 2rem' }}>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {t('forgot.subtitle')}
        </p>

        {message && (
          <p style={{ background: '#faf8f5', padding: '1.25rem', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {message}
          </p>
        )}
        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={labelStyle} htmlFor="forgot-email">{t('forgot.email_label')}</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('forgot.email_placeholder')}
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
            {submitting ? t('forgot.submitting') : t('forgot.submit')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <Link to="/account" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            {t('forgot.back_to_account')}
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
  color: 'var(--color-espresso)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 15px',
  border: '0.5px solid var(--color-border)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.8rem',
  background: '#fff',
  boxSizing: 'border-box',
}
