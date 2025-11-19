import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  ArrowLeft, 
  Calendar, 
  MessageSquare, 
  Send,
  User,
  FileText,
  Image as ImageIcon,
  Check,
  Clock,
  BookOpen,
  List
} from 'lucide-react';
import { PDFPageRenderer } from './PDFPageRenderer';
import { GeometricMosaicLogo } from './logos/MosaicLogos';
import { MagazinePageFlipper } from './MagazinePageFlipper';

interface IssueViewerProps {
  issue: any;
  user: any;
  authToken: string;
  onBack: () => void;
}

export function IssueViewer({ issue, user, authToken, onBack }: IssueViewerProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'magazine' | 'submissions'>('magazine'); // Default to magazine view

  // Helper function to check if a URL is an image (not a PDF or other document)
  const isImageUrl = (url: string | undefined) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) && !lowerUrl.includes('.pdf');
  };

  // Helper function to check if a URL is a PDF
  const isPdfUrl = (url: string | undefined) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  useEffect(() => {
    fetchSubmissions();
    fetchPages();
  }, [issue.id]);

  useEffect(() => {
    if (selectedSubmission) {
      fetchComments(selectedSubmission.id);
    }
  }, [selectedSubmission]);

  const fetchSubmissions = async () => {
    setLoading(true);
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
          (s: any) => s.issueId === issue.id && s.status === 'published'
        ) || [];
        setSubmissions(issueSubmissions);
        
        // Auto-select first submission if available
        if (issueSubmissions.length > 0) {
          setSelectedSubmission(issueSubmissions[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}/pages`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPages(data.pages || []);
        // If pages exist, default to magazine view
        if (data.pages && data.pages.length > 0) {
          setViewMode('magazine');
        } else {
          // If no pages, default to submissions view
          setViewMode('submissions');
        }
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    }
  };

  const fetchComments = async (submissionId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/comments/${submissionId}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedSubmission) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            submissionId: selectedSubmission.id,
            content: newComment
          })
        }
      );

      if (response.ok) {
        setNewComment('');
        fetchComments(selectedSubmission.id);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'photo' || type === 'art' || type === 'crafts') return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const groupSubmissionsByType = () => {
    const grouped: any = {};
    submissions.forEach(sub => {
      if (!grouped[sub.type]) {
        grouped[sub.type] = [];
      }
      grouped[sub.type].push(sub);
    });
    return grouped;
  };

  const groupedSubmissions = groupSubmissionsByType();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issues
        </button>

        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg border border-purple-100/50 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-lg">{getMonthName(issue.month)} {issue.year}</span>
              {issue.number && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-lg font-medium">Issue #{issue.number}</span>
                </>
              )}
            </div>
            <GeometricMosaicLogo size={80} />
          </div>

          <h1 className="text-4xl mb-4 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">{issue.title}</h1>
          
          {issue.description && (
            <p className="text-gray-700 text-lg mb-4">{issue.description}</p>
          )}

          {issue.coverImageUrl && (
            <div className="mt-6 rounded-xl overflow-hidden shadow-md">
              <img 
                src={issue.coverImageUrl} 
                alt={issue.title} 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Table of Contents - Editor-defined */}
          {issue.tableOfContents && issue.tableOfContents.length > 0 && (
            <div className="mt-6 border-t border-purple-200 pt-6">
              <h2 className="text-2xl mb-4">Table of Contents</h2>
              <div className="space-y-2">
                {issue.tableOfContents.map((entry: any) => (
                  <div key={entry.id} className="flex items-baseline justify-between py-2 border-b border-gray-200">
                    <div className="flex-1">
                      <span className="font-medium">{entry.title}</span>
                      {entry.author && (
                        <span className="text-gray-600 text-sm ml-2">by {entry.author}</span>
                      )}
                      {entry.category && (
                        <span className="text-purple-600 text-xs ml-2">• {entry.category}</span>
                      )}
                    </div>
                    {entry.page && (
                      <span className="text-gray-500 ml-4">{entry.page}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Mode Toggle - Only show if both pages and submissions exist */}
      {!loading && pages.length > 0 && submissions.length > 0 && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl shadow-md border-4 border-black p-1">
            <button
              onClick={() => setViewMode('magazine')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                viewMode === 'magazine'
                  ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Magazine View
            </button>
            <button
              onClick={() => setViewMode('submissions')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                viewMode === 'submissions'
                  ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
              Browse Submissions
            </button>
          </div>
        </div>
      )}

      {/* Magazine Page Flipper View */}
      {viewMode === 'magazine' && pages.length > 0 && (
        <MagazinePageFlipper
          pages={pages}
          issueName={`${issue.title} - ${getMonthName(issue.month)} ${issue.year}`}
        />
      )}

      {/* Submissions View */}
      {viewMode === 'submissions' && (
        <>
          {loading ? (
            <div className="text-center py-12">Loading content...</div>
          ) : submissions.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No published content in this issue yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Table of Contents */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-amber-50/30 rounded-2xl shadow-lg p-5 sticky top-6 border border-purple-100/50 backdrop-blur-sm">
                  <h2 className="text-lg mb-4 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">Contents</h2>
                  
                  <div className="space-y-3">
                    {Object.entries(groupedSubmissions).map(([type, subs]: [string, any]) => (
                      <div key={type}>
                        <h3 className="text-xs uppercase tracking-wider text-purple-600 mb-2 capitalize font-medium">
                          {type}
                        </h3>
                        <div className="space-y-1">
                          {subs.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => setSelectedSubmission(sub)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                                selectedSubmission?.id === sub.id
                                  ? 'bg-gradient-to-r from-purple-100 to-amber-100 text-purple-900 shadow-md scale-105'
                                  : 'hover:bg-white/60 text-gray-700 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {getTypeIcon(sub.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs truncate font-medium">{sub.title}</p>
                                  <p className="text-xs text-gray-500 truncate">by {sub.authorName}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Viewer */}
              <div className="lg:col-span-3">
                {selectedSubmission ? (
                  <div className="bg-gradient-to-br from-white via-purple-50/20 to-amber-50/20 rounded-2xl shadow-lg p-8 border border-purple-100/50 backdrop-blur-sm">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-amber-100 text-purple-700 rounded-full text-xs uppercase font-medium shadow-sm">
                          {selectedSubmission.type}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl mb-3 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">{selectedSubmission.title}</h2>
                      
                      <div className="flex items-center gap-2 text-gray-700 mb-6 font-medium">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>by {selectedSubmission.authorName}</span>
                      </div>

                      {/* Main Content Display */}
                      
                      {/* Priority 1: Display Documents First (as primary content for document-based submissions) */}
                      {selectedSubmission.documents && selectedSubmission.documents.length > 0 && (
                        <div className="mb-8">
                          <div className="space-y-8">
                            {selectedSubmission.documents.map((doc: any, index: number) => (
                              <div key={doc.id} className="border border-purple-200/50 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-purple-50/30 shadow-lg">

                                {/* Document Preview/Content */}
                                <div className="bg-gradient-to-br from-gray-50 to-purple-50/20 p-6">
                                  {doc.type?.startsWith('image/') ? (
                                    <div className="relative">
                                      {/* Page number badge for images */}
                                      {selectedSubmission.documents.length > 1 && (
                                        <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg z-10">
                                          {index + 1}
                                        </div>
                                      )}
                                      <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                                        <img 
                                          src={doc.url} 
                                          alt={doc.fileName}
                                          className="w-full h-auto"
                                        />
                                      </div>
                                    </div>
                                  ) : doc.type === 'application/pdf' ? (
                                    <PDFPageRenderer 
                                      url={doc.url}
                                      fileName={doc.fileName}
                                    />
                                  ) : (
                                    <div className="text-center py-8">
                                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                      <p className="text-gray-600">
                                        Document preview not available
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Priority 2: Display PDF from fileUrl if it's a PDF (and no documents array) */}
                      {isPdfUrl(selectedSubmission.fileUrl) && (!selectedSubmission.documents || selectedSubmission.documents.length === 0) && (
                        <div className="mb-8">
                          <div className="border border-purple-200/50 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-purple-50/30 shadow-lg">
                            {/* Document Header */}
                            <div className="bg-gradient-to-r from-purple-100/50 to-amber-100/50 px-6 py-4 border-b border-purple-200/50 backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-purple-300 shadow-sm">
                                  <span className="text-xs font-bold text-purple-700">PDF</span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-0.5">
                                    {selectedSubmission.title}
                                  </p>
                                  <p className="text-sm text-gray-600">PDF Document</p>
                                  <p className="text-sm text-purple-700 mt-1">
                                    <span className="text-gray-500">by</span> {selectedSubmission.authorName}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Document Preview/Content */}
                            <div className="bg-white p-6">
                              <PDFPageRenderer 
                                url={selectedSubmission.fileUrl}
                                fileName={selectedSubmission.title}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Priority 3: Display images if available (but not PDFs) */}
                      {isImageUrl(selectedSubmission.fileUrl) && (
                        <div className="mb-8">
                          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 p-2">
                            <img 
                              src={selectedSubmission.fileUrl} 
                              alt={selectedSubmission.title}
                              className="w-full h-auto rounded-lg"
                              onError={(e) => {
                                console.error('Image failed to load:', selectedSubmission.fileUrl);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {isImageUrl(selectedSubmission.imageUrl) && selectedSubmission.imageUrl !== selectedSubmission.fileUrl && (
                        <div className="mb-8">
                          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 p-2">
                            <img 
                              src={selectedSubmission.imageUrl} 
                              alt={selectedSubmission.title}
                              className="w-full h-auto rounded-lg"
                              onError={(e) => {
                                console.error('Image failed to load:', selectedSubmission.imageUrl);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Priority 4: Display text content */}
                      {selectedSubmission.content && (
                        <div className="prose prose-lg max-w-none mb-8">
                          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {selectedSubmission.content}
                          </div>
                        </div>
                      )}

                      {/* Empty Content Warning - Only show if truly nothing exists */}
                      {!selectedSubmission.content && 
                       !selectedSubmission.fileUrl && 
                       !selectedSubmission.imageUrl && 
                       (!selectedSubmission.documents || selectedSubmission.documents.length === 0) && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-md">
                          <div className="flex items-start gap-3">
                            <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-medium text-amber-900 mb-2">No Content Available</h4>
                              <p className="text-sm text-amber-700 mb-3">
                                This submission doesn't have any content, images, or documents attached yet.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="border-t-2 border-purple-200/50 pt-6 mt-6">
                      <h3 className="text-xl mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        Comments ({comments.length})
                      </h3>

                      {/* Comment Form */}
                      <form onSubmit={handleSubmitComment} className="mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-purple-400 bg-white/50 backdrop-blur-sm transition-all"
                          placeholder="Share your thoughts on this piece..."
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-600">
                            {user.role === 'teacher' 
                              ? 'Your comment will be visible immediately'
                              : 'Your comment will be reviewed before being published'}
                          </p>
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                          >
                            <Send className="w-4 h-4" />
                            Post Comment
                          </button>
                        </div>
                      </form>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-gradient-to-br from-purple-50/50 to-amber-50/50 rounded-xl p-4 border border-purple-100 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-200 to-amber-200 rounded-full flex items-center justify-center shadow-sm">
                                  <User className="w-4 h-4 text-purple-700" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{comment.userName}</p>
                                  <p className="text-xs text-gray-500 capitalize">{comment.userRole}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {comment.status === 'pending' && comment.userId === user.id && (
                                  <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                                    <Clock className="w-3 h-3" />
                                    Pending Review
                                  </span>
                                )}
                                {comment.status === 'approved' && (
                                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <Check className="w-3 h-3" />
                                    Approved
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        ))}

                        {comments.length === 0 && (
                          <p className="text-center py-8 text-gray-500">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg p-12 text-center text-gray-500 border border-purple-100/50">
                    Select an article from the contents to read
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}