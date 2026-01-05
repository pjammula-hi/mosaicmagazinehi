import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import IssueManager from './pages/admin/IssueManager'
import ArticleEditor from './pages/admin/ArticleEditor'
import AuthorManager from './pages/admin/AuthorManager'
import MediaLibrary from './pages/admin/MediaLibrary'
import PrincipalLetters from './pages/admin/PrincipalLetters'
import Settings from './pages/admin/Settings'

const router = createBrowserRouter([
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: 'issues',
                element: <IssueManager />
            },
            {
                path: 'articles',
                element: <ArticleEditor />
            },
            {
                path: 'articles/new',
                element: <ArticleEditor />
            },
            {
                path: 'articles/:id',
                element: <ArticleEditor />
            },
            {
                path: 'authors',
                element: <AuthorManager />
            },
            {
                path: 'media',
                element: <MediaLibrary />
            },
            {
                path: 'principal-letters',
                element: <PrincipalLetters />
            },
            {
                path: 'settings',
                element: <Settings />
            }
        ]
    }
])

function AdminApp() {
    return <RouterProvider router={router} />
}

export default AdminApp
