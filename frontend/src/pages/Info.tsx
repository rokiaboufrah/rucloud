import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export type InfoPage = 'shipping' | 'returns' | 'faq' | 'terms' | 'privacy'

const BLOCK_COUNTS: Record<Exclude<InfoPage, 'faq'>, number> = {
  shipping: 5,
  returns: 5,
  terms: 6,
  privacy: 6,
}

export default function Info({ page }: { page: InfoPage }) {
  const { t } = useTranslation()

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{t(`info.${page}.eyebrow`)}</div>
        <h1 className="page-title">{t(`info.${page}.title`)}</h1>
      </header>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontStyle: 'italic', lineHeight: 1.8, color: 'var(--color-espresso)', marginBottom: '3rem' }}>
          {t(`info.${page}.intro`)}
        </p>

        {page === 'faq' ? (
          <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} style={{ padding: '1.75rem 0', borderBottom: '0.5px solid var(--color-border)' }}>
                <h2 style={{ fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 500, marginBottom: '0.75rem' }}>
                  {t(`info.faq.q${n}`)}
                </h2>
                <p style={bodyStyle}>{t(`info.faq.a${n}`)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {Array.from({ length: BLOCK_COUNTS[page] }, (_, index) => {
              const n = index + 1
              return (
                <div key={n} style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 400, marginBottom: '0.6rem', color: 'var(--color-espresso)' }}>
                    {t(`info.${page}.h${n}`)}
                  </h2>
                  <p style={bodyStyle}>{t(`info.${page}.p${n}`)}</p>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '0.5px solid var(--color-border)', fontSize: '0.8rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: '1.5rem' }}>{t('info.more_questions')}</p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Link to="/shop" style={{ textDecoration: 'underline', color: 'var(--color-accent)' }}>
              {t('info.back_to_shop')}
            </Link>
            <Link to="/contact" style={{ textDecoration: 'underline', color: 'var(--color-accent)' }}>
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const bodyStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  lineHeight: 1.9,
  color: 'var(--color-text-muted)',
}
