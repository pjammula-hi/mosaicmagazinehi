import { useState } from 'react';
import { X, Check, Edit, Upload, FileText, Trash2, Image as ImageIcon } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface EditableSubmissionFieldsProps {
  submission: any;
  authToken: string;
  onUpdate: () => void;
  onClose: () => void;
  onEditModeChange?: (isEditing: boolean) => void;
  onFileDetach?: () => void;
}

export function EditableSubmissionFields({ submission, authToken, onUpdate, onClose, onEditModeChange, onFileDetach }: EditableSubmissionFieldsProps) {
  const formatContributorStatus = (status: string) => {
    if (!status) return 'Not Specified';
    if (status === 'hi-staff') return 'HI Staff';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({
    title: submission.title,
    authorName: submission.authorName,
    authorEmail: submission.authorEmail || '',
    contributorStatus: submission.contributorStatus || 'student',
    type: submission.type,
    content: submission.content || ''
  });
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState('');
  const [documents, setDocuments] = useState(submission.documents || []);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    setReplacementFile(file);
    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('image/') ? 'image' : 'document');

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
        setNewFileUrl(data.url);
        alert('File uploaded successfully! Click "Save Changes" to apply.');
      } else {
        throw new Error(data.message || data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      alert('Failed to upload file: ' + err.message);
      setReplacementFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDetachDocument = (docId: string) => {
    if (window.confirm('Are you sure you want to detach this document? This action cannot be undone.')) {
      setDocuments(documents.filter((doc: any) => doc.id !== docId));
      setDocumentsToDelete([...documentsToDelete, docId]);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        title: editedData.title,
        authorName: editedData.authorName,
        authorEmail: editedData.authorEmail,
        contributorStatus: editedData.contributorStatus,
        type: editedData.type,
        content: editedData.content,
        documents: documents // Include updated documents array
      };

      // Include the new file URL if one was uploaded
      if (newFileUrl) {
        updateData.fileUrl = newFileUrl;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${submission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(updateData)
        }
      );

      if (response.ok) {
        alert('Submission updated successfully!');
        setIsEditMode(false);
        onEditModeChange?.(false);
        setReplacementFile(null);
        setNewFileUrl('');
        setDocumentsToDelete([]);
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update submission'}`);
      }
    } catch (err) {
      console.error('Error updating submission:', err);
      alert('Failed to update submission. Please try again.');
    }
  };

  return (
    <div>
      {/* Edit Mode Toggle */}
      <div className="flex justify-end mb-4">
        {!isEditMode ? (
          <button
            onClick={() => {
              setIsEditMode(true);
              onEditModeChange?.(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-sans-modern"
          >
            <Edit className="w-4 h-4" />
            Edit Submission
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-sans-modern"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditMode(false);
                onEditModeChange?.(false);
                setEditedData({
                  title: submission.title,
                  authorName: submission.authorName,
                  authorEmail: submission.authorEmail || '',
                  contributorStatus: submission.contributorStatus || 'student',
                  type: submission.type,
                  content: submission.content || ''
                });
                setReplacementFile(null);
                setNewFileUrl('');
                setDocuments(submission.documents || []);
                setDocumentsToDelete([]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-sans-modern"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 font-sans-modern mb-1">Title</p>
          {isEditMode ? (
            <input
              type="text"
              value={editedData.title}
              onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-serif-warm"
            />
          ) : (
            <p className="text-lg font-serif-warm">{submission.title}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 font-sans-modern mb-1">Author Name</p>
          {isEditMode ? (
            <input
              type="text"
              value={editedData.authorName}
              onChange={(e) => setEditedData({ ...editedData, authorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-sans-modern"
            />
          ) : (
            <p className="font-sans-modern">{submission.authorName}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 font-sans-modern mb-1">Author Email</p>
          {isEditMode ? (
            <input
              type="email"
              value={editedData.authorEmail}
              onChange={(e) => setEditedData({ ...editedData, authorEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-sans-modern"
            />
          ) : (
            <p className="text-sm text-gray-500">{submission.authorEmail || 'No email'}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 font-sans-modern mb-1">Contributor Status</p>
          {isEditMode ? (
            <select
              value={editedData.contributorStatus}
              onChange={(e) => setEditedData({ ...editedData, contributorStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-sans-modern"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="hi-staff">HI Staff</option>
              <option value="guest">Guest</option>
            </select>
          ) : (
            <p className="capitalize font-sans-modern">
              {submission.contributorStatus === 'hi-staff' ? 'HI Staff' : (submission.contributorStatus || 'Not specified')}
            </p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 font-sans-modern mb-1">Type</p>
          {isEditMode ? (
            <select
              value={editedData.type}
              onChange={(e) => setEditedData({ ...editedData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-sans-modern"
            >
              <option value="writing">Writing/Essay</option>
              <option value="poem">Poetry</option>
              <option value="story">Short Story</option>
              <option value="photo">Photography</option>
              <option value="art">Visual Art</option>
              <option value="crafts">Crafts</option>
              <option value="reflection">Reflection</option>
              <option value="news">News Article</option>
              <option value="opinion">Opinion Piece</option>
            </select>
          ) : (
            <p className="capitalize font-sans-modern">{submission.type}</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 font-sans-modern">Submitted</p>
          <p className="font-sans-modern">{new Date(submission.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-sans-modern mb-2">Content</p>
        {isEditMode ? (
          <textarea
            value={editedData.content}
            onChange={(e) => setEditedData({ ...editedData, content: e.target.value })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 font-serif-warm"
          />
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-serif-warm text-sm max-h-48 overflow-y-auto">
            {submission.content || 'No content'}
          </div>
        )}
      </div>

      {/* Attached Documents */}
      {documents && documents.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-sans-modern mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Attached Documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc: any, index: number) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {/* Document Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-200">
                  {doc.type === 'application/pdf' ? (
                    <span className="text-xs font-bold text-purple-700">PDF</span>
                  ) : doc.type?.startsWith('image/') ? (
                    <ImageIcon className="w-5 h-5 text-blue-700" />
                  ) : (
                    <FileText className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.metadata?.title || doc.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Page {index + 1} • {doc.fileName}
                  </p>
                  {doc.metadata?.description && (
                    <p className="text-xs text-gray-600 mt-1">{doc.metadata.description}</p>
                  )}
                </div>

                {/* Actions */}
                {isEditMode && (
                  <button
                    onClick={() => handleDetachDocument(doc.id)}
                    className="flex-shrink-0 p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors group"
                    title="Detach document"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {documentsToDelete.length > 0 && isEditMode && (
            <p className="text-xs text-red-600 mt-2">
              {documentsToDelete.length} document(s) will be removed when you save changes
            </p>
          )}
        </div>
      )}

      {/* File Replacement (only in edit mode) */}
      {isEditMode && (
        <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <p className="text-sm font-sans-modern font-semibold text-gray-700 mb-2">Replace Document</p>
          <p className="text-xs text-gray-600 mb-3">Upload a new file to replace the current submission document (max 10MB)</p>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".doc,.docx,.pdf,.txt,image/*"
            className="w-full text-sm"
            disabled={uploadingFile}
          />
          {uploadingFile && (
            <p className="text-sm text-blue-600 mt-2">Uploading file...</p>
          )}
          {replacementFile && !uploadingFile && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>File uploaded: {replacementFile.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
