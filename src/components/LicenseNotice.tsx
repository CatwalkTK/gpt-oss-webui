'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function LicenseNotice() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('license-notice-acknowledged')
    }
    return true
  })

  const handleAcknowledge = () => {
    localStorage.setItem('license-notice-acknowledged', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              License Notice
            </h3>
            <div className="mt-2 text-xs text-yellow-700">
              <p>
                This software is licensed under <strong>AGPL-3.0</strong> for non-commercial use.
                Commercial use requires a separate license.
              </p>
              <div className="mt-2 space-y-1">
                <p>✅ <strong>Free</strong>: Personal, educational, research</p>
                <p>💼 <strong>Commercial</strong>: Contact us for licensing</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <a
                href="https://github.com/CatwalkTK/gpt-oss-webui/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-yellow-800 underline hover:text-yellow-900"
              >
                View Full License
              </a>
              <button
                onClick={handleAcknowledge}
                className="ml-3 inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded"
              >
                Understand
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleAcknowledge}
              className="bg-yellow-50 rounded-md text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}