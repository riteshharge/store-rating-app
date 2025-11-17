import { useState, useEffect, useCallback } from 'react'

/**
 * Safely parse JSON or return a fallback value.
 */
const parseJSON = (value, fallback) => {
  try {
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      return JSON.parse(value)
    }
    return value
  } catch {
    return fallback
  }
}

/**
 * Core hook to manage localStorage state in sync with React.
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      if (item === null || item === 'null' || item === 'undefined') {
        window.localStorage.removeItem(key)
        return initialValue
      }
      return parseJSON(item, initialValue)
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  /**
   * Set value in both React state and localStorage.
   */
  const setValue = useCallback(
    (value) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        try {
          if (valueToStore === null || valueToStore === undefined) {
            window.localStorage.removeItem(key)
          } else if (typeof valueToStore === 'string') {
            window.localStorage.setItem(key, valueToStore)
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
          }
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error)
        }
      }
    },
    [key, storedValue]
  )

  /**
   * Remove value from localStorage and reset to initialValue.
   */
  const removeValue = useCallback(() => {
    setStoredValue(initialValue)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Token-specific hook for managing access & refresh tokens.
 */
export const useTokenStorage = () => {
  const [token, setToken, removeToken] = useLocalStorage('token', null)
  const [refreshToken, setRefreshToken, removeRefreshToken] = useLocalStorage('refresh_token', null)

  /**
   * Set both tokens at once.
   */
  const setTokens = useCallback(
    (newToken, newRefreshToken = null) => {
      setToken(newToken)
      if (newRefreshToken) setRefreshToken(newRefreshToken)
    },
    [setToken, setRefreshToken]
  )

  /**
   * Remove both tokens.
   */
  const removeTokens = useCallback(() => {
    removeToken()
    removeRefreshToken()
  }, [removeToken, removeRefreshToken])

  /**
   * Check if token is valid (not expired).
   */
  const isValidToken = useCallback(() => {
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }, [token])

  /**
   * Get token payload (decoded JWT body).
   */
  const getTokenPayload = useCallback(() => {
    if (!token) return null
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }, [token])

  return {
    token,
    refreshToken,
    setToken,
    setRefreshToken,
    setTokens,
    removeToken,
    removeRefreshToken,
    removeTokens,
    isValidToken,
    getTokenPayload
  }
}

export default useLocalStorage