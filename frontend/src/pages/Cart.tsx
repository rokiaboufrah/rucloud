import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cartService } from '../services/cart'
import type { Cart as CartType } from '../types'

export default function Cart() {
  const { t } = useTranslation()
  const [cart, setCart] = useState<CartType | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCart = () => {
    setLoading(true)
    cartService.get().then(setCart).finally(() => setLoading(false))
  }

  useEffect(() => { loadCart() }, [])

  const handleRemove = async (itemId: number) => {
    await cartService.remove(itemId)
    loadCart()
  }

  const handleQuantity = async (itemId: number, qty: number) => {
    await cartService.update(itemId, qty)
    loadCart()
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>Loading...</div>
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">{t('cart.title')}</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isEmpty ? '1fr' : '1.5fr 1fr', gap: '5rem', padding: '3rem 2rem', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {isEmpty ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('cart.empty')}</p>
            <Link to="/shop" className="btn-primary">{t('cart.start_shopping')}</Link>
          </div>
        ) : (
          <>
            <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
              {cart.items.map(item => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '2rem', padding: '2rem 0', borderBottom: '0.5px solid var(--color-border)' }}>
                  <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden' }}>
                    {item.product_detail?.primary_image && (
                      <img src={item.product_detail.primary_image} alt={item.product_detail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 300, marginBottom: '0.5rem' }}>{item.product_detail?.name || `Product #${item.product}`}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <button onClick={() => handleQuantity(item.id, item.quantity - 1)} style={{ fontSize: '1rem', padding: '2px 8px', border: '0.5px solid var(--color-border)', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.id, item.quantity + 1)} style={{ fontSize: '1rem', padding: '2px 8px', border: '0.5px solid var(--color-border)', cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => handleRemove(item.id)} style={{ fontSize: '0.65rem', letterSpacing: '1px', color: 'var(--color-text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>{t('cart.remove')}</button>
                  </div>
                  <p style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>DA {parseFloat(item.subtotal).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <aside style={{ background: '#faf8f5', padding: '2rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--color-espresso)' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('cart.subtotal')}</span>
                <span>DA {parseFloat(cart.total).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('cart.shipping_label')}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t('cart.shipping_note')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>{t('cart.total')}</span>
                <span>DA {parseFloat(cart.total).toLocaleString()}</span>
              </div>
              <button className="btn-dark" style={{ width: '100%' }}>{t('cart.checkout')}</button>
              <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textDecoration: 'underline' }}>{t('cart.continue_shopping')}</Link>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
