import React, { useState, useEffect } from 'react'
import { Users, MapPin, Star, Phone, Clock, AlertCircle } from 'lucide-react'
import { masterService } from '@/app/services/apiService'
import type { Master } from '@/types'

const MastersPage: React.FC = () => {
  const [masters, setMasters] = useState<Master[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMasters = async () => {
    try {
      setLoading(true)
      const response = await masterService.getAllMasters()
      console.log('Masters response:', response)
      console.log('First master data:', response.data[0])
      setMasters(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch masters')
      console.error('Error fetching masters:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMasters()
  }, [])

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Masters</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage master profiles
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {masters.length} master{masters.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {masters.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No masters</h3>
              <p className="mt-1 text-sm text-gray-500">
                Masters will appear here once they are added to the system.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {masters.map((master) => (
            <div key={master.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">{master.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{master.phone}</span>
                    </div>
                    
                    {master.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {typeof master.location.lat === 'number' 
                            ? master.location.lat.toFixed(4) 
                            : master.location.lat}, 
                          {typeof master.location.lng === 'number' 
                            ? master.location.lng.toFixed(4) 
                            : master.location.lng}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>
                        {typeof master.rating === 'number' 
                          ? master.rating.toFixed(1) 
                          : master.rating}/5.0
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{master.currentOrdersCount}/{master.maxOrdersCount} active orders</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  master.isAvailable 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-red-600 bg-red-100'
                }`}>
                  {master.isAvailable ? 'Available' : 'Busy'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MastersPage
