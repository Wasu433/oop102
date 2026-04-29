import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import ApiPage from './pages/ApiPage'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/api"     element={<ApiPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
