import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for making API calls with loading and error states
 * @param {Function} apiCall - The API call function
 * @param {boolean} immediate - Whether to call the API immediately
 * @returns {Object} - The state and functions for the API call
 */
const useApi = (apiCall, immediate = false) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall(...params)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError
  }
}

/**
 * Hook for paginated API calls
 * @param {Function} apiCall - The API call function
 * @param {Object} initialParams - Initial parameters for the API call
 * @returns {Object} - Pagination state and functions
 */
export const usePaginatedApi = (apiCall, initialParams = {}) => {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const loadData = useCallback(async (page = 1, newParams = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const allParams = { ...params, ...newParams, page, limit: pagination.limit }
      const result = await apiCall(allParams)
      
      if (page === 1) {
        setData(result.data || result.items || [])
      } else {
        setData(prev => [...prev, ...(result.data || result.items || [])])
      }

      setPagination(prev => ({
        ...prev,
        page,
        total: result.total || result.count || 0,
        totalPages: result.totalPages || Math.ceil((result.total || 0) / pagination.limit),
        hasNext: page < (result.totalPages || Math.ceil((result.total || 0) / pagination.limit)),
        hasPrev: page > 1
      }))

      setParams(prev => ({ ...prev, ...newParams }))
      
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, params, pagination.limit])

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      return loadData(pagination.page + 1)
    }
  }, [pagination.hasNext, pagination.page, loadData])

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      return loadData(pagination.page - 1)
    }
  }, [pagination.hasPrev, pagination.page, loadData])

  const goToPage = useCallback((page) => {
    return loadData(page)
  }, [loadData])

  const refresh = useCallback(() => {
    return loadData(1)
  }, [loadData])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
    return loadData(1, newParams)
  }, [loadData])

  const setLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }, [])

  const reset = useCallback(() => {
    setData([])
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    })
    setParams(initialParams)
    setError(null)
  }, [initialParams])

  useEffect(() => {
    loadData(1)
  }, [pagination.limit])

  return {
    data,
    pagination,
    loading,
    error,
    params,
    loadData,
    nextPage,
    prevPage,
    goToPage,
    refresh,
    updateParams,
    setLimit,
    reset,
    setData
  }
}

/**
 * Hook for infinite scroll pagination
 * @param {Function} apiCall - The API call function
 * @param {Object} initialParams - Initial parameters
 * @returns {Object} - Infinite scroll state and functions
 */
export const useInfiniteScroll = (apiCall, initialParams = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [params, setParams] = useState(initialParams)

  const loadMore = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return

    try {
      setLoading(true)
      setError(null)
      
      const currentPage = reset ? 1 : page
      const result = await apiCall({ ...params, page: currentPage })
      const newItems = result.data || result.items || []

      if (reset) {
        setData(newItems)
      } else {
        setData(prev => [...prev, ...newItems])
      }

      setHasMore(newItems.length > 0 && (result.hasNext !== undefined ? result.hasNext : currentPage < (result.totalPages || 10)))
      setPage(reset ? 2 : currentPage + 1)
      
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, loading, hasMore, page, params])

  const refresh = useCallback(() => {
    return loadMore(true)
  }, [loadMore])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
    setPage(1)
    setHasMore(true)
    return loadMore(true)
  }, [loadMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setParams(initialParams)
    setError(null)
  }, [initialParams])

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateParams,
    reset
  }
}

export default useApi