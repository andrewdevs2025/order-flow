import React from 'react'
import { Users } from 'lucide-react'

const MastersPage: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Masters</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage master profiles
          </p>
        </div>
      </div>

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
    </div>
  )
}

export default MastersPage
