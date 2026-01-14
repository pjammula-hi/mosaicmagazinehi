import React from 'react'
import { Mail, Plus } from 'lucide-react'

export default function PrincipalLetters() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Principal Letters</h1>
                    <p className="text-gray-600">
                        Manage principal's letters and messages for each issue
                    </p>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Principal Letters Manager
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        This feature will allow you to create, edit, and manage principal's letters
                        that appear in each magazine issue.
                    </p>
                    <button
                        disabled
                        className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Letter (Coming Soon)
                    </button>
                </div>

                {/* Feature Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Letter Templates</h3>
                        <p className="text-sm text-gray-600">
                            Pre-designed templates for principal messages
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Rich Text Editor</h3>
                        <p className="text-sm text-gray-600">
                            Format letters with images and styling
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Issue Assignment</h3>
                        <p className="text-sm text-gray-600">
                            Link letters to specific magazine issues
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
