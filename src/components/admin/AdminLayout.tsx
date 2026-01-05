import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    FileText,
    Users,
    Image,
    BookOpen,
    Menu,
    X
} from 'lucide-react'

export default function AdminLayout() {
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = React.useState(true)

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Issues', href: '/admin/issues', icon: BookOpen },
        { name: 'Articles', href: '/admin/articles', icon: FileText },
        { name: 'Authors', href: '/admin/authors', icon: Users },
        { name: 'Media Library', href: '/admin/media', icon: Image },
    ]

    const isActive = (href: string) => {
        if (href === '/admin') {
            return location.pathname === '/admin'
        }
        return location.pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-6 bg-slate-800">
                    <h1 className="text-xl font-bold text-white">Mosaic CMS</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    {navigation.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors ${active
                                        ? 'bg-slate-800 text-white'
                                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-800">
                    <div className="text-xs text-gray-400">
                        <p className="font-medium text-white mb-1">Admin User</p>
                        <p>Mosaic Magazine</p>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar toggle */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-40 lg:hidden bg-slate-900 text-white p-2 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Main content */}
            <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
                <div className="min-h-screen">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
