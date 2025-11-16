import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  Check,
  Users,
  GraduationCap,
  Briefcase,
  Star,
  UserCircle
} from 'lucide-react';

interface ContributorStatus {
  id: string;
  value: string;
  label: string;
  description?: string;
  order: number;
}

interface ContributorStatusManagerProps {
  authToken: string;
}

export function ContributorStatusManager({ authToken }: ContributorStatusManagerProps) {
  const [statuses, setStatuses] = useState<ContributorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    description: ''
  });

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatuses(data.statuses || []);
      } else {
        throw new Error(data.error || 'Failed to fetch statuses');
      }
    } catch (err: any) {
      console.error('Error fetching statuses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ value: '', label: '', description: '' });
    setError('');
    setSuccess('');
  };

  const handleEdit = (status: ContributorStatus) => {
    setEditingId(status.id);
    setAddingNew(false);
    setFormData({
      value: status.value,
      label: status.label,
      description: status.description || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setAddingNew(false);
    setEditingId(null);
    setFormData({ value: '', label: '', description: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.label.trim() || !formData.value.trim()) {
      setError('Label and value are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (addingNew) {
        // Create new status
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              value: formData.value.toLowerCase().replace(/\s+/g, '-'),
              label: formData.label,
              description: formData.description
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create status');
        }

        setSuccess('Contributor status created successfully!');
      } else if (editingId) {
        // Update existing status
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses/${editingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              value: formData.value.toLowerCase().replace(/\s+/g, '-'),
              label: formData.label,
              description: formData.description
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update status');
        }

        setSuccess('Contributor status updated successfully!');
      }

      await fetchStatuses();
      handleCancel();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete "${label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete status');
      }

      setSuccess('Contributor status deleted successfully!');
      await fetchStatuses();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForStatus = (value: string) => {
    switch (value.toLowerCase()) {
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      case 'teacher':
      case 'staff':
      case 'hi-staff':
        return <Briefcase className="w-5 h-5" />;
      case 'guest':
        return <Star className="w-5 h-5" />;
      default:
        return <UserCircle className="w-5 h-5" />;
    }
  };

  if (loading && statuses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl">Contributor Status Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                Define contributor categories for submissions (e.g., Student, Teacher, Guest)
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={addingNew}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Status
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Add New Form */}
        {addingNew && (
          <div className="border-b border-gray-200 p-6 bg-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">Add New Contributor Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Label (Display Name)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Alumni Contributor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Value (Internal ID)</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., alumni-contributor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Former students contributing to the magazine"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Status
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Statuses List */}
        <div className="p-6">
          {statuses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No contributor statuses yet</p>
              <p className="text-gray-500 text-sm">Add your first contributor status to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statuses.map((status) => (
                <div
                  key={status.id}
                  className={`border rounded-lg p-4 transition-all ${
                    editingId === status.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {editingId === status.id ? (
                    // Edit Mode
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm mb-2">Label</label>
                          <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-2">Value</label>
                          <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm mb-2">Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          {getIconForStatus(status.value)}
                        </div>
                        <div>
                          <h3 className="font-medium">{status.label}</h3>
                          <p className="text-sm text-gray-500">Value: {status.value}</p>
                          {status.description && (
                            <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(status)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(status.id, status.label)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete status"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="mb-1">
                <strong>Note:</strong> Contributor statuses help categorize submissions by author type.
              </p>
              <p className="text-gray-600">
                Deleting a status will not affect existing submissions, but it will no longer be available for new submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
