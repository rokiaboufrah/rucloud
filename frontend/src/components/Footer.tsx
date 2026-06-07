import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer style={{
      background: '#fff',
      borderTop: '0.5px solid var(--color-border)',
      padding: '4rem 2rem 2rem',
      marginTop: '4rem',
    }}>
      <div style={{
        maxWidth: 'var(--max-width)', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        gap: '2rem', marginBottom: '3rem',
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.5rem',
            fontWeight: 300, marginBottom: '1rem', color: '#111',
          }}>ru.Cloud</h3>
          <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.8, maxWidth: '260px' }}>
            {t('footer.tagline')}
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', color: '#111' }}>{t('footer.shop_title')}</h4>
          {[{ label: 'All', cat: '' }, { label: 'Abayas', cat: 'abayas' }, { label: 'Sets', cat: 'sets' }, { label: 'Dresses', cat: 'dresses' }, { label: 'Scarves', cat: 'scarves' }].map(item => (
            <Link key={item.label} to={item.cat ? `/shop?category=${item.cat}` : '/shop'} style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{item.label}</Link>
          ))}
        </div>

        {/* About */}
        <div>
          <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', color: '#111' }}>{t('footer.about_title')}</h4>
          <Link to="/story" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{t('footer.our_story')}</Link>
          <Link to="/shop" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{t('footer.lookbook')}</Link>
          <Link to="/" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{t('footer.journal')}</Link>
          <Link to="/" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{t('footer.color_palette')}</Link>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', color: '#111' }}>{t('footer.support_title')}</h4>
          <Link to="/contact" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>{t('footer.contact')}</Link>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem', opacity: 0.5 }}>{t('footer.shipping')}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem', opacity: 0.5 }}>{t('footer.returns')}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem', opacity: 0.5 }}>{t('footer.faq')}</span>
        </div>

        {/* Social */}
        <div>
          <h4 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', color: '#111' }}>{t('footer.follow_title')}</h4>
          <a href="https://instagram.com/rucloud" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>Instagram</a>
          <a href="https://pinterest.com/rucloud" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>Pinterest</a>
          <a href="https://tiktok.com/@rucloud" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.75rem', color: '#444', marginBottom: '0.6rem' }}>TikTok</a>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        maxWidth: 'var(--max-width)', margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '2rem', borderTop: '0.5px solid rgba(0,0,0,0.06)',
        fontSize: '0.65rem', color: '#666',
      }}>
        <span>{t('footer.copyright')}</span>
        <span>{t('footer.location')}</span>
      </div>
    </footer>
  )
}
