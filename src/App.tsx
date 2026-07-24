import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { SplashGate } from './components/SplashGate'
import { SplashPage } from './pages/SplashPage'
import { HomePage } from './pages/HomePage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ProductListPage } from './pages/ProductListPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { SearchPage } from './pages/SearchPage'
import { BagPage } from './pages/BagPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { AccountPage } from './pages/AccountPage'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <SplashGate>
          <Routes>
            <Route path="/" element={<SplashPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products/:categoryId" element={<ProductListPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bag" element={<BagPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SplashGate>
      </BrowserRouter>
    </CartProvider>
  )
}
