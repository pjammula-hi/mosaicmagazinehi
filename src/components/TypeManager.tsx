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
  FileText,
  Image,
  Palette,
  BookOpen,
  Newspaper,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ContentType {
  id: string;
  value: string;
  label: string;
  icon: string;
  order: number;
}

interface TypeManagerProps {
  authToken: string;
}

const availableIcons = [
  { name: 'FileText', icon: FileText, component: <FileText className="w-5 h-5" /> },
  { name: 'BookOpen', icon: BookOpen, component: <BookOpen className="w-5 h-5" /> },
  { name: 'Image', icon: Image, component: <Image className="w-5 h-5" /> },
  { name: 'Palette', icon: Palette, component: <Palette className="w-5 h-5" /> },
  { name: 'Newspaper', icon: Newspaper, component: <Newspaper className="w-5 h-5" /> },
  { name: 'MessageSquare', icon: MessageSquare, component: <MessageSquare className="w-5 h-5" /> },
  { name: 'Sparkles', icon: Sparkles, component: <Sparkles className="w-5 h-5" /> }
];

export function TypeManager({ authToken }: TypeManagerProps) {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    icon: 'FileText'
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTypes(data.types || []);
      } else {
        throw new Error(data.error || 'Failed to fetch types');
      }
    } catch (err: any) {
      console.error('Error fetching types:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ value: '', label: '', icon: 'FileText' });
    setError('');
    setSuccess('');
  };

  const handleEdit = (type: ContentType) => {
    setEditingId(type.id);
    setAddingNew(false);
    setFormData({
      value: type.value,
      label: type.label,
      icon: type.icon
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setAddingNew(false);
    setEditingId(null);
    setFormData({ value: '', label: '', icon: 'FileText' });
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
        // Create new type
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              value: formData.value.toLowerCase().replace(/\s+/g, '-'),
              label: formData.label,
              icon: formData.icon
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create type');
        }

        setSuccess('Type created successfully!');
      } else if (editingId) {
        // Update existing type
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types/${editingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              value: formData.value.toLowerCase().replace(/\s+/g, '-'),
              label: formData.label,
              icon: formData.icon
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update type');
        }

        setSuccess('Type updated successfully!');
      }

      await fetchTypes();
      handleCancel();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving type:', err);
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
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete type');
      }

      setSuccess('Type deleted successfully!');
      await fetchTypes();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting type:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = availableIcons.find(i => i.name === iconName);
    return icon ? icon.component : <FileText className="w-5 h-5" />;
  };

  if (loading && types.length === 0) {
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
              <h2 className="text-2xl">Content Type Management</h2>
              <p className="text-gray-600 text-sm mt-1">
                Add, edit, or remove submission types for your magazine
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={addingNew}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Type
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
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">Add New Content Type</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Label (Display Name)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Photography"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Value (Internal ID)</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., photography"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Type
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

        {/* Types List */}
        <div className="p-6">
          {types.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No content types yet</p>
              <p className="text-gray-500 text-sm">Add your first content type to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {types.map((type) => (
                <div
                  key={type.id}
                  className={`border rounded-lg p-4 transition-all ${
                    editingId === type.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {editingId === type.id ? (
                    // Edit Mode
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                        <div>
                          <label className="block text-sm mb-2">Icon</label>
                          <select
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {availableIcons.map((icon) => (
                              <option key={icon.name} value={icon.name}>
                                {icon.name}
                              </option>
                            ))}
                          </select>
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
                          {getIconComponent(type.icon)}
                        </div>
                        <div>
                          <h3 className="font-medium">{type.label}</h3>
                          <p className="text-sm text-gray-500">Value: {type.value}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(type)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit type"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id, type.label)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete type"
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
                <strong>Note:</strong> These content types will be available for all submission forms.
              </p>
              <p className="text-gray-600">
                Deleting a type will not affect existing submissions, but it will no longer be available for new submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
