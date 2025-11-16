import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { MessageSquare, Check, X, AlertTriangle } from 'lucide-react';

interface CommentModerationProps {
  authToken: string;
  onUpdate: () => void;
}

export function CommentModeration({ authToken, onUpdate }: CommentModerationProps) {
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingComments();
    fetchSubmissions();
  }, []);

  const fetchPendingComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/comments-pending`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPendingComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching pending comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/comments/${commentId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        fetchPendingComments();
        onUpdate();
      }
    } catch (err) {
      console.error('Error approving comment:', err);
    }
  };

  const getSubmissionTitle = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    return submission ? submission.title : 'Unknown Submission';
  };

  if (loading) {
    return <div className="text-center py-12">Loading comments...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl">Comment Moderation</h2>
        {pendingComments.length > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            {pendingComments.length} pending
          </span>
        )}
      </div>

      {pendingComments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl mb-2">All caught up!</h3>
          <p className="text-gray-600">No comments waiting for moderation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-sm text-gray-500">({comment.userRole})</span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    On: <span className="font-medium">{getSubmissionTitle(comment.submissionId)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                    Pending Review
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApproveComment(comment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve Comment
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject Comment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 mb-1">Moderation Guidelines</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Teacher comments are automatically approved and visible immediately</li>
              <li>• Student comments require approval before being visible to others</li>
              <li>• Students can see their own pending comments but not those from other students</li>
              <li>• Review comments for appropriateness, relevance, and respectful language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
