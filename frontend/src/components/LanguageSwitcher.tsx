import { useTranslation } from 'react-i18next'
import { LANGUAGE_OPTIONS } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const switchLang = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    document.documentElement.dir = LANGUAGE_OPTIONS.find(l => l.code === code)?.dir || 'ltr'
    document.documentElement.lang = code
  }

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {LANGUAGE_OPTIONS.map((lang, i) => (
        <span key={lang.code} style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => switchLang(lang.code)}
            style={{
              fontSize: '0.6rem', letterSpacing: '1px', cursor: 'pointer',
              color: i18n.language === lang.code ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: i18n.language === lang.code ? 600 : 400,
              border: 'none', background: 'none', padding: '2px 3px',
              transition: 'color 0.2s',
            }}
          >
            {lang.label}
          </button>
          {i < LANGUAGE_OPTIONS.length - 1 && (
            <span style={{ color: 'var(--color-border)', fontSize: '0.6rem' }}>/</span>
          )}
        </span>
      ))}
    </div>
  )
}
