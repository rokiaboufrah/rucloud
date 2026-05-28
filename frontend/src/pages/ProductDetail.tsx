import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { productsService } from '../services/products'
import { cartService } from '../services/cart'
import type { ProductDetail as ProductDetailType } from '../types'

export default function ProductDetail() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [openTab, setOpenTab] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true); setOpenTab(null)
    productsService.get(slug).then(p => {
      setProduct(p)
      if (p.sizes.length > 0) setSelectedSize(p.sizes[0].id)
    }).finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return
    try {
      await cartService.add(product.id, selectedSize || undefined)
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e) { console.error(e) }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>{t('product.loading')}</div>
  }
  if (!product) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>{t('product.not_found')}</div>
  }

  const images = product.images
  const hasMultipleSizes = product.sizes.length > 1

  return (
    <div>
      {/* Top bar */}
      <div style={{ padding: '0 3rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <Link to="/shop" style={{ display: 'inline-block', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '1rem 0' }}>
          &larr; {t('shop.back')}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '5rem', padding: '1rem 3rem 4rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {/* ─── GALLERY — vertical stack like merrachi ─── */}
        <div>
          {images.length > 0 ? (
            images.map(img => (
              <div key={img.id} style={{ marginBottom: '0.5rem', background: '#f5f5f5', lineHeight: 0 }}>
                <img src={img.image} alt={product.name}
                  style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))
          ) : (
            <div style={{ aspectRatio: '3/4', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{product.name}</div>
          )}
        </div>

        {/* ─── PRODUCT INFO ─── */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)', height: 'fit-content' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
            {product.category_name}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 300, fontStyle: 'italic', marginBottom: '0.8rem', color: 'var(--color-espresso)',
          }}>
            {product.name}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '1.5rem', fontWeight: 400 }}>
            {t('product.regular_price', { price: parseFloat(product.price).toLocaleString() })}
          </p>

          {product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500 }}>{t('product.size')}</span>
                <button style={{ fontSize: '0.65rem', color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer' }}>{t('product.size_chart')}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(55px, 1fr))', gap: '0.5rem' }}>
                {product.sizes.map(s => (
                  <button key={s.id} onClick={() => setSelectedSize(s.id)}
                    style={{
                      padding: '12px 0', fontSize: '0.75rem', fontFamily: 'var(--font-sans)',
                      border: selectedSize === s.id ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
                      background: selectedSize === s.id ? 'var(--color-text)' : 'transparent',
                      color: selectedSize === s.id ? '#fff' : 'var(--color-text)',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', fontWeight: 500 }}>
                {t('product.colour')} — <span style={{ fontWeight: 400, textTransform: 'none' }}>{product.colors.find(c => c.id === selectedColor)?.name || t('product.select')}</span>
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button key={c.id} onClick={() => setSelectedColor(c.id)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', padding: 0, cursor: 'pointer',
                      background: c.hex_code, border: selectedColor === c.id ? '2px solid var(--color-text)' : '2px solid var(--color-border)',
                      outline: selectedColor === c.id ? '2px solid var(--color-text)' : 'none',
                      outlineOffset: '2px', transition: 'all 0.2s',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          <button onClick={handleAddToCart} className="btn-dark" style={{
            width: '100%', padding: '18px 40px', marginBottom: '2.5rem',
            background: added ? 'var(--color-sage)' : 'var(--color-espresso)',
            fontSize: '0.75rem', letterSpacing: '3px',
          }}>
            {added ? t('product.added') : t('product.add_to_bag')}
          </button>

          {/* ─── ACCORDION ─── */}
          <div style={{ borderTop: '1px solid var(--color-border)' }}>
            {[
              { id: 'description', label: t('product.description'), content: product.description },
              { id: 'fabric', label: t('product.fabric'), content: t('product.fabric_content', { material: product.material, care: product.care_instructions }) },
              { id: 'sizing', label: t('product.sizing'), content: t('product.sizing_content') },
              { id: 'shipping', label: t('product.shipping'), content: t('product.shipping_content') },
            ].map(tab => (
              <div key={tab.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => setOpenTab(openTab === tab.id ? null : tab.id)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1.2rem 0', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'var(--font-sans)', background: 'none', border: 'none',
                    color: 'var(--color-text)', fontWeight: 400,
                  }}>
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '1rem', color: 'var(--color-text-muted)', transition: 'transform 0.2s',
                    transform: openTab === tab.id ? 'rotate(45deg)' : 'none',
                    display: 'inline-block',
                  }}>+</span>
                </button>
                {openTab === tab.id && (
                  <div style={{
                      padding: tab.id === 'description' ? '0.5rem 0 2.5rem' : '0.5rem 0 2rem',
                      fontSize: '0.85rem', lineHeight: 2, color: 'var(--color-text-muted)', whiteSpace: 'pre-line',
                    }}>
                    {tab.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ─── COMPLETE THE LOOK ─── */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem', fontWeight: 500 }}>{t('product.complete_look')}</p>
            <Link to="/shop" style={{ display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '80px', height: '107px', background: '#f5f5f5', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontStyle: 'italic' }}>{t('product.explore_collection')}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t('product.shop_now')}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── CURATED SELECTION ─── */}
      <section style={{ padding: '0 3rem 5rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('product.you_may_also_like')}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-espresso)' }}>{t('product.curated_selection')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {['Shadow Abaya', 'Cloud Set', 'Resilience Dress', 'Noir Pants'].map(name => (
            <Link key={name} to="/shop" className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/4', background: '#f5f5f5', marginBottom: '0.8rem' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.2rem' }}>{name}</p>
                <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>DA 24,000</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
