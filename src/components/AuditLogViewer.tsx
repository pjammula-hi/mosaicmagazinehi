import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Key, 
  User, 
  Filter,
  Download,
  Calendar,
  Mail,
  MapPin,
  Monitor,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AuditLog {
  type: string;
  email?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  errorDetails?: string;
  performedBy?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  targetUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  changeType?: string;
  action?: string;
  passwordExpired?: boolean;
  daysRemaining?: number;
}

interface AuditLogViewerProps {
  token: string;
}

export function AuditLogViewer({ token }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [limit, setLimit] = useState(100);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (filterType && filterType !== 'all') {
        params.append('type', filterType);
      }
      
      if (filterEmail.trim()) {
        params.append('email', filterEmail.trim());
      }
      
      if (filterStartDate) {
        params.append('startDate', filterStartDate);
      }
      
      if (filterEndDate) {
        params.append('endDate', filterEndDate);
      }

      console.log('[AuditLogViewer] Fetching audit logs...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/admin/audit-logs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log('[AuditLogViewer] Response status:', response.status);

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          throw new Error('Your session has expired or is invalid. Please log out and log in again.');
        }
        throw new Error(data.error || 'Failed to fetch audit logs');
      }

      setLogs(data.logs || []);
      console.log('[AuditLogViewer] Loaded', data.logs?.length || 0, 'audit log entries');
    } catch (err: any) {
      console.error('[AuditLogViewer] Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a valid token
    if (token) {
      fetchLogs();
    } else {
      setError('No authentication token provided');
      setLoading(false);
    }
  }, []);

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setFilterEmail('');
    setFilterStartDate('');
    setFilterEndDate('');
    setLimit(100);
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Type', 'Email', 'User', 'IP Address', 'Status', 'Details'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.type,
      log.email || log.performedBy?.email || log.targetUser?.email || '-',
      log.userName || log.performedBy?.name || log.targetUser?.name || '-',
      log.ipAddress,
      log.success ? 'Success' : 'Failed',
      log.reason || log.errorDetails || '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (log: AuditLog) => {
    if (log.type.includes('login_success') || log.type.includes('magic_link_success')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (log.type.includes('login_failed') || log.type.includes('magic_link_failed')) return <XCircle className="w-5 h-5 text-red-500" />;
    if (log.type.includes('user_created')) return <UserPlus className="w-5 h-5 text-blue-500" />;
    if (log.type.includes('password')) return <Key className="w-5 h-5 text-yellow-500" />;
    if (log.type.includes('user_status')) return <User className="w-5 h-5 text-purple-500" />;
    return <Shield className="w-5 h-5 text-gray-500" />;
  };

  const getLogTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'login_success': 'Login Success',
      'login_failed': 'Login Failed',
      'login_error': 'Login Error',
      'magic_link_success': 'Magic Link Login',
      'magic_link_failed': 'Magic Link Failed',
      'magic_link_error': 'Magic Link Error',
      'user_created': 'User Created',
      'password_changed': 'Password Changed',
      'user_status_changed': 'User Status Changed'
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'missing_credentials': 'Missing Credentials',
      'invalid_credentials': 'Invalid Credentials',
      'inactive_account': 'Inactive Account',
      'unauthorized_role': 'Unauthorized Role',
      'authentication_failed': 'Authentication Failed',
      'system_error': 'System Error',
      'invalid_or_expired_token': 'Invalid/Expired Token',
      'token_already_used': 'Token Already Used',
      'token_expired': 'Token Expired',
      'user_not_found': 'User Not Found'
    };
    return labels[reason] || reason;
  };

  // Statistics
  const stats = {
    total: logs.length,
    successful: logs.filter(l => l.success).length,
    failed: logs.filter(l => !l.success).length,
    uniqueUsers: new Set(logs.map(l => l.email || l.userId).filter(Boolean)).size
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-purple-600" />
          Audit Logs & Security Monitor
        </h2>
        <p className="text-gray-600">
          Track all login attempts, user activities, and security events
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-green-600">{stats.successful}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl">{stats.uniqueUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1">Event Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login_success">Login Success</SelectItem>
                  <SelectItem value="login_failed">Login Failed</SelectItem>
                  <SelectItem value="magic_link_success">Magic Link Success</SelectItem>
                  <SelectItem value="magic_link_failed">Magic Link Failed</SelectItem>
                  <SelectItem value="user_created">User Created</SelectItem>
                  <SelectItem value="password_changed">Password Changed</SelectItem>
                  <SelectItem value="user_status_changed">User Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="filterEmail" className="block text-sm mb-1">Email</label>
              <Input
                id="filterEmail"
                type="email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Filter by email"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm mb-1">Start Date</label>
              <Input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm mb-1">End Date</label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} disabled={loading}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV} disabled={logs.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Showing {logs.length} event{logs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching your criteria
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    log.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getLogIcon(log)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={log.success ? 'default' : 'destructive'}>
                            {getLogTypeLabel(log.type)}
                          </Badge>
                          {log.reason && (
                            <Badge variant="outline" className="text-xs">
                              {getReasonLabel(log.reason)}
                            </Badge>
                          )}
                          {log.passwordExpired && (
                            <Badge variant="outline" className="text-xs bg-yellow-50">
                              Password Expired
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm">
                          {log.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{log.email}</span>
                            </div>
                          )}
                          
                          {log.userName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {log.userName}
                                {log.userRole && <span className="text-gray-500"> ({log.userRole})</span>}
                              </span>
                            </div>
                          )}

                          {log.performedBy && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                Action by: {log.performedBy.name} ({log.performedBy.email})
                              </span>
                            </div>
                          )}

                          {log.targetUser && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                Target: {log.targetUser.name} ({log.targetUser.email})
                              </span>
                            </div>
                          )}

                          {log.changeType && (
                            <div className="text-gray-600">
                              Change Type: {log.changeType.replace('_', ' ')}
                            </div>
                          )}

                          {log.action && (
                            <div className="text-gray-600">
                              Action: {log.action}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{log.ipAddress}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-500">
                            <Monitor className="w-4 h-4" />
                            <span className="truncate" title={log.userAgent}>
                              {log.userAgent.substring(0, 60)}
                              {log.userAgent.length > 60 ? '...' : ''}
                            </span>
                          </div>

                          {log.errorDetails && (
                            <div className="text-red-600 text-xs mt-1">
                              Error: {log.errorDetails}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
