import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productsService } from '../services/products';
import { newsletterService } from '../services/newsletter';
import type { Product } from '../types';

const colors = [
  { name: 'Espresso', hex: '#3B2A1F' },
  { name: 'Ivory', hex: '#F0E6D3' },
  { name: 'Noir', hex: '#1A1008' },
  { name: 'Sage', hex: '#8A9E7A' },
  { name: 'Mauve', hex: '#C4A0A8' },
];

export default function Home() {
  const { t } = useTranslation()
  const heroRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    productsService.list({ featured: 'true' }).then(setFeaturedProducts).catch(() => setFeaturedProducts([]))
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!imgRef.current || !contentRef.current) return
      const scrollY = window.scrollY
      const heroHeight = heroRef.current?.offsetHeight || 1
      if (scrollY < heroHeight) {
        const progress = scrollY / heroHeight
        imgRef.current.style.transform = `translateY(${progress * 40}px) scale(${1 + progress * 0.05})`
        contentRef.current.style.transform = `translateY(${-progress * 15}px)`
        contentRef.current.style.opacity = `${1 - progress * 1.2}`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={styles.page}>
      {/* ────────────── HERO ────────────── */}
      <section ref={heroRef} style={styles.hero}>
        <img ref={imgRef} src="/hero/hero.jpg" alt="ru.Cloud collection" style={styles.heroImg} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroVignette} />
        <div style={styles.heroWatermark}>ru.Cloud</div>
        <div ref={contentRef} className="hero-content" style={styles.heroContent}>
          <span style={styles.heroEyebrow}>{t('home.hero_eyebrow')}</span>
          <h1 style={styles.heroTitle}>
            {t('home.hero_title')}
          </h1>
          <Link to="/shop" className="hero-cta" style={styles.heroCta}>
            {t('home.hero_cta')}
          </Link>
        </div>
      </section>

      {/* ────────────── CURATED SELECTION ────────────── */}
      <section style={{ ...styles.section, background: 'var(--color-bg-warm)' }}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <p className="section-subtitle">{t('home.featured_subtitle')}</p>
            <h2 className="section-title">{t('home.featured_title')}</h2>
          </div>
          <div style={styles.productGrid}>
            {(Array.isArray(featuredProducts) ? featuredProducts : []).map(p => (
              <Link to={`/product/${p.slug}`} key={p.slug} style={styles.productCard} className="product-card">
                <div style={styles.productImage}>
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.name} className="product-img-primary"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} />
                  ) : (
                    <div style={styles.productPlaceholder}>
                      <span style={styles.productInitials}>{p.name.split(' ').map(w => w[0]).join('')}</span>
                    </div>
                  )}
                </div>
                <div style={styles.productInfo}>
                  <span style={styles.productName}>{p.name}</span>
                  <span style={styles.productPrice}>DA {parseFloat(p.price).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── STORY ────────────── */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.storyLayout}>
              <div style={styles.storyImageCol}>
                <div style={styles.storyCircle}>
                  <img src="/logo.png" alt="ru.Cloud" style={styles.storyCircleImg} />
                </div>
              </div>
            <div style={styles.storyTextCol}>
              <p className="section-subtitle">{t('home.story_subtitle')}</p>
              <h2 style={styles.storyTitle}>
                {t('home.story_title')}
              </h2>
              <div style={styles.storyBody}>
                <p>
                  {t('home.story_p1')}
                </p>
                <p>
                  {t('home.story_p2')}
                </p>
              </div>
              <div style={styles.storyFooter}>
                {t('home.story_footer')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── COLOR PALETTE ────────────── */}
      <section style={{ ...styles.section, background: 'var(--color-bg-warm)' }}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <p className="section-subtitle">{t('home.palette_subtitle')}</p>
            <h2 className="section-title">{t('home.palette_title')}</h2>
          </div>
          <div style={styles.swatchRow}>
            {colors.map((c) => (
              <div key={c.hex} style={styles.swatch}>
                <div style={{ ...styles.swatchColor, background: c.hex }} />
                <span style={styles.swatchName}>{c.name}</span>
                <span style={styles.swatchHex}>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── NEWSLETTER ────────────── */}
      <section style={styles.newsletterSection}>
        <div className="container">
          <div style={styles.newsletterInner}>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('home.newsletter_subtitle')}
            </p>
            <h2 style={{ ...styles.newsletterTitle, fontFamily: 'var(--font-serif)', fontWeight: 300 }}>
              {t('home.newsletter_title')}
            </h2>
            {newsletterStatus === 'success' ? (
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{t('contact.success')}</p>
            ) : (
            <form style={styles.newsletterForm} onSubmit={async (e) => {
              e.preventDefault()
              if (!email) return
              try {
                await newsletterService.subscribe(email)
                setNewsletterStatus('success')
                setEmail('')
              } catch {
                setNewsletterStatus('error')
              }
            }}>
              <input
                type="email"
                placeholder={t('home.newsletter_placeholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.newsletterInput}
              />
              <button type="submit" style={styles.newsletterBtn}>
                {t('home.newsletter_cta')}
              </button>
            </form>
            )}
            {newsletterStatus === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem' }}>{t('contact.error')}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    overflow: 'hidden',
  },

  /* ── HERO ── */
  hero: {
    position: 'relative',
    height: '100vh',
    minHeight: '700px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-noir)',
    overflow: 'hidden',
  },
  heroImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 30%',
    transition: 'transform 0.1s linear',
    willChange: 'transform',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.6) 100%)',
    zIndex: 1,
  },
  heroVignette: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  heroWatermark: {
    position: 'absolute',
    bottom: '-0.06em',
    right: '-0.03em',
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(12rem, 30vw, 28rem)',
    fontWeight: 400,
    fontStyle: 'italic',
    color: 'rgba(240,230,211,0.05)',
    lineHeight: 1,
    pointerEvents: 'none',
    userSelect: 'none',
    letterSpacing: '0.02em',
    zIndex: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '0 3rem',
    maxWidth: '750px',
    transition: 'transform 0.1s linear, opacity 0.1s linear',
    willChange: 'transform, opacity',
  },
  heroEyebrow: {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    letterSpacing: '5px',
    textTransform: 'uppercase',
    color: 'rgba(240,230,211,0.7)',
    marginBottom: '1.5rem',
    fontWeight: 400,
  },
  heroTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1.8rem, 3.8vw, 3rem)',
    fontWeight: 500,
    fontStyle: 'italic',
    color: '#fff',
    lineHeight: 1.15,
    marginBottom: '2.5rem',
    letterSpacing: '0.02em',
    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  heroCta: {
    display: 'inline-block',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.6)',
    padding: '16px 44px',
    background: 'transparent',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    cursor: 'pointer',
    textDecoration: 'none',
  },

  /* ── SECTION ── */
  section: {
    padding: '6rem 0',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },

  /* ── PRODUCT GRID ── */
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
  },
  productImage: {
    width: '100%',
    aspectRatio: '3 / 4',
    overflow: 'hidden',
    background: 'var(--color-bg-warm)',
    border: '0.5px solid var(--color-border)',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg-warm)',
  },
  productInitials: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontStyle: 'italic',
    color: 'var(--color-text-muted)',
    opacity: 0.4,
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '0 0.25rem',
  },
  productName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: 'var(--color-espresso)',
  },
  productPrice: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    letterSpacing: '0.5px',
  },

  /* ── STORY ── */
  storyLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '5rem',
    alignItems: 'center',
  },
  storyImageCol: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyCircle: {
    width: 'clamp(220px, 20vw, 340px)',
    height: 'clamp(220px, 20vw, 340px)',
    borderRadius: '50%',
    background: '#4A352C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storyCircleImg: {
    width: '70%',
    height: 'auto',
    display: 'block',
  },
  storyTextCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  storyTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'var(--color-espresso)',
    lineHeight: 1.3,
  },
  storyBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'var(--color-text)',
    opacity: 0.85,
  },
  storyFooter: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    paddingTop: '1rem',
    borderTop: '0.5px solid var(--color-border)',
  },

  /* ── COLOR SWATCHES ── */
  swatchRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  swatch: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    minWidth: '100px',
  },
  swatchColor: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '0.5px solid var(--color-border)',
    transition: 'transform 0.3s',
    cursor: 'crosshair',
  },
  swatchName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    color: 'var(--color-espresso)',
  },
  swatchHex: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.65rem',
    letterSpacing: '1px',
    color: 'var(--color-text-muted)',
  },

  /* ── NEWSLETTER ── */
  newsletterSection: {
    padding: '5rem 0',
    background: 'var(--color-noir)',
  },
  newsletterInner: {
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  newsletterTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: '0.5rem',
  },
  newsletterForm: {
    display: 'flex',
    gap: '0',
    borderBottom: '0.5px solid rgba(255,255,255,0.3)',
    paddingBottom: '0.5rem',
  },
  newsletterInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#fff',
    padding: '12px 0',
    fontWeight: 300,
  },
  newsletterBtn: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.7rem',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#fff',
    background: 'transparent',
    border: 'none',
    padding: '12px 0 12px 24px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    whiteSpace: 'nowrap',
  },
};
