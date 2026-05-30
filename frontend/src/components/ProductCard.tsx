import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link to={`/product/${product.slug}`} className="product-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        aspectRatio: '3/4', background: '#f5f5f5', marginBottom: '1rem',
        overflow: 'hidden', position: 'relative',
      }}>
        {product.primary_image && !imgError ? (
          <>
            <img
              src={product.primary_image}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.6s',
              }}
              className="product-img-primary"
            />
            {product.secondary_image && (
              <img
                src={product.secondary_image}
                alt=""
                onError={() => {}}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  position: 'absolute', top: 0, left: 0, opacity: 0,
                  transition: 'opacity 0.6s',
                }}
                className="product-img-secondary"
              />
            )}
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-muted)', fontSize: '0.75rem',
          }}>
            {product.name}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontStyle: 'italic',
          fontWeight: 300, marginBottom: '0.3rem',
        }}>{product.name}</h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
          DA {parseFloat(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  )
}
