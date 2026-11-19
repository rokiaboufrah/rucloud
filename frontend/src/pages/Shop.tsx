import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productsService } from '../services/products'
import type { Product } from '../types'

const categorySlugs = ['all', 'abayas', 'sets', 'dresses', 'tops', 'pants', 'scarves', 'accessories']

export default function Shop() {
  const { t } = useTranslation()
  const categoryLabels = [
    t('shop.filter_all'), t('nav.mega.abayas'), t('nav.mega.sets'), t('nav.mega.dresses'),
    t('nav.mega.tops'), t('nav.mega.pants'), t('nav.mega.scarves'), t('nav.mega.accessories'),
  ]
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('q') || ''
  const featured = searchParams.get('featured') || ''
  const [products, setProducts] = useState<Product[]>([])
  const requestKey = `${activeCategory}|${searchQuery}|${featured}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loading = loadedKey !== requestKey

  useEffect(() => {
    let active = true
    const params: { category?: string; q?: string; featured?: string } = {}
    if (activeCategory !== 'all') params.category = activeCategory
    if (searchQuery) params.q = searchQuery
    if (featured) params.featured = featured
    productsService.list(params)
      .then(result => {
        if (!active) return
        setProducts(result)
        setLoadedKey(requestKey)
      })
      .catch(() => {
        if (!active) return
        setProducts([])
        setLoadedKey(requestKey)
      })
    return () => { active = false }
  }, [activeCategory, searchQuery, featured, requestKey])

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{searchQuery ? t('shop.search_results_for', { query: searchQuery }) : t('shop.the_collection')}</div>
        <h1 className="page-title">{searchQuery ? `"${searchQuery}"` : t('shop.title')}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', padding: '3rem 2rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <aside>
          {categoryLabels.map((label, i) => {
            const slug = categorySlugs[i]
            const param = slug === 'all' ? '' : `?category=${slug}`
            return (
              <Link key={slug} to={`/shop${param}`} style={{
                display: 'block', fontSize: '0.75rem', padding: '0.6rem 0',
                color: slug === activeCategory ? 'var(--color-accent)' : 'var(--color-text-muted)',
                borderBottom: '0.5px solid var(--color-border)',
                fontWeight: slug === activeCategory ? 500 : 300,
              }}>
                {label}
              </Link>
            )
          })}
        </aside>

        <main>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 0' }}>{t('common.loading')}</p>
          ) : products.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 0' }}>{t('shop.no_products')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
              {(products || []).map(p => (
                <Link key={p.slug} to={`/product/${p.slug}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ aspectRatio: '3/4', background: '#f5f5f5', marginBottom: '1rem', overflow: 'hidden', position: 'relative' }}>
                    {p.primary_image ? (
                      <>
                        <img src={p.primary_image} alt={p.name} className="product-img-primary"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }} />
                        {p.secondary_image && (
                          <img src={p.secondary_image} alt="" className="product-img-secondary"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, opacity: 0, transition: 'opacity 0.6s' }} />
                        )}
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        {p.name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 300, marginBottom: '0.3rem' }}>{p.name}</h3>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>DA {parseFloat(p.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
