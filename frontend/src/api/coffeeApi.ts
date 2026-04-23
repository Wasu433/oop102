export type Coffee = { id: string; name: string; price: number; emoji?: string }
export type OrderItemReq = { coffee_id: string; quantity: number }
export type OrderReq = { items: OrderItemReq[] }

const base = '/api'

export async function getCoffees(): Promise<Coffee[]> {
  const res = await fetch(`${base}/coffees`)
  if (!res.ok) throw new Error('Failed to fetch coffees')
  return res.json()
}

export async function postOrder(body: OrderReq) {
  const res = await fetch(`${base}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Order failed')
  }
  return res.json()
}

export async function getOrders() {
  const res = await fetch(`${base}/orders`)
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function getSummary() {
  const res = await fetch(`${base}/summary`)
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}
