import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { UserPlus, Users, LogOut, AlertCircle, Check, Upload, Shield, Eye, Zap, Star, Settings } from 'lucide-react';
import { EditorDashboard } from './EditorDashboard';
import { ReaderDashboard } from './ReaderDashboard';
import { BulkUserUpload } from './BulkUserUpload';
import { AuditLogViewer } from './AuditLogViewer';
import { UserManagement } from './UserManagement';
import { BrutalButton, BrutalHeader, BrutalStat, BrutalCard, BrutalInput, BrutalAlert } from './BrutalUI';

interface AdminDashboardProps {
  user: any;
  authToken: string;
  onLogout: () => void;
}

export function AdminDashboard({ user, authToken, onLogout }: AdminDashboardProps) {
  console.log('%c📊 AdminDashboard v1.0.4 RENDERING', 'color: orange; font-weight: bold; font-size: 14px;');
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
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-red-400 to-orange-400 border-b-4 border-black px-6 py-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <BrutalButton onClick={() => setShowAuditLogs(false)} variant="primary" size="sm">
                ← Back to Admin Panel
              </BrutalButton>
              <div 
                className="w-12 h-12 bg-black border-4 border-black rotate-6 flex items-center justify-center cursor-pointer brutal-shadow-sm brutal-hover"
                onClick={onLogout}
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-yellow-400" strokeWidth={3} />
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
        <div className="bg-gradient-to-r from-red-400 to-orange-400 border-b-4 border-black px-6 py-4">
          <BrutalButton onClick={() => setShowReaderView(false)} variant="primary" size="sm">
            ← Back to Admin Panel
          </BrutalButton>
        </div>
        <ReaderDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  if (showEditorView) {
    return (
      <div>
        <div className="bg-gradient-to-r from-red-400 to-orange-400 border-b-4 border-black px-6 py-4">
          <BrutalButton onClick={() => setShowEditorView(false)} variant="primary" size="sm">
            ← Back to Admin Panel
          </BrutalButton>
        </div>
        <EditorDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  // Calculate user stats safely - only when users array is populated
  const userStats = {
    total: users?.length || 0,
    students: users?.filter(u => u.role === 'student').length || 0,
    teachers: users?.filter(u => u.role === 'teacher').length || 0,
    editors: users?.filter(u => u.role === 'editor').length || 0,
    admins: users?.filter(u => u.role === 'admin').length || 0,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-gradient-to-r from-red-400 to-orange-400 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black border-4 border-black -rotate-6 flex items-center justify-center">
                <Shield className="w-7 h-7 text-red-400" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-black tracking-tight" style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase' }}>
                  MOSAIC ADMIN
                </h1>
                <p className="text-black" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
                  CONTROL CENTER
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BrutalButton onClick={() => setShowEditorView(true)} variant="secondary" size="sm" icon={Eye}>
                Editor View
              </BrutalButton>
              <BrutalButton onClick={() => setShowReaderView(true)} variant="success" size="sm" icon={Eye}>
                Reader View
              </BrutalButton>
              <div 
                className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-black rotate-6 flex items-center justify-center cursor-pointer brutal-shadow-sm brutal-hover"
                onClick={onLogout}
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Page Title */}
        <div className="mb-8">
          <BrutalHeader color="red" rotate={1}>
            ADMIN ZONE
          </BrutalHeader>
          
          <div className="mt-4">
            <p className="text-gray-700 font-bold">
              Welcome, {user.fullName} - You have full system access
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6">
            <BrutalAlert type="error" icon={AlertCircle} rotate={-1}>
              {error}
            </BrutalAlert>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <BrutalAlert type="success" icon={Check} rotate={1}>
              {success}
            </BrutalAlert>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <BrutalStat 
            label="TOTAL USERS" 
            value={userStats.total} 
            color="cyan" 
            icon={Users}
            rotate={-2}
          />
          <BrutalStat 
            label="STUDENTS" 
            value={userStats.students} 
            color="green" 
            icon={Star}
            rotate={1}
          />
          <BrutalStat 
            label="TEACHERS" 
            value={userStats.teachers} 
            color="yellow" 
            icon={Star}
            rotate={-1}
          />
          <BrutalStat 
            label="EDITORS" 
            value={userStats.editors} 
            color="purple" 
            icon={Settings}
            rotate={2}
          />
          <BrutalStat 
            label="ADMINS" 
            value={userStats.admins} 
            color="red" 
            icon={Shield}
            rotate={-1}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-black text-xl font-black uppercase mb-6">QUICK ACTIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BrutalButton 
              onClick={() => setShowUserForm(!showUserForm)} 
              variant="primary"
              icon={UserPlus}
            >
              {showUserForm ? 'Hide Form' : 'Add User'}
            </BrutalButton>
            
            <BrutalButton 
              onClick={() => setShowBulkUpload(!showBulkUpload)} 
              variant="secondary"
              icon={Upload}
            >
              Bulk Upload
            </BrutalButton>
            
            <BrutalButton 
              onClick={() => setShowAuditLogs(true)} 
              variant="warning"
              icon={AlertCircle}
            >
              Audit Logs
            </BrutalButton>
            
            <BrutalButton 
              onClick={() => window.location.hash = '#mockups'} 
              variant="success"
              icon={Star}
            >
              Design Mockups
            </BrutalButton>
          </div>
        </div>

        {/* Create User Form */}
        {showUserForm && (
          <BrutalCard color="yellow" rotate={-1} className="mb-12">
            <h3 className="text-black text-xl font-black uppercase mb-6">CREATE NEW USER</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <BrutalInput
                label="Full Name"
                type="text"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                required
              />

              <BrutalInput
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="student@nycstudents.net or teacher@schools.nyc.gov"
                required
              />

              <div className="space-y-2">
                <label className="text-black text-sm font-black uppercase tracking-wide">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-4 border-black text-black font-bold brutal-shadow focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="guardian">Guardian</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {(newUser.role === 'admin' || newUser.role === 'editor') && (
                <BrutalInput
                  label="Password (Required for Admin/Editor)"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                />
              )}

              <div className="flex gap-3 mt-6">
                <BrutalButton type="submit" variant="success" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </BrutalButton>
                <BrutalButton onClick={() => setShowUserForm(false)} variant="danger">
                  Cancel
                </BrutalButton>
              </div>
            </form>
          </BrutalCard>
        )}

        {/* Bulk Upload */}
        {showBulkUpload && (
          <BrutalCard color="cyan" rotate={1} className="mb-12">
            <h3 className="text-black text-xl font-black uppercase mb-6">BULK USER UPLOAD</h3>
            <BulkUserUpload authToken={authToken} onComplete={fetchUsers} />
          </BrutalCard>
        )}

        {/* User Management */}
        <div>
          <h2 className="text-black text-xl font-black uppercase mb-6">ALL USERS</h2>
          <UserManagement authToken={authToken} />
        </div>
      </div>
    </div>
  );
}
