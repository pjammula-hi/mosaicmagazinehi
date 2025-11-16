import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { UserPlus, Users, LogOut, AlertCircle, Check, Upload, Shield } from 'lucide-react';
import { EditorDashboard } from './EditorDashboard';
import { ReaderDashboard } from './ReaderDashboard';
import { BulkUserUpload } from './BulkUserUpload';
import { AuditLogViewer } from './AuditLogViewer';
import { UserManagement } from './UserManagement';
import { StackedTilesLogo } from './logos/MosaicLogos';

interface AdminDashboardProps {
  user: any;
  authToken: string;
  onLogout: () => void;
}

export function AdminDashboard({ user, authToken, onLogout }: AdminDashboardProps) {
  const [showUserForm, setShowUserForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditorView, setShowEditorView] = useState(false);
  const [showReaderView, setShowReaderView] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'student',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/users`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate password for admin/editor roles
      if ((newUser.role === 'admin' || newUser.role === 'editor') && !newUser.password) {
        throw new Error('Password is required for admin and editor roles');
      }

      // Create user in our system
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/admin/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            password: newUser.password || undefined
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(`User ${newUser.fullName} created successfully!`);

      setNewUser({ email: '', fullName: '', role: 'student', password: '' });
      setShowUserForm(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (showAuditLogs) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAuditLogs(false)}
                className="text-purple-600 hover:text-purple-700"
              >
                ← Back to Admin Panel
              </button>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <AuditLogViewer token={authToken} />
        </div>
      </div>
    );
  }

  if (showReaderView) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowReaderView(false)}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Admin Panel
          </button>
        </div>
        <ReaderDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  if (showEditorView) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowEditorView(false)}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Admin Panel
          </button>
        </div>
        <EditorDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StackedTilesLogo size={60} />
              <div>
                <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Mosaic Magazine HI
                </h1>
                <p className="text-gray-600 text-sm">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAuditLogs(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Audit Logs
              </button>
              <button
                onClick={() => setShowReaderView(true)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Reader View
              </button>
              <button
                onClick={() => setShowEditorView(true)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Editor View
              </button>
              <div className="text-right">
                <p className="text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl">User Management</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload CSV
              </button>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="mb-6 p-6 bg-purple-50 rounded-lg">
              <h3 className="text-lg mb-4">Create New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="teacher@schools.nyc.gov"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="guardian">Guardian</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {(newUser.role === 'admin' || newUser.role === 'editor') && (
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Password (for admin/editor)</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setNewUser({ email: '', fullName: '', role: 'student', password: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Users List with Search, Edit, Pause, Delete */}
          <UserManagement
            authToken={authToken}
            users={users}
            onRefresh={fetchUsers}
            onSuccess={(message) => {
              setSuccess(message);
              setTimeout(() => setSuccess(''), 5000);
            }}
            onError={(message) => {
              setError(message);
              setTimeout(() => setError(''), 5000);
            }}
          />
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUserUpload
          authToken={authToken}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setSuccess('Users uploaded successfully!');
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
