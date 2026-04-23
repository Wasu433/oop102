import React, { useEffect, useState } from 'react'
import { getOrders, getSummary } from '../api/coffeeApi'

export default function OrderSummary() {
  const [orders, setOrders] = useState<any[]>([])
  const [summary, setSummary] = useState<{ total_orders: number; total_revenue: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOrders(), getSummary()])
      .then(([o, s]) => {
        setOrders(o)
        setSummary(s)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card">Loading orders...</div>

  return (
    <div className="card">
      <h3>Order Summary</h3>
      {summary && (
        <div>
          <div>Total orders: {summary.total_orders}</div>
          <div>Total revenue: {summary.total_revenue}</div>
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        <strong>Recent Orders</strong>
        {orders.length === 0 && <div>No orders</div>}
        {orders.map((o) => (
          <div key={o.id} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
            <div>{o.id} — {o.status} — {o.total} ฿</div>
            <div>
              {o.items.map((it: any, idx: number) => (
                <div key={idx}>{it.coffee.name} x{it.quantity}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
