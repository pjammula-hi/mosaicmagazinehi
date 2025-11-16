import { useState, useRef, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { X, Upload, Image as ImageIcon, Trash2, Plus, GripVertical, FileText, Move, Edit, Eye } from 'lucide-react';
import { EditableSubmissionFields } from './EditableSubmissionFields';

interface IssueEditorProps {
  issue: any;
  authToken: string;
  onClose: () => void;
  onUpdate: () => void;
}

export function IssueEditor({ issue, authToken, onClose, onUpdate }: IssueEditorProps) {
  const [editedIssue, setEditedIssue] = useState({
    title: issue.title || '',
    month: issue.month || new Date().getMonth() + 1,
    year: issue.year || new Date().getFullYear(),
    number: issue.number || '',
    volume: issue.volume || '',
    coverImageUrl: issue.coverImageUrl || '',
    description: issue.description || '',
    tableOfContents: issue.tableOfContents || []
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [editingSubmission, setEditingSubmission] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  // Fetch submissions for this issue
  useEffect(() => {
    fetchSubmissions();
  }, [issue.id]);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        const issueSubmissions = data.submissions?.filter(
          (s: any) => s.issueId === issue.id && s.status !== 'deleted'
        ) || [];
        setSubmissions(issueSubmissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleMoveToTrash = async (submissionId: string) => {
    if (!confirm('Move this submission to trash? You can restore it later from the Editor Dashboard.')) {
      return;
    }

    // Find the submission to get its details
    const submission = submissions.find(s => s.id === submissionId);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submissionId}/trash`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        // Remove the submission from the table of contents
        if (submission) {
          const updatedTOC = editedIssue.tableOfContents.filter((entry: any) => 
            entry.title !== submission.title || entry.author !== submission.authorName
          );
          
          setEditedIssue({
            ...editedIssue,
            tableOfContents: updatedTOC
          });
        }
        
        alert('Submission moved to trash and removed from table of contents');
        fetchSubmissions();
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to move to trash'}`);
      }
    } catch (err) {
      console.error('Error moving to trash:', err);
      alert('Failed to move to trash. Please try again.');
    }
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size: 5MB');
      return;
    }

    setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        setEditedIssue({ ...editedIssue, coverImageUrl: data.url });
      } else {
        alert('Failed to upload cover image: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Cover upload error:', err);
      alert('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAddTOCEntry = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      title: '',
      author: '',
      page: '',
      category: ''
    };
    setEditedIssue({
      ...editedIssue,
      tableOfContents: [...editedIssue.tableOfContents, newEntry]
    });
  };

  const handleUpdateTOCEntry = (id: string, field: string, value: string) => {
    setEditedIssue({
      ...editedIssue,
      tableOfContents: editedIssue.tableOfContents.map((entry: any) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    });
  };

  const handleRemoveTOCEntry = (id: string) => {
    setEditedIssue({
      ...editedIssue,
      tableOfContents: editedIssue.tableOfContents.filter((entry: any) => entry.id !== id)
    });
  };

  const handleMoveTOCEntry = (id: string, direction: 'up' | 'down') => {
    const index = editedIssue.tableOfContents.findIndex((entry: any) => entry.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editedIssue.tableOfContents.length - 1)
    ) {
      return;
    }

    const newTOC = [...editedIssue.tableOfContents];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newTOC[index], newTOC[newIndex]] = [newTOC[newIndex], newTOC[index]];

    setEditedIssue({
      ...editedIssue,
      tableOfContents: newTOC
    });
  };

  const handleSave = async () => {
    if (!editedIssue.title) {
      alert('Please enter an issue title');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(editedIssue)
        }
      );

      if (response.ok) {
        alert('Issue updated successfully!');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert('Failed to update issue: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating issue:', err);
      alert('Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg max-w-4xl w-full my-8 relative"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex items-center justify-between drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-gray-400" />
            <h2 className="text-2xl">Edit Issue</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-160px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm mb-2 text-gray-700">Issue Title</label>
              <input
                type="text"
                value={editedIssue.title}
                onChange={(e) => setEditedIssue({ ...editedIssue, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., Spring Edition 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Issue Number</label>
                <input
                  type="number"
                  value={editedIssue.number}
                  onChange={(e) => setEditedIssue({ ...editedIssue, number: parseInt(e.target.value) || '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., 2"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Volume</label>
                <input
                  type="number"
                  value={editedIssue.volume}
                  onChange={(e) => setEditedIssue({ ...editedIssue, volume: parseInt(e.target.value) || '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Month</label>
                <select
                  value={editedIssue.month}
                  onChange={(e) => setEditedIssue({ ...editedIssue, month: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Year</label>
                <input
                  type="number"
                  value={editedIssue.year}
                  onChange={(e) => setEditedIssue({ ...editedIssue, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Description</label>
              <textarea
                value={editedIssue.description}
                onChange={(e) => setEditedIssue({ ...editedIssue, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="Describe this issue..."
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium">Cover Image</h3>
            
            {editedIssue.coverImageUrl ? (
              <div className="relative">
                <img
                  src={editedIssue.coverImageUrl}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setEditedIssue({ ...editedIssue, coverImageUrl: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-3">No cover image set</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingCover ? 'Uploading...' : 'Upload Cover Image'}
                </button>
              </div>
            )}

            {editedIssue.coverImageUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {uploadingCover ? 'Uploading...' : 'Change Cover Image'}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Table of Contents */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Table of Contents</h3>
              <button
                onClick={handleAddTOCEntry}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>

            {editedIssue.tableOfContents.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-3">No table of contents entries yet</p>
                <p className="text-sm text-gray-500">Add entries to create a table of contents for this issue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {editedIssue.tableOfContents.map((entry: any, index: number) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 pt-2">
                        <button
                          onClick={() => handleMoveTOCEntry(entry.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                          title="Move up"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs mb-1 text-gray-600">Article Title</label>
                          <input
                            type="text"
                            value={entry.title}
                            onChange={(e) => handleUpdateTOCEntry(entry.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 text-sm"
                            placeholder="Article title"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1 text-gray-600">Author</label>
                          <input
                            type="text"
                            value={entry.author}
                            onChange={(e) => handleUpdateTOCEntry(entry.id, 'author', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 text-sm"
                            placeholder="Author name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1 text-gray-600">Page Number</label>
                          <input
                            type="text"
                            value={entry.page}
                            onChange={(e) => handleUpdateTOCEntry(entry.id, 'page', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 text-sm"
                            placeholder="e.g., 5"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1 text-gray-600">Category</label>
                          <input
                            type="text"
                            value={entry.category}
                            onChange={(e) => handleUpdateTOCEntry(entry.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-600 text-sm"
                            placeholder="e.g., Fiction, Poetry"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveTOCEntry(entry.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Pieces Attached to Issue */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium">Content Pieces Attached to Issue</h3>
            
            {loadingSubmissions ? (
              <div className="text-center py-8 text-gray-500">
                Loading submissions...
              </div>
            ) : submissions.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-1">No content pieces attached to this issue yet</p>
                <p className="text-sm text-gray-500">Submissions can be assigned to this issue from the Editor Dashboard</p>
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <h4 className="font-medium text-gray-900 truncate">{submission.title}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span>By {submission.authorName}</span>
                          {submission.category && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                {submission.category}
                              </span>
                            </>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="capitalize">{submission.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {submission.fileUrl && (
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                            title="View file"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        )}
                        <button
                          onClick={() => setEditingSubmission(submission)}
                          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                          title="Edit submission"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleMoveToTrash(submission.id)}
                          className="px-3 py-1.5 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                          title="Move to trash"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-2xl text-white">Edit Submission</h2>
              <button
                onClick={() => setEditingSubmission(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <EditableSubmissionFields
                  submission={editingSubmission}
                  authToken={authToken}
                  onUpdate={() => {
                    fetchSubmissions();
                    onUpdate();
                  }}
                  onClose={() => setEditingSubmission(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
