import React from 'react'
import { Settings as SettingsIcon, Users, Bell, Shield, Palette } from 'lucide-react'

export default function Settings() {
    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">
                        Configure your CMS preferences and system settings
                    </p>
                </div>

                {/* Coming Soon Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <SettingsIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Settings & Configuration
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        This section will provide comprehensive settings for managing users,
                        notifications, security, and system preferences.
                    </p>
                </div>

                {/* Feature Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
                        <p className="text-sm text-gray-600">
                            Manage admin users, roles, and permissions
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
                        <p className="text-sm text-gray-600">
                            Configure email and system notifications
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mb-4">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                        <p className="text-sm text-gray-600">
                            Security settings and access controls
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Appearance</h3>
                        <p className="text-sm text-gray-600">
                            Customize theme and display preferences
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
