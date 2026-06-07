import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { accountsService } from '../services/accounts'
import { cartService } from '../services/cart'
import { ordersService } from '../services/orders'
import { wilayaShippingData, getShippingCost } from '../data/shippingData'
import type { User, Cart as CartType, Order, CCPConfig, BaridiMobConfig } from '../types'

export default function Account() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    accountsService.me().then(setUser).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    try {
      const u = await accountsService.login(data.get('username') as string, data.get('password') as string)
      setUser(u)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    const payload = {
      username: data.get('username') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
      password2: data.get('password') as string,
    }
    try {
      await accountsService.register(payload)
      const u = await accountsService.login(payload.username, payload.password)
      setUser(u)
    } catch (err: any) {
      setError(err?.response?.data?.message?.[0] || err?.response?.data?.error || 'Registration failed')
    }
  }

  const handleLogout = async () => {
    await accountsService.logout()
    setUser(null)
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>Loading...</div>
  }

  if (user) {
    return <LoggedInView user={user} onLogout={handleLogout} />
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">Welcome</div>
        <h1 className="page-title">{isRegister ? t('account.register_title') : t('account.login_btn')}</h1>
      </header>

      <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '0 2rem' }}>
        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('account.register_name')}</label>
                <input name="username" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('account.register_email')}</label>
                <input name="email" type="email" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
              </div>
            </>
          )}
          {!isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('account.login_email')}</label>
              <input name="username" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{isRegister ? t('account.register_password') : t('account.login_password')}</label>
            <input name="password" type="password" required style={{ width: '100%', padding: '12px 15px', border: '0.5px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem' }} />
          </div>
          <button type="submit" className="btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isRegister ? t('account.register_btn') : t('account.login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {isRegister ? (
            <>Already have an account? <button onClick={() => setIsRegister(false)} style={{ textDecoration: 'underline', color: 'var(--color-accent)', fontSize: '0.8rem' }}>Sign in</button></>
          ) : (
            <>Don't have an account? <button onClick={() => setIsRegister(true)} style={{ textDecoration: 'underline', color: 'var(--color-accent)', fontSize: '0.8rem' }}>Register</button></>
          )}
        </p>
      </div>
    </div>
  )
}

