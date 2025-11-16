import { useState } from 'react';
import { Upload, X, Eye, Download, FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { PDFViewer, PDFPreviewInline } from './PDFViewer';
import { projectId } from '../utils/supabase/info';

interface Document {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  type: string;
  metadata?: {
    title?: string;
    description?: string;
    pageNumber?: number;
  };
}

interface MultiDocumentUploadProps {
  submissionId: string;
  authToken: string;
  initialDocuments?: Document[];
  onDocumentsChange: (documents: Document[]) => void;
}

export function MultiDocumentUpload({
  submissionId,
  authToken,
  initialDocuments = [],
  onDocumentsChange
}: MultiDocumentUploadProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type) && !allowedImageTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document, text file, or image (JPG, PNG, GIF, WebP).');
      return;
    }

    // Check file size (10MB for documents, 5MB for images)
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      alert(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);

    try {
      console.log('=== Starting document upload ===');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Auth token length:', authToken?.length || 0);
      console.log('Auth token preview:', authToken?.substring(0, 30) + '...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isImage ? 'image' : 'document');

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

      console.log('Upload response status:', response.status);
      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (response.ok && data.url) {
        const newDocument: Document = {
          id: crypto.randomUUID(),
          url: data.url,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          type: file.type
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        onDocumentsChange(updatedDocuments);

        // Auto-expand inline preview for immediate viewing
        if (file.type === 'application/pdf') {
          setExpandedPreviews(prev => new Set([...prev, newDocument.id]));
        }
      } else {
        // Handle authentication errors specifically
        if (response.status === 401 || data.code === 401) {
          const errorMsg = data.message || data.details || 'Authentication failed';
          const hint = data.hint || 'Try logging out and logging back in';
          
          console.error('Document upload failed - Authentication error:', {
            status: response.status,
            error: data.error,
            message: data.message,
            details: data.details,
            data
          });
          
          // Force logout and reload if JWT is invalid or expired
          if (errorMsg.toLowerCase().includes('jwt') || errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid')) {
            alert(`❌ Session Expired\n\nYour login session has expired. You will be logged out and need to log in again.\n\nClick OK to continue.`);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }
          
          alert(`❌ Authentication Error\n\n${errorMsg}\n\n💡 ${hint}`);
        } else {
          throw new Error(data.error || data.message || 'Upload failed');
        }
      }
    } catch (err: any) {
      console.error('Document upload error:', err);
      if (!err.message.includes('Authentication')) {
        alert('Failed to upload file: ' + err.message);
      }
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const updateDocumentMetadata = (docId: string, metadata: any) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === docId ? { ...doc, metadata: { ...doc.metadata, ...metadata } } : doc
    );
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const togglePreview = (docId: string) => {
    setExpandedPreviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
        <div className="flex flex-col items-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {documents.length === 0 ? 'Upload Document' : 'Add Another Document'}
            </span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt,image/*"
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PDF, Word, Text, or Image • Max {documents.length === 0 || documents[0]?.type.startsWith('image') ? '5' : '10'}MB
          </p>
          {uploading && (
            <p className="text-sm text-purple-600 mt-2 animate-pulse">Uploading...</p>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Uploaded Documents ({documents.length})
          </h4>
          
          {/* Magazine Tip */}
          <div className="bg-gradient-to-r from-amber-50 to-purple-50 border-2 border-amber-300 rounded-lg px-3 py-2.5">
            <p className="text-xs text-gray-800">
              <span className="font-bold text-amber-800">📸 For Best Magazine Appearance:</span> Upload page screenshots as <strong>JPG or PNG images</strong> instead of PDFs for a true glossy magazine look!
            </p>
          </div>
          
          <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-start gap-2">
            <Eye className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> Click the preview button or expand the PDF below to view content and add accurate titles/descriptions
            </span>
          </p>
          
          {documents.map((doc, index) => (
            <div key={doc.id} className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              {/* Document Header */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Document Preview Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-200">
                    {doc.type === 'application/pdf' ? (
                      <span className="text-xs font-bold text-purple-700">PDF</span>
                    ) : doc.type.startsWith('image/') ? (
                      <span className="text-xs font-bold text-blue-700">IMG</span>
                    ) : (
                      <FileText className="w-6 h-6 text-gray-600" />
                    )}
                  </div>

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                        Page {index + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.fileName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                    </p>

                    {/* Optional Metadata */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="📝 Title (e.g., 'Introduction to Climate Change')"
                        value={doc.metadata?.title || ''}
                        onChange={(e) => updateDocumentMetadata(doc.id, { title: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="💬 Description (e.g., 'Student perspectives on environmental action')"
                        value={doc.metadata?.description || ''}
                        onChange={(e) => updateDocumentMetadata(doc.id, { description: e.target.value })}
                        className="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    {doc.type === 'application/pdf' && (
                      <>
                        <button
                          onClick={() => togglePreview(doc.id)}
                          className="p-2 hover:bg-purple-50 rounded transition-colors border border-purple-200"
                          title={expandedPreviews.has(doc.id) ? "Hide Preview" : "Show Preview"}
                        >
                          {expandedPreviews.has(doc.id) ? (
                            <ChevronUp className="w-4 h-4 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-600" />
                          )}
                        </button>
                        <button
                          onClick={() => setViewingDocument(doc)}
                          className="p-2 hover:bg-purple-50 rounded transition-colors"
                          title="Open Full Preview"
                        >
                          <Eye className="w-4 h-4 text-purple-600" />
                        </button>
                      </>
                    )}
                    
                    <a
                      href={doc.url}
                      download={doc.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-blue-50 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                    </a>
                    
                    <button
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline PDF Preview - Expandable */}
              {doc.type === 'application/pdf' && expandedPreviews.has(doc.id) && (
                <div className="border-t-2 border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      PDF Preview - View content to add accurate information
                    </p>
                    <button
                      onClick={() => setViewingDocument(doc)}
                      className="text-xs text-purple-600 hover:text-purple-700 underline"
                    >
                      Open in full viewer
                    </button>
                  </div>
                  <div className="bg-white rounded border border-gray-300 overflow-hidden">
                    <iframe
                      src={`${doc.url}#toolbar=0&navpanes=0`}
                      className="w-full"
                      style={{ height: '500px' }}
                      title={doc.fileName}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingDocument && viewingDocument.type === 'application/pdf' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <PDFViewer
              url={viewingDocument.url}
              fileName={viewingDocument.fileName}
              onClose={() => setViewingDocument(null)}
              showControls={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
