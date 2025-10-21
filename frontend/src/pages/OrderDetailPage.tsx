import React from 'react'
import { useParams } from 'react-router-dom'
import { Package } from 'lucide-react'

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="w-full space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Order ID: {id}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The order you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
