import React, { useState, useEffect } from 'react'
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  Star,
  SlidersHorizontal
} from 'lucide-react'

const StoreFilters = ({ 
  filters, 
  onFilterChange, 
  onClose,
  className = '' 
}) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    sorting: false,
    rating: false
  })

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      name: '',
      address: '',
      sortBy: 'name',
      sortOrder: 'asc',
      minRating: 0
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const handleQuickFilter = (type, value) => {
    const newFilters = { ...localFilters }
    
    switch (type) {
      case 'highRated':
        newFilters.minRating = 4
        newFilters.sortBy = 'average_rating'
        newFilters.sortOrder = 'desc'
        break
      case 'newest':
        newFilters.sortBy = 'created_at'
        newFilters.sortOrder = 'desc'
        break
      case 'mostRated':
        newFilters.sortBy = 'total_ratings'
        newFilters.sortOrder = 'desc'
        break
      default:
        break
    }
    
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const hasActiveFilters = 
    localFilters.name || 
    localFilters.address || 
    localFilters.minRating > 0 ||
    localFilters.sortBy !== 'name' ||
    localFilters.sortOrder !== 'asc'

  const sortOptions = [
    { value: 'name', label: 'Store Name', icon: SortAsc },
    { value: 'average_rating', label: 'Rating', icon: Star },
    { value: 'total_ratings', label: 'Most Rated', icon: SortDesc },
    { value: 'created_at', label: 'Newest', icon: SortDesc }
  ]

  const ratingOptions = [
    { value: 0, label: 'Any Rating' },
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 1, label: '1+ Stars' }
  ]

  const quickFilters = [
    {
      key: 'highRated',
      label: 'Highly Rated',
      description: 'Stores with 4+ stars',
      icon: Star,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
    },
    {
      key: 'newest',
      label: 'Newest',
      description: 'Recently added stores',
      icon: SortDesc,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    },
    {
      key: 'mostRated',
      label: 'Most Rated',
      description: 'Popular stores',
      icon: SortAsc,
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    }
  ]

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.key}
                  onClick={() => handleQuickFilter(filter.key)}
                  className={`p-3 border rounded-lg text-left transition-colors duration-200 ${filter.color}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{filter.label}</span>
                  </div>
                  <p className="text-xs opacity-80">{filter.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search Filters */}
        <div>
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Search Filters</h4>
            <div className={`transform transition-transform ${expandedSections.search ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedSections.search && (
            <div className="mt-3 space-y-3">
              {/* Store Name Search */}
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="storeName"
                    type="text"
                    value={localFilters.name || ''}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    placeholder="Search by store name..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Address Search */}
              <div>
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="storeAddress"
                    type="text"
                    value={localFilters.address || ''}
                    onChange={(e) => handleFilterChange('address', e.target.value)}
                    placeholder="Search by location..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Rating Filter</h4>
            <div className={`transform transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedSections.rating && (
            <div className="mt-3">
              <div className="space-y-2">
                {ratingOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={option.value}
                      checked={localFilters.minRating === option.value}
                      onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
                      {option.value > 0 && (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= option.value
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sorting */}
        <div>
          <button
            onClick={() => toggleSection('sorting')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-medium text-gray-900">Sorting</h4>
            <div className={`transform transition-transform ${expandedSections.sorting ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedSections.sorting && (
            <div className="mt-3 space-y-3">
              {/* Sort By */}
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <div className="flex space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="asc"
                      checked={localFilters.sortOrder === 'asc'}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <SortAsc className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Ascending</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sortOrder"
                      value="desc"
                      checked={localFilters.sortOrder === 'desc'}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <SortDesc className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Descending</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {localFilters.name && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  Name: {localFilters.name}
                  <button
                    onClick={() => handleFilterChange('name', '')}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {localFilters.address && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Location: {localFilters.address}
                  <button
                    onClick={() => handleFilterChange('address', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {localFilters.minRating > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Min {localFilters.minRating}+ Stars
                  <button
                    onClick={() => handleFilterChange('minRating', 0)}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {localFilters.sortBy !== 'name' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Sorted by {sortOptions.find(opt => opt.value === localFilters.sortBy)?.label}
                  <button
                    onClick={() => handleFilterChange('sortBy', 'name')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button
          onClick={handleResetFilters}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}

/**
 * Compact filter bar for mobile/compact views
 */
export const CompactStoreFilters = ({ filters, onFilterChange }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const activeFilterCount = [
    filters.name,
    filters.address,
    filters.minRating > 0,
    filters.sortBy !== 'name'
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-x-auto">
            {/* Quick filter buttons */}
            <button
              onClick={() => onFilterChange({ ...filters, minRating: 4, sortBy: 'average_rating', sortOrder: 'desc' })}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors whitespace-nowrap"
            >
              <Star className="h-3 w-3 fill-current" />
              <span>Top Rated</span>
            </button>
            
            <button
              onClick={() => onFilterChange({ ...filters, sortBy: 'created_at', sortOrder: 'desc' })}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              <SortDesc className="h-3 w-3" />
              <span>Newest</span>
            </button>
            
            <button
              onClick={() => onFilterChange({ ...filters, sortBy: 'total_ratings', sortOrder: 'desc' })}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition-colors whitespace-nowrap"
            >
              <SortAsc className="h-3 w-3" />
              <span>Most Rated</span>
            </button>
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-50 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <Filter className="h-3 w-3" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <StoreFilters
              filters={filters}
              onFilterChange={(newFilters) => {
                onFilterChange(newFilters)
                setShowMobileFilters(false)
              }}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreFilters