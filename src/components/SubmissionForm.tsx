import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Send, FileText, Image, Palette, BookOpen, AlertCircle, Check, Upload, X, Newspaper, MessageSquare, Sparkles } from 'lucide-react';

interface SubmissionFormProps {
  user: any;
  authToken: string;
  onSubmitSuccess: () => void;
}

export function SubmissionForm({ user, authToken, onSubmitSuccess }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submissionTypes, setSubmissionTypes] = useState<Array<{ value: string; label: string; icon: any }>>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Icon mapping
  const iconMap: Record<string, any> = {
    FileText: <FileText className="w-5 h-5" />,
    BookOpen: <BookOpen className="w-5 h-5" />,
    Image: <Image className="w-5 h-5" />,
    Palette: <Palette className="w-5 h-5" />,
    Newspaper: <Newspaper className="w-5 h-5" />,
    MessageSquare: <MessageSquare className="w-5 h-5" />,
    Sparkles: <Sparkles className="w-5 h-5" />
  };

  useEffect(() => {
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/content-types`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok && data.types) {
        const types = data.types.map((t: any) => ({
          value: t.value,
          label: t.label,
          icon: iconMap[t.icon] || iconMap.FileText
        }));
        setSubmissionTypes(types);
        
        // Set first type as default
        if (types.length > 0 && !formData.type) {
          setFormData(prev => ({ ...prev, type: types[0].value }));
        }
      }
    } catch (err) {
      console.error('Error fetching content types:', err);
      // Fallback to default types if fetch fails
      const defaultTypes = [
        { value: 'writing', label: 'Writing', icon: iconMap.FileText },
        { value: 'poem', label: 'Poem', icon: iconMap.BookOpen }
      ];
      setSubmissionTypes(defaultTypes);
      setFormData(prev => ({ ...prev, type: 'writing' }));
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB for documents, 5MB for images)
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', isImage ? 'image' : 'document');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/upload-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formDataUpload
        }
      );

      const data = await response.json();
      
      if (response.ok && data.url) {
        setUploadedFile({ name: file.name, url: data.url });
        setFormData({ ...formData, fileUrl: data.url });
      } else {
        let errorMsg = data.message || data.error || data.details || 'Upload failed';
        if (response.status === 401) {
          errorMsg = data.message || 'Your session has expired. Please log out and log in again.';
          if (data.code === 401 && (data.details?.toLowerCase().includes('jwt') || data.details?.toLowerCase().includes('expired'))) {
            alert(errorMsg + '\n\nYou will be redirected to the login page.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }
        }
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      if (!err.message.includes('redirected')) {
        setError('Failed to upload file: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData({ ...formData, fileUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
      setFormData({ type: 'writing', title: '', content: '', fileUrl: '' });
      setUploadedFile(null);
      
      setTimeout(() => {
        onSubmitSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-3">Submission Received!</h2>
          <p className="text-gray-600 mb-2">
            Thank you for your contribution to Mosaic Magazine.
          </p>
          <p className="text-gray-600">
            Our editors will review your submission and you'll be notified of its status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl mb-2">Submit Your Work</h2>
        <p className="text-gray-600">
          Share your creativity with the Mosaic Magazine community
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm mb-3 text-gray-700">
              What would you like to submit?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {submissionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.type === type.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {type.icon}
                    <span className="text-sm">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm mb-2 text-gray-700">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Give your work a title"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm mb-2 text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-mono"
              placeholder={
                formData.type === 'photo' || formData.type === 'art' || formData.type === 'crafts'
                  ? 'Describe your artwork or provide context...'
                  : 'Write your content here...'
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'poem' && 'Tip: Line breaks will be preserved in your poem'}
              {formData.type === 'photo' && 'Describe your photo and the story behind it'}
              {formData.type === 'art' && 'Share the inspiration and meaning behind your artwork'}
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <label className="block text-sm mb-2 text-gray-700 font-medium">
              Attach Document or Image (Optional)
            </label>
            <p className="text-xs text-gray-600 mb-4">
              Upload a Word document, PDF, text file, or image (max 10MB for documents, 5MB for images)
            </p>
            
            {!uploadedFile ? (
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".doc,.docx,.pdf,.txt,image/*"
                  disabled={uploading}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer disabled:opacity-50"
                />
                {uploading && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                    <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading file...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white border border-amber-300 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">File attached</p>
                    <p className="text-xs text-gray-600">{uploadedFile.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Manual File URL (Alternative) */}
          <div>
            <label htmlFor="fileUrl" className="block text-sm mb-2 text-gray-700">
              Or paste a file URL (Optional)
            </label>
            <input
              id="fileUrl"
              type="url"
              value={uploadedFile ? '' : formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              disabled={uploadedFile !== null}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you have a file hosted elsewhere, you can paste the URL here
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong>
              <br />
              After you submit, our editorial team will:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
              <li>• Acknowledge receipt of your submission</li>
              <li>• Review and potentially edit your work</li>
              <li>• Assign it to an upcoming issue</li>
              <li>• Publish it when the issue goes live</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Submitting...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
