import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { accountsService } from '../services/accounts'
import { getApiErrorMessage } from '../services/errors'

export default function ResetPassword() {
  const { t } = useTranslation()
  const { uid, token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError(t('reset.mismatch'))
      return
    }
    if (!uid || !token) {
      setError(t('reset.error'))
      return
    }
    setSubmitting(true)
    try {
      const result = await accountsService.confirmPasswordReset(uid, token, password)
      setMessage(result.message || t('reset.success'))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, t('reset.error')))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{t('reset.eyebrow')}</div>
        <h1 className="page-title">{t('reset.title')}</h1>
      </header>

      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 2rem' }}>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {t('reset.subtitle')}
        </p>

        {message ? (
          <div style={{ background: '#faf8f5', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>{message}</p>
            <Link to="/account" className="btn-primary">{t('reset.back_to_account')}</Link>
          </div>
        ) : (
          <>
            {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle} htmlFor="reset-password">{t('reset.password_label')}</label>
                <input
                  id="reset-password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle} htmlFor="reset-confirm">{t('reset.confirm_label')}</label>
                <input
                  id="reset-confirm"
                  name="confirm_password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
                {submitting ? t('reset.submitting') : t('reset.submit')}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <Link to="/account" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
                {t('reset.back_to_account')}
              </Link>
            </p>
          </>
        )}
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
