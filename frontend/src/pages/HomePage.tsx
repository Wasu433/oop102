import React, { useEffect, useState } from 'react'
import CoffeeList from '../components/CoffeeList'
import OrderForm from '../components/OrderForm'
import OrderSummary from '../components/OrderSummary'
import { getCoffees } from '../api/coffeeApi'

export default function HomePage() {
  const [coffees, setCoffees] = useState([])

  useEffect(() => {
    getCoffees().then(setCoffees).catch(console.error)
  }, [])

  return (
    <div className="container">
      <div className="header">
        <h1>Coffee Shop</h1>
      </div>

      <CoffeeList onSelect={() => {}} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <OrderForm coffees={coffees} onSuccess={() => window.location.reload()} />
        <OrderSummary />
      </div>
    </div>
  )
}
