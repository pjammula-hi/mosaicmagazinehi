import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, FileText, Users, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
    const [stats, setStats] = React.useState({
        totalIssues: 0,
        publishedIssues: 0,
        totalArticles: 0,
        totalAuthors: 0,
    })
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        loadStats()
    }, [])

    async function loadStats() {
        try {
            const [issues, publishedIssues, articles, authors] = await Promise.all([
                supabase.from('issues').select('id', { count: 'exact', head: true }),
                supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_published', true),
                supabase.from('articles').select('id', { count: 'exact', head: true }),
                supabase.from('authors').select('id', { count: 'exact', head: true }),
            ])

            setStats({
                totalIssues: issues.count || 0,
                publishedIssues: publishedIssues.count || 0,
                totalArticles: articles.count || 0,
                totalAuthors: authors.count || 0,
            })
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { name: 'Total Issues', value: stats.totalIssues, icon: BookOpen, color: 'bg-blue-500' },
        { name: 'Published Issues', value: stats.publishedIssues, icon: TrendingUp, color: 'bg-green-500' },
        { name: 'Total Articles', value: stats.totalArticles, icon: FileText, color: 'bg-purple-500' },
        { name: 'Total Authors', value: stats.totalAuthors, icon: Users, color: 'bg-orange-500' },
    ]

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to Mosaic Magazine CMS</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/admin/issues/new"
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Issue
                </Link>
                <Link
                    to="/admin/articles/new"
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Article
                </Link>
                <Link
                    to="/admin/media"
                    className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Upload Media
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {loading ? '...' : stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">1</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Create your first issue</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Click "Create New Issue" to set up your first magazine issue
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">2</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Add authors</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Go to Authors section to add student profiles
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">3</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Create articles</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Start adding articles to your issue
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">4</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-sm font-medium text-gray-900">Publish your issue</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    When ready, publish your issue to make it live
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
