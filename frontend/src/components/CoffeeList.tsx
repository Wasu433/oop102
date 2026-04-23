import React, { useEffect, useState } from 'react'
import { getCoffees, Coffee } from '../api/coffeeApi'

export default function CoffeeList({ onSelect }: { onSelect?: (c: Coffee) => void }) {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCoffees()
      .then((data) => setCoffees(data))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card">Loading menu...</div>
  if (error) return <div className="card">Error: {error}</div>

  return (
    <div className="card">
      <h3>Menu</h3>
      <div className="list">
        {coffees.map((c) => (
          <div key={c.id} className="coffee">
            <div style={{ fontSize: 24 }}>{c.emoji} {c.name}</div>
            <div>{c.price} ฿</div>
            {onSelect && (
              <button className="button" onClick={() => onSelect(c)}>Add</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
