import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Store, Grid, List } from 'lucide-react'
import StoreCard from '../../components/stores/StoreCard'
import StoreFilters from '../../components/stores/StoreFilters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { storeService } from '../../services/storeService'
import { useAuth } from '../../contexts/AuthContext'

const Stores = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const { isAdmin } = useAuth()

  useEffect(() => {
    loadStores()
  }, [filters])

  const loadStores = async () => {
    try {
      setLoading(true)
      const response = await storeService.getAllStores(filters)
      setStores(response.stores || [])
    } catch (err) {
      setError('Failed to load stores. Please try again later.')
      console.error('Error loading stores:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({
      ...prev,
      name: searchTerm
    }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      name: '',
      address: '',
      sortBy: 'name',
      sortOrder: 'asc'
    })
    setSearchTerm('')
  }

  const filteredStores = stores.filter(store => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      store.name.toLowerCase().includes(term) ||
      store.address.toLowerCase().includes(term) ||
      store.owner_name?.toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Stores</h1>
          <p className="text-gray-600 mt-1">
            Discover and rate your favorite stores
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link
              to="/admin/create-store"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Store</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search stores by name, address, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-primary-50 border-primary-300 text-primary-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.name || filters.address) && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.name && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                Name: {filters.name}
              </span>
            )}
            {filters.address && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                Address: {filters.address}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <StoreFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadStores}
              className="text-red-700 hover:text-red-800 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Stores Grid/List */}
      {filteredStores.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredStores.map((store) => (
            <StoreCard 
              key={store.id} 
              store={store} 
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stores found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.name || filters.address 
              ? 'Try adjusting your search criteria or filters'
              : 'There are no stores available at the moment'
            }
          </p>
          {(filters.name || filters.address) && (
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      )}

      {/* Load More (for pagination) */}
      {stores.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={loadStores}
            className="btn-secondary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Stores