function LoggedInView({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { t } = useTranslation()
  const [cart, setCart] = useState<CartType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ccpConfig, setCcpConfig] = useState<CCPConfig | null>(null)
  const [baridiConfig, setBaridiConfig] = useState<BaridiMobConfig | null>(null)
  const [cartLoading, setCartLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    Promise.all([
      cartService.get().then(setCart).catch(() => setCart(null)),
      ordersService.list().then(setOrders).catch(() => setOrders([])),
      ordersService.getPaymentConfig().then(c => { setCcpConfig(c.ccp); setBaridiConfig(c.baridimob) }).catch(() => {}),
    ]).finally(() => setCartLoading(false))
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    try {
      const order = await ordersService.create({
        full_name: data.get('full_name') as string,
        email: data.get('email') as string,
        phone: data.get('phone') as string,
        address: data.get('address') as string,
        city: data.get('city') as string,
        wilaya_code: parseInt(data.get('wilaya_code') as string, 10) || undefined,
        delivery_type: (data.get('delivery_type') as string) || 'domicile',
        shipping_cost: parseFloat(data.get('shipping_cost') as string) || 0,
        country: data.get('country') as string,
        payment_method: data.get('payment_method') as string || 'cod',
        ccp_ref: (data.get('ccp_ref') as string) || '',
        notes: (data.get('notes') as string) || '',
      })
      setCreatedOrder(order)
      setCart(null)
      setOrders(prev => [order, ...prev])
    } catch (err: any) {
      setFormError(err?.response?.data?.error || err?.response?.data?.message?.[0] || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  if (cartLoading) {
    return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--color-text-muted)' }}>Loading...</div>
  }

  if (createdOrder) {
    return <OrderSuccess order={createdOrder} ccpConfig={ccpConfig} baridiConfig={baridiConfig} onBack={() => setCreatedOrder(null)} />
  }

  const hasCartItems = cart && cart.items.length > 0

  return (
    <div>
      <header className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-eyebrow">{t('account.profile')}</div>
        <h1 className="page-title">My Account</h1>
      </header>

      <div style={{ background: '#faf8f5', borderTop: '0.5px solid var(--color-border)', borderBottom: '0.5px solid var(--color-border)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontStyle: 'italic', marginBottom: '0.15rem' }}>Hello, {user.username}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
          </div>
          <button onClick={onLogout} className="btn-primary">{t('account.logout')}</button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        {hasCartItems ? (
          <CheckoutForm
            cart={cart}
            ccpConfig={ccpConfig}
            baridiConfig={baridiConfig}
            onSubmit={handleCheckout}
            submitting={submitting}
            error={formError}
            user={user}
          />
        ) : (
          <OrderHistory orders={orders} />
        )}
      </div>
    </div>
  )
}

function CheckoutForm({
  cart, ccpConfig, baridiConfig, onSubmit, submitting, error, user,
}: {
  cart: CartType; ccpConfig: CCPConfig | null; baridiConfig: BaridiMobConfig | null
  onSubmit: (e: React.FormEvent) => Promise<void>; submitting: boolean; error: string; user: User
}) {
  const { t } = useTranslation()
  const [country, setCountry] = useState('DZ')
  const [wilayaCode, setWilayaCode] = useState(16)
  const [deliveryType, setDeliveryType] = useState<'domicile' | 'stop_desk'>('domicile')
  const isAlgeria = country === 'DZ'

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shipping_prefs')
      if (saved) {
        const prefs = JSON.parse(saved)
        if (prefs.country) setCountry(prefs.country)
        if (prefs.wilayaCode) setWilayaCode(prefs.wilayaCode)
        if (prefs.deliveryType) setDeliveryType(prefs.deliveryType)
      }
    } catch {}
  }, [])
  const dzMethods = ['cod', 'baridimob', 'ccp', 'bank_transfer']
  const intlMethods = ['stripe', 'paypal', 'card']
  const [method, setMethod] = useState('cod')

  const shippingCost = useMemo(() => {
    if (!isAlgeria) return 0
    return getShippingCost(wilayaCode, deliveryType)
  }, [wilayaCode, deliveryType, isAlgeria])

  const productTotal = parseFloat(cart.total)
  const orderTotal = productTotal + shippingCost

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value
    setCountry(newCountry)
    if (newCountry === 'DZ') {
      setMethod('cod')
    } else {
      setMethod('stripe')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
          {t('checkout.shipping_title')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input name="full_name" label={t('checkout.full_name')} defaultValue={user.username} required />
          <Input name="email" label={t('checkout.email')} type="email" defaultValue={user.email} required />
          <Input name="phone" label={t('checkout.phone')} defaultValue={user.profile?.phone || ''} required />
          <Input name="address" label={t('checkout.address')} defaultValue={user.profile?.address || ''} required />

          {isAlgeria && (
            <>
              <div>
                <label style={labelStyle}>{t('checkout.wilaya')}</label>
                <select name="wilaya_code" value={wilayaCode} onChange={e => setWilayaCode(parseInt(e.target.value, 10))}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
                  <option value="" disabled>{t('checkout.wilaya_placeholder')}</option>
                  {wilayaShippingData.map(w => (
                    <option key={w.code} value={w.code}>{w.code} — {w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>{t('checkout.delivery_type')}</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="radio" name="delivery_type" value="domicile" checked={deliveryType === 'domicile'} onChange={() => setDeliveryType('domicile')} style={{ accentColor: 'var(--color-espresso)' }} />
                    {t('checkout.domicile')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', opacity: getShippingCost(wilayaCode, 'stop_desk') === 0 ? 0.4 : 1 }}>
                    <input type="radio" name="delivery_type" value="stop_desk" checked={deliveryType === 'stop_desk'} onChange={() => setDeliveryType('stop_desk')} disabled={getShippingCost(wilayaCode, 'stop_desk') === 0} style={{ accentColor: 'var(--color-espresso)' }} />
                    {t('checkout.stop_desk')}
                  </label>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input name="city" label={t('checkout.city')} defaultValue={user.profile?.city || ''} required />
            <div>
              <label style={labelStyle}>{t('checkout.country')}</label>
              <select name="country" value={country} onChange={handleCountryChange}
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
                <option value="DZ">Algeria — DZD</option>
                <option value="FR">France — EUR</option>
                <option value="CA">Canada — CAD</option>
                <option value="US">United States — USD</option>
                <option value="GB">United Kingdom — GBP</option>
                <option value="DE">Germany — EUR</option>
                <option value="IT">Italy — EUR</option>
                <option value="ES">Spain — EUR</option>
                <option value="BE">Belgium — EUR</option>
                <option value="NL">Netherlands — EUR</option>
                <option value="TN">Tunisia — TND</option>
                <option value="MA">Morocco — MAD</option>
                <option value="AE">UAE — AED</option>
                <option value="SA">Saudi Arabia — SAR</option>
                <option value="QA">Qatar — QAR</option>
                <option value="OTHER">{t('checkout.country_other')}</option>
              </select>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                {t('checkout.country_select')}
              </p>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('checkout.notes')}</label>
            <textarea name="notes" rows={3} style={inputStyle} />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
          {isAlgeria ? t('checkout.dz_payment_title') : t('checkout.intl_payment_title')}
        </h3>

        {!isAlgeria && (
          <div style={{ background: '#fff3cd', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', lineHeight: 1.6, color: '#664d03' }}>
            {t('checkout.intl_unavailable')}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {(isAlgeria ? dzMethods : intlMethods).map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: method === m ? '0.5px solid var(--color-espresso)' : '0.5px solid var(--color-border)', cursor: 'pointer', background: method === m ? '#faf8f5' : 'transparent', opacity: !isAlgeria ? 0.5 : 1 }}>
              <input type="radio" name="payment_method" value={m} checked={method === m} onChange={() => setMethod(m)} disabled={!isAlgeria} style={{ accentColor: 'var(--color-espresso)' }} />
              <span style={{ fontSize: '0.85rem' }}>{t(`checkout.payment_${m}`)}</span>
            </label>
          ))}
        </div>

        {isAlgeria && method === 'cod' && (
          <div style={{ background: '#faf8f5', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            {t('checkout.cod_info')}
          </div>
        )}

        {isAlgeria && method === 'baridimob' && baridiConfig && (
          <div style={{ background: '#faf8f5', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '1rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              {t('checkout.baridimob_instructions')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Row label={t('checkout.baridimob_phone')} value={baridiConfig.phone} />
              <Row label={t('checkout.ccp_account_holder')} value={baridiConfig.name} />
              <Row label={t('checkout.product_total')} value={`DA ${productTotal.toLocaleString()}`} />
              <Row label={t('checkout.shipping_cost')} value={shippingCost === 0 ? t('checkout.shipping_free') : `DA ${shippingCost.toLocaleString()}`} />
              <Row label={t('checkout.shipping_total')} value={`DA ${orderTotal.toLocaleString()}`} />
            </div>
          </div>
        )}

        {isAlgeria && method === 'ccp' && ccpConfig && (
          <div style={{ background: '#faf8f5', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '1rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              {t('checkout.ccp_instructions')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Row label={t('checkout.ccp_account_holder')} value={ccpConfig.account_holder} />
              <Row label={t('checkout.ccp_account_number')} value={ccpConfig.account_number} />
              <Row label={t('checkout.ccp_cle')} value={ccpConfig.cle} />
              <Row label={t('checkout.ccp_bank')} value={ccpConfig.bank} />
              <Row label={t('checkout.product_total')} value={`DA ${productTotal.toLocaleString()}`} />
              <Row label={t('checkout.shipping_cost')} value={shippingCost === 0 ? t('checkout.shipping_free') : `DA ${shippingCost.toLocaleString()}`} />
              <Row label={t('checkout.shipping_total')} value={`DA ${orderTotal.toLocaleString()}`} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>{t('checkout.ccp_ref_label')}</label>
              <input name="ccp_ref" style={inputStyle} placeholder={t('checkout.ccp_ref_placeholder')} />
            </div>
          </div>
        )}

        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

        <input type="hidden" name="shipping_cost" value={shippingCost} />

        <div style={{ background: '#faf8f5', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('checkout.product_total')}</span>
            <span>{isAlgeria ? 'DA' : 'EUR/USD'} {productTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t('checkout.shipping_cost')}</span>
            <span style={{ fontSize: '0.7rem' }}>
              {isAlgeria
                ? (shippingCost === 0 ? t('checkout.shipping_free') : `DA ${shippingCost.toLocaleString()}`)
                : t('cart.shipping_note')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--color-border)', paddingTop: '0.75rem', fontWeight: 500 }}>
            <span>{t('checkout.shipping_total')}</span>
            <span>{isAlgeria ? 'DA' : 'EUR/USD'} {(isAlgeria ? orderTotal : productTotal).toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" disabled={submitting || !isAlgeria || (isAlgeria && wilayaCode === 0)} className="btn-dark" style={{ width: '100%', opacity: !isAlgeria ? 0.5 : 1 }}>
          {submitting ? 'Processing...' : t('checkout.place_order')}
        </button>
      </div>
    </form>
  )
}

function OrderSuccess({ order, ccpConfig, baridiConfig, onBack }: { order: Order; ccpConfig: CCPConfig | null; baridiConfig: BaridiMobConfig | null; onBack: () => void }) {
  const { t } = useTranslation()

  return (
    <div>
      <header className="page-header">
        <div className="page-eyebrow">{t('checkout.order_placed')}</div>
        <h1 className="page-title">{t('checkout.order_success')}</h1>
      </header>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ background: '#faf8f5', padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Order #{order.id}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Total: DA {parseFloat(order.total).toLocaleString()}
          </p>
          {order.delivery_type && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {order.delivery_type === 'domicile' ? t('checkout.domicile') : t('checkout.stop_desk')}
              {order.wilaya_code ? ` · Wilaya ${order.wilaya_code}` : ''}
            </p>
          )}
        </div>

        {order.payment_method === 'cod' && (
          <div style={{ background: '#faf8f5', padding: '2rem', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            {t('checkout.cod_info')}
          </div>
        )}

        <div style={{ background: '#faf8f5', padding: '1rem 1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <Row label={t('checkout.product_total')} value={`DA ${(parseFloat(order.total) - parseFloat(order.shipping_cost || '0')).toLocaleString()}`} />
          <div style={{ height: '0.5rem' }} />
          <Row label={t('checkout.shipping_cost')} value={parseFloat(order.shipping_cost || '0') === 0 ? t('checkout.shipping_free') : `DA ${parseFloat(order.shipping_cost).toLocaleString()}`} />
          <div style={{ borderTop: '0.5px solid var(--color-border)', margin: '0.5rem 0' }} />
          <Row label={t('checkout.shipping_total')} value={`DA ${parseFloat(order.total).toLocaleString()}`} />
        </div>

        {order.payment_method === 'baridimob' && baridiConfig && (
          <div style={{ background: '#faf8f5', padding: '2rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{t('checkout.baridimob_instructions')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Row label={t('checkout.baridimob_phone')} value={baridiConfig.phone} />
              <Row label={t('checkout.ccp_account_holder')} value={baridiConfig.name} />
              <Row label={t('checkout.product_total')} value={`DA ${(parseFloat(order.total) - parseFloat(order.shipping_cost || '0')).toLocaleString()}`} />
              <Row label={t('checkout.shipping_cost')} value={parseFloat(order.shipping_cost || '0') === 0 ? t('checkout.shipping_free') : `DA ${parseFloat(order.shipping_cost).toLocaleString()}`} />
              <Row label={t('checkout.shipping_total')} value={`DA ${parseFloat(order.total).toLocaleString()}`} />
            </div>
          </div>
        )}

        {order.payment_method === 'ccp' && ccpConfig && (
          <div style={{ background: '#faf8f5', padding: '2rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{t('checkout.ccp_instructions')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Row label={t('checkout.ccp_account_holder')} value={ccpConfig.account_holder} />
              <Row label={t('checkout.ccp_account_number')} value={ccpConfig.account_number} />
              <Row label={t('checkout.ccp_cle')} value={ccpConfig.cle} />
              <Row label={t('checkout.ccp_bank')} value={ccpConfig.bank} />
              <Row label={t('checkout.product_total')} value={`DA ${(parseFloat(order.total) - parseFloat(order.shipping_cost || '0')).toLocaleString()}`} />
              <Row label={t('checkout.shipping_cost')} value={parseFloat(order.shipping_cost || '0') === 0 ? t('checkout.shipping_free') : `DA ${parseFloat(order.shipping_cost).toLocaleString()}`} />
              <Row label={t('checkout.shipping_total')} value={`DA ${parseFloat(order.total).toLocaleString()}`} />
            </div>
          </div>
        )}

        <button onClick={onBack} className="btn-primary" style={{ width: '100%' }}>
          {t('checkout.view_orders')}
        </button>
      </div>
    </div>
  )
}

function OrderHistory({ orders }: { orders: Order[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
        {t('account.orders')}
      </h3>
      {orders.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('account.no_orders')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#faf8f5' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontStyle: 'italic' }}>
                  Order #{o.id}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {new Date(o.created_at).toLocaleDateString()} &middot; {o.items?.length || 0} items
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>DA {parseFloat(o.total).toLocaleString()}</p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.6rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  background: o.payment_status === 'paid' ? '#d1e7dd' : o.payment_status === 'failed' ? '#f8d7da' : '#fff3cd',
                  color: o.payment_status === 'paid' ? '#0f5132' : o.payment_status === 'failed' ? '#842029' : '#664d03',
                  marginTop: '0.25rem',
                }}>
                  {o.payment_status === 'paid' ? t('checkout.payment_paid') : t('checkout.payment_pending')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Input({ name, label, type = 'text', defaultValue, required, disabled }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required} disabled={disabled}
        style={{ ...inputStyle, ...(disabled ? { background: '#f5f5f5', cursor: 'not-allowed', opacity: 0.6 } : {}) }} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
  color: 'var(--color-espresso)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 15px',
  border: '0.5px solid var(--color-border)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.8rem',
  background: '#fff',
  boxSizing: 'border-box',
}
