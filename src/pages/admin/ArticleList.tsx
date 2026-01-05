import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'

export default function ArticleList() {
    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
                    <p className="mt-2 text-gray-600">Manage your magazine articles</p>
                </div>
                <Link
                    to="/admin/articles/new"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Article
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Article management coming soon</h3>
                <p className="text-gray-600">This feature will be available shortly</p>
            </div>
        </div>
    )
}
