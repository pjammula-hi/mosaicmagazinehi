import React from 'react'
import { Image } from 'lucide-react'

export default function MediaLibrary() {
    return (
        <div className="p-8">
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Media library coming soon</h3>
                <p className="text-gray-600">This feature will be available shortly</p>
            </div>
        </div>
    )
}
