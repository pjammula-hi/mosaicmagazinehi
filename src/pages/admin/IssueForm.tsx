import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export default function IssueForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = !!id

    const [loading, setLoading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        month: '',
        year: new Date().getFullYear(),
        volume: 1,
        issue_number: 1,
        cover_image_url: '',
        publication_date: new Date().toISOString().split('T')[0],
        is_published: false,
    })

    React.useEffect(() => {
        if (isEditing) {
            loadIssue()
        }
    }, [id])

    async function loadIssue() {
        if (!id) return

        try {
            const { data, error } = await supabase
                .from('issues')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            if (data) {
                setFormData({
                    month: data.month,
                    year: data.year,
                    volume: data.volume || 1,
                    issue_number: data.issue_number || 1,
                    cover_image_url: data.cover_image_url || '',
                    publication_date: data.publication_date || new Date().toISOString().split('T')[0],
                    is_published: data.is_published,
                })
            }
        } catch (error) {
            console.error('Error loading issue:', error)
            toast.error('Failed to load issue')
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const issueData = {
                month: formData.month,
                year: formData.year,
                volume: formData.volume,
                issue_number: formData.issue_number,
                cover_image_url: formData.cover_image_url || null,
                publication_date: formData.publication_date || null,
                is_published: formData.is_published,
            }

            if (isEditing && id) {
                const { error } = await supabase
                    .from('issues')
                    .update(issueData)
                    .eq('id', id)

                if (error) throw error
                toast.success('Issue updated successfully!')
            } else {
                const { error } = await supabase
                    .from('issues')
                    .insert([issueData])

                if (error) throw error
                toast.success('Issue created successfully!')
            }

            navigate('/admin/issues')
        } catch (error: any) {
            console.error('Error saving issue:', error)
            toast.error(error.message || 'Failed to save issue')
        } finally {
            setLoading(false)
        }
    }

    function handleChange(field: string, value: any) {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="p-8">
            <Toaster position="top-right" />

            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/issues')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Issues
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? 'Edit Issue' : 'Create New Issue'}
                </h1>
                <p className="mt-2 text-gray-600">
                    {isEditing ? 'Update issue details' : 'Set up a new magazine issue'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Month */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month *
                        </label>
                        <select
                            required
                            value={formData.month}
                            onChange={(e) => handleChange('month', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select month...</option>
                            {MONTHS.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year *
                        </label>
                        <input
                            type="number"
                            required
                            min="2020"
                            max="2100"
                            value={formData.year}
                            onChange={(e) => handleChange('year', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Volume & Issue Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Volume
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.volume}
                                onChange={(e) => handleChange('volume', parseInt(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Issue Number
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.issue_number}
                                onChange={(e) => handleChange('issue_number', parseInt(e.target.value) || null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.cover_image_url}
                                onChange={(e) => handleChange('cover_image_url', e.target.value)}
                                placeholder="/documents/January 2026/1.jpg"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => navigate('/admin/media')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                        </div>
                        {formData.cover_image_url && (
                            <div className="mt-4">
                                <img
                                    src={formData.cover_image_url}
                                    alt="Cover preview"
                                    className="w-48 h-64 object-cover rounded-lg shadow"
                                />
                            </div>
                        )}
                    </div>

                    {/* Publication Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publication Date
                        </label>
                        <input
                            type="date"
                            value={formData.publication_date}
                            onChange={(e) => handleChange('publication_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Published Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => handleChange('is_published', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_published" className="ml-2 text-sm font-medium text-gray-700">
                            Publish this issue immediately
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : isEditing ? 'Update Issue' : 'Create Issue'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/issues')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
