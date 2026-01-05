import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database.types'

type Issue = Database['public']['Tables']['issues']['Row']

export default function IssueManager() {
    const [issues, setIssues] = React.useState<Issue[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        loadIssues()
    }, [])

    async function loadIssues() {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false })

            if (error) throw error
            setIssues(data || [])
        } catch (error) {
            console.error('Error loading issues:', error)
        } finally {
            setLoading(false)
        }
    }

    async function togglePublish(issue: Issue) {
        try {
            const { error } = await supabase
                .from('issues')
                .update({ is_published: !issue.is_published })
                .eq('id', issue.id)

            if (error) throw error

            // Reload issues
            loadIssues()
        } catch (error) {
            console.error('Error toggling publish:', error)
            alert('Failed to update issue')
        }
    }

    async function deleteIssue(issue: Issue) {
        if (!confirm(`Are you sure you want to delete ${issue.month} ${issue.year}? This will also delete all associated articles and pages.`)) {
            return
        }

        try {
            const { error } = await supabase
                .from('issues')
                .delete()
                .eq('id', issue.id)

            if (error) throw error

            // Reload issues
            loadIssues()
        } catch (error) {
            console.error('Error deleting issue:', error)
            alert('Failed to delete issue')
        }
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
                    <p className="mt-2 text-gray-600">Manage your magazine issues</p>
                </div>
                <Link
                    to="/admin/issues/new"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Issue
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-600">Loading issues...</div>
                </div>
            ) : issues.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first magazine issue</p>
                    <Link
                        to="/admin/issues/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Issue
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issues.map((issue) => (
                        <div key={issue.id} className="bg-white rounded-lg shadow overflow-hidden">
                            {/* Cover Image */}
                            {issue.cover_image_url ? (
                                <div className="h-48 bg-gray-200 overflow-hidden">
                                    <img
                                        src={issue.cover_image_url}
                                        alt={`${issue.month} ${issue.year} cover`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {issue.month} {issue.year}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${issue.is_published
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {issue.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {issue.volume && issue.issue_number && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        Volume {issue.volume}, Issue {issue.issue_number}
                                    </p>
                                )}

                                {issue.publication_date && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        Published: {new Date(issue.publication_date).toLocaleDateString()}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4">
                                    <Link
                                        to={`/admin/issues/${issue.id}/edit`}
                                        className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => togglePublish(issue)}
                                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded transition-colors text-sm ${issue.is_published
                                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {issue.is_published ? (
                                            <>
                                                <EyeOff className="w-4 h-4 mr-1" />
                                                Unpublish
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4 mr-1" />
                                                Publish
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => deleteIssue(issue)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
