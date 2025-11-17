import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Custom hook to access authentication context
 * @returns {Object} - Authentication context values
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Hook for protecting routes that require authentication
 * @param {Array} allowedRoles - Array of allowed roles for the route
 * @returns {Object} - Authentication and authorization status
 */
export const useAuthGuard = (allowedRoles = []) => {
  const { user, isAuthenticated, loading } = useAuth()
  
  const hasRequiredRole = !allowedRoles.length || (user && allowedRoles.includes(user.role))
  const canAccess = isAuthenticated && hasRequiredRole
  
  return {
    canAccess,
    isAuthenticated,
    hasRequiredRole,
    user,
    loading
  }
}

/**
 * Hook for managing user permissions
 * @returns {Object} - Permission check functions
 */
export const usePermissions = () => {
  const { user } = useAuth()
  
  const can = {
    // User management permissions
    viewUsers: () => user?.role === 'admin',
    createUsers: () => user?.role === 'admin',
    editUsers: () => user?.role === 'admin',
    deleteUsers: () => user?.role === 'admin',
    
    // Store management permissions
    viewStores: () => true, // All users can view stores
    createStores: () => user?.role === 'admin' || user?.role === 'store_owner',
    editStores: (storeOwnerId) => user?.role === 'admin' || (user?.role === 'store_owner' && user?.id === storeOwnerId),
    deleteStores: () => user?.role === 'admin',
    
    // Rating permissions
    createRatings: () => user?.role === 'user' || user?.role === 'admin',
    editRatings: (ratingUserId) => user?.role === 'admin' || user?.id === ratingUserId,
    deleteRatings: (ratingUserId) => user?.role === 'admin' || user?.id === ratingUserId,
    
    // Dashboard permissions
    viewAdminDashboard: () => user?.role === 'admin',
    viewStoreOwnerDashboard: () => user?.role === 'store_owner',
    viewUserDashboard: () => true,
    
    // General role checks
    isAdmin: () => user?.role === 'admin',
    isStoreOwner: () => user?.role === 'store_owner',
    isRegularUser: () => user?.role === 'user'
  }
  
  return can
}

/**
 * Hook for managing authentication state in forms
 * @returns {Object} - Authentication state for forms
 */
export const useAuthForm = () => {
  const { login, register, updatePassword, loading, error } = useAuth()
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAuthError = (error) => {
    const message = error.response?.data?.error || error.message || 'Authentication failed'
    setFormError(message)
    return message
  }

  const handleAuthSuccess = (message = 'Operation completed successfully') => {
    setSuccess(message)
    setFormError('')
    setTimeout(() => setSuccess(''), 5000)
  }

  const clearMessages = () => {
    setFormError('')
    setSuccess('')
  }

  const executeWithHandling = async (authFunction, ...args) => {
    try {
      clearMessages()
      const result = await authFunction(...args)
      if (result.success) {
        handleAuthSuccess(result.message)
      } else {
        setFormError(result.error)
      }
      return result
    } catch (error) {
      handleAuthError(error)
      return { success: false, error: handleAuthError(error) }
    }
  }

  return {
    login: (...args) => executeWithHandling(login, ...args),
    register: (...args) => executeWithHandling(register, ...args),
    updatePassword: (...args) => executeWithHandling(updatePassword, ...args),
    loading,
    error: formError,
    success,
    clearMessages,
    setFormError
  }
}

export default useAuth