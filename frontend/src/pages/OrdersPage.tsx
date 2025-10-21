import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  Plus, 
  MapPin, 
  User, 
  Camera, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Upload
} from 'lucide-react'
import { orderService } from '@/app/services/apiService'
import type { Order, OrderStatus } from '@/types'

interface OrderCardProps {
  order: Order
  onUpdate: () => void
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null)

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'assigned': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-purple-600 bg-purple-100'
      case 'completed': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'assigned': return <User className="h-4 w-4" />
      case 'in_progress': return <Camera className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleAssignMaster = async () => {
    try {
      await orderService.assignMaster(order.id, 50) // 50km max distance
      onUpdate()
    } catch (error) {
      console.error('Failed to assign master:', error)
      alert('Failed to assign master. Please try again.')
    }
  }

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      handleUploadADL(file)
    }
  }

  const handleUploadADL = async (file: File) => {
    setIsUploading(true)
    try {
      await orderService.uploadADL(order.id, file)
      onUpdate()
      alert('ADL uploaded successfully!')
    } catch (error) {
      console.error('Failed to upload ADL:', error)
      alert('Failed to upload ADL. Please ensure the file contains GPS data and is recent.')
    } finally {
      setIsUploading(false)
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  const handleCompleteOrder = async () => {
    try {
      await orderService.completeOrder(order.id)
      onUpdate()
      alert('Order completed successfully!')
    } catch (error) {
      console.error('Failed to complete order:', error)
      alert('Failed to complete order. Please ensure ADL files are uploaded.')
    }
  }

  const triggerFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.onchange = handleFileSelect
    setFileInput(input)
    input.click()
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Order #{order.id.slice(0, 8)}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status.replace('_', ' ')}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{order.customerName} - {order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{order.address}</span>
            </div>
            {order.description && (
              <p className="text-gray-500">{order.description}</p>
            )}
            {order.assignedMaster && (
              <div className="flex items-center gap-2 text-blue-600">
                <User className="h-4 w-4" />
                <span>Assigned to: {order.assignedMaster.name}</span>
              </div>
            )}
            {order.adlFiles && order.adlFiles.length > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <Camera className="h-4 w-4" />
                <span>{order.adlFiles.length} ADL file(s) uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={handleAssignMaster}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <User className="h-4 w-4" />
            Assign Master
          </button>
        )}
        
        {(order.status === 'assigned' || order.status === 'in_progress') && (
          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload ADL'}
          </button>
        )}
        
        {(order.status === 'assigned' || order.status === 'in_progress') && (
          <button
            onClick={handleCompleteOrder}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Complete Order
          </button>
        )}
      </div>
    </div>
  )
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getAllOrders()
      setOrders(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
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
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all orders in the system
              </p>
            </div>
            <button
              onClick={() => navigate('/orders/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Order
            </button>
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

      {orders.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new order.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/orders/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  New Order
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage