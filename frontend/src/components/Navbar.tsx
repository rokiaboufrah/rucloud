import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { cartService } from '../services/cart'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMega, setActiveMega] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const fetchCartCount = () => {
    cartService.get().then(c => setCartCount(c.item_count)).catch(() => setCartCount(0))
  }

  useEffect(() => { fetchCartCount() }, [location.pathname])

  useEffect(() => {
    window.addEventListener('cart-updated', fetchCartCount)
    return () => window.removeEventListener('cart-updated', fetchCartCount)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textColor = scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.92)'
  const logoColor = scrolled ? 'var(--color-text)' : '#fff'

  type MegaItem = { title: string; links: { label: string; path: string }[] }
  const navItems: { label: string; path: string; mega: MegaItem[] }[] = [
    {
      label: t('nav.shop'),
      path: '/shop',
      mega: [
        { title: t('nav.mega.clothing'), links: [
          { label: t('nav.mega.all'), path: '/shop' },
          { label: t('nav.mega.abayas'), path: '/shop?category=abayas' },
          { label: t('nav.mega.sets'), path: '/shop?category=sets' },
          { label: t('nav.mega.dresses'), path: '/shop?category=dresses' },
          { label: t('nav.mega.tops'), path: '/shop?category=tops' },
          { label: t('nav.mega.pants'), path: '/shop?category=pants' },
        ]},
        { title: t('nav.mega.accessories'), links: [
          { label: t('nav.mega.crochet_squin_hat'), path: '/shop?category=accessories' },
        ]},
      ],
    },
    { label: t('nav.the_collection'), path: '/shop', mega: [] },
    { label: t('nav.our_story'), path: '/story', mega: [] },
    { label: t('nav.contact'), path: '/contact', mega: [] },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      borderBottom: scrolled ? '0.5px solid var(--color-border)' : '0.5px solid transparent',
      transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 3rem', height: 'var(--nav-height)', maxWidth: 'var(--max-width)', margin: '0 auto',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 400,
          letterSpacing: '3px', color: logoColor, transition: 'color 0.4s',
        }}>
          ru.Cloud
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', position: 'relative', alignItems: 'center' }}>
          {navItems.map((item, i) => (
            <div key={i}
              onMouseEnter={() => item.mega?.length && setActiveMega(i)}
              onMouseLeave={() => setActiveMega(null)}
              style={{ position: 'relative' }}
            >
              <Link to={item.path} style={{
                fontSize: '0.68rem', letterSpacing: '2.5px', textTransform: 'uppercase',
                color: textColor, padding: '1.5rem 0', display: 'block',
                transition: 'color 0.3s, opacity 0.3s', opacity: activeMega === i ? 1 : 0.85,
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { if (activeMega !== i) e.currentTarget.style.opacity = '0.85' }}
              >
                {item.label}
              </Link>
              {activeMega === i && item.mega && item.mega.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: '-3rem',
                  background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
                  border: '0.5px solid var(--color-border)',
                  display: 'flex', gap: '4rem', padding: '3rem', minWidth: '550px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                }}>
                  {item.mega.map((col, ci) => (
                    <div key={ci}>
                      <h4 style={{
                        fontSize: '0.6rem', letterSpacing: '3px', textTransform: 'uppercase',
                        color: 'var(--color-sage)', marginBottom: '1.2rem', fontWeight: 500,
                      }}>{col.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {col.links.map((link, li) => (
                          <Link key={li} to={link.path} style={{
                            fontSize: '0.75rem', color: 'var(--color-text)',
                            whiteSpace: 'nowrap', transition: 'opacity 0.2s', opacity: 0.8,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '0.8' }}
                          >{link.label}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <LanguageSwitcher />
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              fontSize: '0.68rem', letterSpacing: '2px', color: textColor,
              transition: 'color 0.3s, opacity 0.3s', opacity: 0.85,
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
          >
            {t('nav.search')}
          </button>
          <Link to="/account" style={{
            fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase',
            color: textColor, transition: 'color 0.3s, opacity 0.3s', opacity: 0.85,
            border: scrolled ? '0.5px solid var(--color-border)' : '0.5px solid rgba(255,255,255,0.25)',
            padding: '6px 16px', borderRadius: '0',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
          >
            {t('nav.account')}
          </Link>
          <Link to="/cart" style={{
            fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase',
            color: textColor, position: 'relative', transition: 'color 0.3s, opacity 0.3s',
            opacity: 0.85,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.85' }}
          >
            {t('nav.bag', { count: cartCount })}
          </Link>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: scrolled ? '#fff' : 'rgba(255,255,255,0.97)',
              padding: '2.5rem', width: '100%', maxWidth: '600px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                style={{
                  flex: 1, border: 'none', outline: 'none', padding: '14px 0',
                  fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontStyle: 'italic',
                  background: 'transparent', color: 'var(--color-espresso)',
                }}
              />
              <button type="submit" style={{
                border: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: '0.7rem',
                letterSpacing: '3px', textTransform: 'uppercase',
                color: 'var(--color-text-muted)', cursor: 'pointer',
                padding: '14px 0 14px 20px',
              }}>
                Search
              </button>
            </form>
            <p style={{
              fontSize: '0.65rem', color: 'var(--color-text-muted)',
              marginTop: '1rem', letterSpacing: '1px',
            }}>
              Search by product name or description
            </p>
          </div>
        </div>
      )}
    </nav>
  )
}
