import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { accountsService } from '../services/accounts'
import type { User } from '../types'

export default function Account() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    accountsService.me().then(setUser).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    try {
      const u = await accountsService.login(data.get('username') as string, data.get('password') as string)
      setUser(u)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const payload = {
      username: data.get('username') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
      password2: data.get('password') as string,
    }
    try {
      await accountsService.register(payload)
      const u = await accountsService.login(payload.username, payload.password)
      setUser(u)
    } catch (err: any) {
      setError(err?.response?.data?.message?.[0] || err?.response?.data?.error || 'Registration failed')
    }
  }

  const handleLogout = async () => {
    await accountsService.logout()
    setUser(null)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>Loading...</div>
  }

  if (user) {
    return (
      <div>
        <header className="page-header">
          <div className="page-eyebrow">{t('account.login_title')}</div>
          <h1 className="page-title">My Account</h1>
        </header>
        <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 2rem' }}>
          <div style={{ background: '#faf8f5', padding: '2rem', marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>Hello, {user.username}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-primary">{t('account.logout')}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">Welcome</div>
        <h1 className="page-title">{isRegister ? t('account.register_title') : t('account.login_btn')}</h1>
      </header>

      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 2rem' }}>
        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('account.register_name')}</label>
                <input name="username" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('account.register_email')}</label>
                <input name="email" type="email" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
              </div>
            </>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{isRegister ? t('account.register_name') : t('account.login_email')}</label>
            {!isRegister && <input name="username" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{isRegister ? t('account.register_password') : t('account.login_password')}</label>
            <input name="password" type="password" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
          </div>
          <button type="submit" className="btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isRegister ? t('account.register_btn') : t('account.login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {isRegister ? (
            <>Already have an account? <button onClick={() => setIsRegister(false)} style={{ textDecoration: 'underline', color: 'var(--color-accent)', fontSize: '0.8rem' }}>Sign in</button></>
          ) : (
            <>Don't have an account? <button onClick={() => setIsRegister(true)} style={{ textDecoration: 'underline', color: 'var(--color-accent)', fontSize: '0.8rem' }}>Register</button></>
          )}
        </p>
      </div>
    </div>
  )
}
