import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ProductsPage from './pages/ProductsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
