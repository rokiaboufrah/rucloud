import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { cartService } from '../services/cart'
import { wilayaShippingData, getShippingCost } from '../data/shippingData'
import type { Cart as CartType } from '../types'

function saveShippingPrefs(country: string, wilayaCode: number | null, deliveryType: string) {
  try {
    localStorage.setItem('shipping_prefs', JSON.stringify({ country, wilayaCode, deliveryType }))
  } catch {}
}

export default function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartType | null>(null)
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('DZ')
  const [wilayaCode, setWilayaCode] = useState(16)
  const [deliveryType, setDeliveryType] = useState<'domicile' | 'stop_desk'>('domicile')

  const isAlgeria = country === 'DZ'
  const productTotal = parseFloat(cart?.total || '0')
  const shippingCost = useMemo(() => {
    if (!isAlgeria || !cart) return 0
    return getShippingCost(wilayaCode, deliveryType)
  }, [wilayaCode, deliveryType, isAlgeria, cart])
  const orderTotal = productTotal + shippingCost

  useEffect(() => {
    setLoading(true)
    cartService.get().then(setCart).finally(() => setLoading(false))
  }, [])

  const handleRemove = async (itemId: number) => {
    await cartService.remove(itemId)
    setLoading(true)
    cartService.get().then(setCart).finally(() => setLoading(false))
  }

  const handleQuantity = async (itemId: number, qty: number) => {
    await cartService.update(itemId, qty)
    setLoading(true)
    cartService.get().then(setCart).finally(() => setLoading(false))
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--color-espresso)' }}>{t('checkout.country')}</label>
                <select value={country} onChange={e => {
                  const v = e.target.value
                  setCountry(v)
                  saveShippingPrefs(v, wilayaCode, deliveryType)
                }} style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', cursor: 'pointer', background: '#fff' }}>
                  <option value="DZ">Algeria — DZD</option>
                  <option value="INTL">{t('checkout.country_other')}</option>
                </select>
              </div>

              {isAlgeria && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--color-espresso)' }}>{t('checkout.wilaya')}</label>
                    <select value={wilayaCode} onChange={e => {
                      const v = parseInt(e.target.value, 10)
                      setWilayaCode(v)
                      saveShippingPrefs(country, v, deliveryType)
                    }} style={{ width: '100%', padding: '10px 12px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', cursor: 'pointer', background: '#fff' }}>
                      {wilayaShippingData.map(w => (
                        <option key={w.code} value={w.code}>{w.code} — {w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--color-espresso)' }}>{t('checkout.delivery_type')}</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <input type="radio" checked={deliveryType === 'domicile'} onChange={() => {
                          setDeliveryType('domicile')
                          saveShippingPrefs(country, wilayaCode, 'domicile')
                        }} style={{ accentColor: 'var(--color-espresso)' }} />
                        {t('checkout.domicile')}
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', opacity: getShippingCost(wilayaCode, 'stop_desk') === 0 ? 0.4 : 1 }}>
                        <input type="radio" checked={deliveryType === 'stop_desk'} onChange={() => {
                          setDeliveryType('stop_desk')
                          saveShippingPrefs(country, wilayaCode, 'stop_desk')
                        }} disabled={getShippingCost(wilayaCode, 'stop_desk') === 0} style={{ accentColor: 'var(--color-espresso)' }} />
                        {t('checkout.stop_desk')}
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('checkout.product_total')}</span>
                <span>DA {productTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('checkout.shipping_cost')}</span>
                <span style={{ fontSize: '0.7rem' }}>
                  {isAlgeria
                    ? (shippingCost === 0 ? t('checkout.shipping_free') : `DA ${shippingCost.toLocaleString()}`)
                    : t('cart.shipping_note')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>{t('checkout.shipping_total')}</span>
                <span>DA {(isAlgeria ? orderTotal : productTotal).toLocaleString()}</span>
              </div>
              <button className="btn-dark" style={{ width: '100%' }} onClick={() => navigate('/account')}>{t('cart.checkout')}</button>
              <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textDecoration: 'underline' }}>{t('cart.continue_shopping')}</Link>
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
