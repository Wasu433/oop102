import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { CarListPage } from './pages/CarListPage'
import { CarDetailPage } from './pages/CarDetailPage'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Coffee Shop */}
        <Route path="/" element={<HomePage />} />
        
        {/* Car Marketplace */}
        <Route path="/cars" element={<CarListPage />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        
        {/* Redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
