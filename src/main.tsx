import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import IssueManager from './pages/admin/IssueManager'
import IssueForm from './pages/admin/IssueForm'
import ArticleList from './pages/admin/ArticleList'
import ArticleEditor from './pages/admin/ArticleEditor'
import AuthorManager from './pages/admin/AuthorManager'
import MediaLibrary from './pages/admin/MediaLibrary'
import './index.css'

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="issues" element={<IssueManager />} />
          <Route path="issues/new" element={<IssueForm />} />
          <Route path="issues/:id/edit" element={<IssueForm />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/new" element={<ArticleEditor />} />
          <Route path="articles/:id/edit" element={<ArticleEditor />} />
          <Route path="authors" element={<AuthorManager />} />
          <Route path="media" element={<MediaLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

// Mount the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)