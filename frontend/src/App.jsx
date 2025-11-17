import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Stores from './pages/stores/Stores'
import StoreDetail from './pages/stores/StoreDetail'
import MyRatings from './pages/ratings/MyRatings'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import StoreOwnerDashboard from './pages/dashboard/StoreOwnerDashboard'
import UserProfile from './pages/dashboard/UserProfile'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
      <div className='wrapper'>
        <div className=" min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
              
              {/* Protected Routes */}
              <Route path="/my-ratings" element={
                <ProtectedRoute>
                  <MyRatings />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/store-owner/dashboard" element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
      </Router>
    </AuthProvider>
  )
}

export default App