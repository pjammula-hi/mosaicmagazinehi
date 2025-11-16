import { useState } from 'react';
import { projectId } from '../utils/supabase/info';
import { 
  X, 
  FileText, 
  Image, 
  Upload, 
  Check, 
  AlertCircle,
  BookOpen,
  Palette,
  Mail,
  CheckCircle,
  Send
} from 'lucide-react';

interface SubmissionGuidelinesProps {
  user: any;
  authToken: string;
  onClose: () => void;
}

export function SubmissionGuidelines({ user, authToken, onClose }: SubmissionGuidelinesProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'writing',
    title: '',
    content: '',
    authorName: user?.fullName || '',
    authorEmail: user?.email || '',
    contributorStatus: 'student'
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submissionTypes = [
    { value: 'writing', label: 'Writing/Essay', icon: <FileText className="w-5 h-5" /> },
    { value: 'poem', label: 'Poetry', icon: <BookOpen className="w-5 h-5" /> },
    { value: 'story', label: 'Short Story', icon: <BookOpen className="w-5 h-5" /> },
    { value: 'photo', label: 'Photography', icon: <Image className="w-5 h-5" /> },
    { value: 'art', label: 'Visual Art', icon: <Palette className="w-5 h-5" /> },
    { value: 'crafts', label: 'Crafts', icon: <Palette className="w-5 h-5" /> },
    { value: 'reflection', label: 'Reflection', icon: <FileText className="w-5 h-5" /> },
    { value: 'news', label: 'News Article', icon: <FileText className="w-5 h-5" /> },
    { value: 'opinion', label: 'Opinion Piece', icon: <FileText className="w-5 h-5" /> }
  ];

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    setDocumentFile(file);
    setUploadingDoc(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Determine type based on file
      const type = file.type.startsWith('image/') ? 'image' : 'document';
      formData.append('type', type);

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
      
      console.log('File upload response:', response.status, data);

      if (response.ok && data.url) {
        setDocumentUrl(data.url);
      } else {
        let errorMsg = data.message || data.error || data.details || 'Upload failed';
        // Provide helpful message for auth errors
        if (response.status === 401) {
          console.error('Auth error details:', data);
          errorMsg = data.message || 'Your session has expired. Please log out and log in again.';
          // Optionally clear the local storage to force re-login
          if (data.code === 401 && (data.details?.toLowerCase().includes('jwt') || data.details?.toLowerCase().includes('expired'))) {
            alert(errorMsg + '\n\nYou will be redirected to the login page.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }
        }
        console.error('Document upload failed:', { status: response.status, error: errorMsg, data });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      // Don't show alert if we're already redirecting
      if (!err.message.includes('redirected')) {
        alert('Failed to upload file: ' + err.message);
      }
      setDocumentFile(null);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file must be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

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
      
      console.log('Image upload response:', response.status, data);

      if (response.ok && data.url) {
        setImageUrl(data.url);
      } else {
        let errorMsg = data.message || data.error || data.details || 'Upload failed';
        // Provide helpful message for auth errors
        if (response.status === 401) {
          console.error('Auth error details:', data);
          errorMsg = data.message || 'Your session has expired. Please log out and log in again.';
          // Optionally clear the local storage to force re-login
          if (data.code === 401 && (data.details?.toLowerCase().includes('jwt') || data.details?.toLowerCase().includes('expired'))) {
            alert(errorMsg + '\n\nYou will be redirected to the login page.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }
        }
        console.error('Image upload failed:', { status: response.status, error: errorMsg, data });
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      // Don't show alert if we're already redirecting
      if (!err.message.includes('redirected')) {
        alert('Failed to upload image: ' + err.message);
      }
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
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
          body: JSON.stringify({
            ...formData,
            fileUrl: documentUrl || imageUrl || '',
            imageUrl: imageUrl || '',
            status: 'pending'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-display mb-4">Submission Received!</h2>
          <p className="text-gray-600 mb-3">
            Thank you for your contribution to Mosaic Magazine HI.
          </p>
          <p className="text-gray-600 mb-6">
            Our editorial team will review your submission and notify you via email about its status within 2-3 weeks.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-sans-modern"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-amber-50 p-6 border-b z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display text-purple-900">Submit for Publication</h2>
              <p className="text-sm text-gray-600 mt-1 font-sans-modern">
                Share your work with the Mosaic Magazine HI community
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {!showForm ? (
            <div className="space-y-8">
              {/* Guidelines */}
              <div className="prose max-w-none">
                <h3 className="text-2xl font-display text-purple-900 mb-4">Submission Guidelines</h3>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-sans-modern font-semibold text-blue-900 mb-3">Welcome Contributors!</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Mosaic Magazine HI celebrates the diverse voices and talents of NYC Home Instruction students and teachers. 
                    We welcome submissions of writing, poetry, art, photography, and more. Your unique perspective matters!
                  </p>
                </div>

                <h4 className="text-xl font-sans-modern font-semibold mb-3">What We Accept</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Writing & Essays:</strong> Personal essays, creative nonfiction, feature articles (500-2000 words)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Poetry:</strong> All forms and styles welcome (up to 50 lines)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Short Stories:</strong> Fiction of all genres (up to 3000 words)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Visual Art:</strong> Digital or scanned images of drawings, paintings, mixed media (high resolution JPG or PNG)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Crafts:</strong> Photos of handmade projects, textile work, sculpture, ceramics, and other craft pieces (high resolution JPG or PNG)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Photography:</strong> Original photos (high resolution, properly credited if subjects are people)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>News & Opinion:</strong> Student perspectives on current events, school issues, community topics</span>
                  </li>
                </ul>

                <h4 className="text-xl font-sans-modern font-semibold mb-3 mt-6">Formatting Requirements</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Text submissions:</strong> Word documents (.doc, .docx), PDFs, or paste directly into the form</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Images:</strong> JPG, PNG, or GIF format, minimum 1200px wide for best quality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>File sizes:</strong> Documents up to 10MB, images up to 5MB</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Cell image:</strong> Optional featured image for magazine layout (recommended 800x600px)</span>
                  </li>
                </ul>

                <h4 className="text-xl font-sans-modern font-semibold mb-3 mt-6">Submission Process</h4>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span>Complete the submission form with your work details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span>Upload your document (if applicable) and a cell image (optional but recommended)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span>Submit and receive automatic email acknowledgement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <span>Our editorial team reviews submissions within 2-3 weeks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                    <span>You'll receive email notification about acceptance or decline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                    <span>Accepted submissions are published in the next available issue</span>
                  </li>
                </ol>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mt-6">
                  <h4 className="text-lg font-sans-modern font-semibold text-amber-900 mb-3">Important Notes</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>All submissions must be original work created by the submitter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>By submitting, you grant Mosaic Magazine HI permission to publish your work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>You retain copyright to your work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Editors may make minor edits for clarity, grammar, or space constraints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Submissions must be appropriate for a K-12 school publication</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mt-6">
                  <h4 className="text-lg font-sans-modern font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </h4>
                  <p className="text-gray-700 text-sm">
                    You'll receive email updates at: <strong>{user?.email || 'your registered email'}</strong>
                    <br />
                    Please ensure this email address is correct and check your inbox regularly.
                  </p>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-sans-modern text-lg flex items-center gap-3"
                >
                  <Upload className="w-5 h-5" />
                  Proceed to Submission Form
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setShowForm(false)}
                className="mb-6 text-purple-600 hover:text-purple-700 font-sans-modern flex items-center gap-2"
              >
                ← Back to Guidelines
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-display text-purple-900 mb-6">Submission Form</h3>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans-modern font-semibold text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-3">
                    Submission Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {submissionTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.type === type.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {type.icon}
                        <span className="text-sm font-sans-modern">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Enter your submission title..."
                  />
                </div>

                {/* Author Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={formData.authorEmail}
                      onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contributor Status */}
                <div>
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
                    Contributor Status *
                  </label>
                  <select
                    value={formData.contributorStatus}
                    onChange={(e) => setFormData({ ...formData, contributorStatus: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="hi-staff">HI Staff</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent font-serif-warm"
                    placeholder="Paste your text here or upload a document below..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can paste your text here OR upload a document file below
                  </p>
                </div>

                {/* Document Upload */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-3">
                    Upload Document or Image (Optional)
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your work as a Word document, PDF, or image file (JPG, PNG, GIF). Max 10MB.
                  </p>
                  <input
                    type="file"
                    onChange={handleDocumentUpload}
                    accept=".doc,.docx,.pdf,.txt,image/*"
                    className="w-full"
                    disabled={uploadingDoc}
                  />
                  {uploadingDoc && (
                    <p className="text-sm text-blue-600 mt-2">Uploading file...</p>
                  )}
                  {documentFile && !uploadingDoc && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>File uploaded: {documentFile.name}</span>
                    </div>
                  )}
                </div>

                {/* Cell Image Upload */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <label className="block text-sm font-sans-modern font-semibold text-gray-700 mb-3">
                    Upload Cell Image (Optional but Recommended)
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    This image will appear in the magazine grid layout. Best size: 800x600px (max 5MB)
                  </p>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="w-full"
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <p className="text-sm text-purple-600 mt-2">Uploading image...</p>
                  )}
                  {imageFile && !uploadingImage && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                        <Check className="w-4 h-4" />
                        <span>Image uploaded: {imageFile.name}</span>
                      </div>
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-purple-300"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-sans-modern"
                  >
                    Back to Guidelines
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingDoc || uploadingImage}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans-modern flex items-center gap-2"
                  >
                    {loading ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit for Publication
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
