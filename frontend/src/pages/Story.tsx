import { useTranslation } from 'react-i18next'

export default function Story() {
  const { t } = useTranslation()
  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 3rem)', paddingBottom: '5rem' }}>
      {/* ─── HERO ─── */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: '680px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '1.5rem' }}>{t('story.eyebrow')}</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-espresso)', lineHeight: 1.3, marginBottom: '2rem' }}>
          {t('story.title')}
        </h1>
      </div>

      {/* ─── SECTION 1: BRAND STORY ─── */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.brand_p1')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.brand_p2')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.brand_p3')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-espresso)', fontStyle: 'italic', fontWeight: 500 }}>
          {t('story.brand_closing')}
        </p>
      </section>

      {/* ─── DIVIDER ─── */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ borderTop: '0.5px solid var(--color-border)', marginBottom: '4rem' }} />
      </div>

      {/* ─── SECTION 2: FOUNDER ─── */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '0 2rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-sage)', marginBottom: '1rem' }}>{t('story.founder_label')}</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-espresso)', marginBottom: '2rem' }}>
          {t('story.founder_name')}
        </h2>

        {/* Founder Image */}
        <div style={{ width: '100%', marginBottom: '2.5rem', background: '#f5f5f5' }}>
          <img src="/founder.jpg" alt={t('story.founder_name')}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p1')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p2')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p3')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p4')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p5')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p6')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          {t('story.founder_p7')}
        </p>
        <p style={{ fontSize: '0.85rem', lineHeight: 2.2, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {t('story.founder_p8')}
        </p>
      </section>
    </div>
  )
}
