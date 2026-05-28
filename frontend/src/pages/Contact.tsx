import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { contactService } from '../services/contact'

export default function Contact() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await contactService.send(form)
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || t('contact.error'))
    }
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{t('contact.title')}</div>
        <h1 className="page-title">Contact Us</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
            {t('contact.subtitle')}
          </p>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-espresso)' }}>{t('contact.info_email')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>hello@rucloud.dz</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--color-espresso)' }}>Studio</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Algiers, Algeria<br />By appointment only.</p>
          </div>
        </div>

        <div>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#faf8f5' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', color: 'var(--color-sage)' }}>{t('contact.success')}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>{error}</p>}
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{t('contact.name_label')}</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} placeholder={t('contact.name_placeholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{t('contact.email_label')}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} placeholder={t('contact.email_placeholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '0.5rem' }}>{t('contact.message_label')}</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', resize: 'vertical' }} placeholder={t('contact.message_placeholder')} />
              </div>
              <button type="submit" className="btn-dark" style={{ width: '100%' }}>{t('contact.submit')}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
