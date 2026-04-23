import React, { useState } from 'react'
import { Coffee, OrderReq, postOrder } from '../api/coffeeApi'

export default function OrderForm({ coffees, onSuccess }: { coffees: Coffee[]; onSuccess?: () => void }) {
  const [items, setItems] = useState<{ coffee_id: string; quantity: number }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addItem(coffee: Coffee) {
    setItems((prev) => [...prev, { coffee_id: coffee.id, quantity: 1 }])
  }

  function updateQty(idx: number, q: number) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // basic validation in handler: items not empty and quantities > 0
    if (items.length === 0) {
      setError('Please add at least one item')
      return
    }
    for (const it of items) {
      if (!it.coffee_id || it.quantity <= 0) {
        setError('Quantity must be greater than 0')
        return
      }
    }
    setSubmitting(true)
    try {
      const req: OrderReq = { items }
      await postOrder(req)
      setItems([])
      if (onSuccess) onSuccess()
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h3>Order Form</h3>
      <div>
        <strong>Menu quick add:</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {coffees.map((c) => (
            <button key={c.id} className="button" onClick={() => addItem(c)}>{c.emoji} {c.name}</button>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <div>{it.coffee_id}</div>
            <input type="number" value={it.quantity} min={1} onChange={(e)=> updateQty(idx, Number(e.target.value))} />
          </div>
        ))}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button className="button" type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  )
}
