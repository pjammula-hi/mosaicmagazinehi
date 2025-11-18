import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BookOpen, Plus, Eye, Edit, Send, Calendar } from 'lucide-react';
import { IssueEditor } from './IssueEditor';

interface IssueManagerProps {
  authToken: string;
  onUpdate: () => void;
}

export function IssueManager({ authToken, onUpdate }: IssueManagerProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [editingIssue, setEditingIssue] = useState<any>(null);
  
  const [newIssue, setNewIssue] = useState({
    title: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    number: '',
    volume: '',
    coverImageUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchIssues();
    fetchSubmissions();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      console.log('[IssueManager] Fetching issues...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      console.log('[IssueManager] Response:', { status: response.status, data });
      
      if (response.ok) {
        setIssues(data.issues || []);
      } else {
        console.error('[IssueManager] Error fetching issues:', data.error, data.details);
        alert(`Failed to load issues: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('[IssueManager] Network error fetching issues:', err);
      alert('Network error: Unable to connect to server.');
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

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(newIssue)
        }
      );

      if (response.ok) {
        setNewIssue({
          title: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          number: '',
          volume: '',
          coverImageUrl: '',
          description: ''
        });
        setShowCreateForm(false);
        fetchIssues();
        onUpdate();
      }
    } catch (err) {
      console.error('Error creating issue:', err);
    }
  };

  const handlePublishIssue = async (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    const isRePublish = issue?.status === 'published';
    
    const message = isRePublish 
      ? 'Re-publish this issue? This will update all accepted submissions to published status.'
      : 'Publish this issue? This will make it visible to all readers and update all accepted submissions to published status.';
    
    if (!confirm(message)) {
      return;
    }

    try {
      console.log('[IssueManager] Publishing issue:', issueId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issueId}/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      console.log('[IssueManager] Publish response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('[IssueManager] Publish result:', result);
        
        // Close any open modals
        setSelectedIssue(null);
        
        // Refresh data
        await fetchIssues();
        await fetchSubmissions();
        onUpdate();
        
        // Show success message
        alert(`Issue published successfully! ${result.updatedSubmissions || 0} submissions updated to published status.`);
      } else {
        // Try to parse error response
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          console.error('[IssueManager] Publish error:', error);
          errorMessage = error.error || error.message || 'Unknown error';
        } catch (parseErr) {
          // If response is not JSON (e.g., HTML 404 page), get text
          const text = await response.text();
          console.error('[IssueManager] Non-JSON error response:', text);
          errorMessage = `Server error (${response.status})`;
        }
        alert(`Failed to publish issue: ${errorMessage}`);
      }
    } catch (err) {
      console.error('[IssueManager] Error publishing issue:', err);
      alert('An error occurred while publishing the issue. Please try again.');
    }
  };

  const getIssueSubmissions = (issueId: string) => {
    return submissions.filter(s => s.issueId === issueId && s.status !== 'deleted');
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  if (loading) {
    return <div className="text-center py-12">Loading issues...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Magazine Issues</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateIssue} className="mb-6 p-6 bg-purple-50 rounded-lg">
          <h3 className="text-lg mb-4">Create New Issue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">Issue Title</label>
              <input
                type="text"
                value={newIssue.title}
                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., Spring Edition 2024"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Issue Number</label>
              <input
                type="number"
                value={newIssue.number}
                onChange={(e) => setNewIssue({ ...newIssue, number: parseInt(e.target.value) || '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Volume</label>
              <input
                type="number"
                value={newIssue.volume}
                onChange={(e) => setNewIssue({ ...newIssue, volume: parseInt(e.target.value) || '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Month</label>
              <select
                value={newIssue.month}
                onChange={(e) => setNewIssue({ ...newIssue, month: parseInt(e.target.value) })}
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
                value={newIssue.year}
                onChange={(e) => setNewIssue({ ...newIssue, year: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">Cover Image URL (optional)</label>
              <input
                type="url"
                value={newIssue.coverImageUrl}
                onChange={(e) => setNewIssue({ ...newIssue, coverImageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">Description</label>
              <textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="Describe this issue..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Issue
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => {
          const issueSubmissions = getIssueSubmissions(issue.id);
          const approvedCount = issueSubmissions.filter(s => s.status === 'approved').length;
          const publishedCount = issueSubmissions.filter(s => s.status === 'published').length;

          return (
            <div key={issue.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {issue.coverImageUrl ? (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-purple-300" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {getMonthName(issue.month)} {issue.year}
                  </span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    issue.status === 'published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <h3 className="text-xl mb-2">{issue.title}</h3>
                
                {issue.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{issue.description}</p>
                )}

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total Submissions:</span>
                    <span className="font-medium">{issueSubmissions.length}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium text-green-600">{approvedCount}</span>
                  </div>
                  {issue.status === 'published' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Published:</span>
                      <span className="font-medium text-blue-600">{publishedCount}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedIssue(issue)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    
                    <button
                      onClick={() => setEditingIssue(issue)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  
                  {issue.status === 'draft' ? (
                    <button
                      onClick={() => handlePublishIssue(issue.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublishIssue(issue.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Re-publish to update submission statuses"
                    >
                      <Send className="w-4 h-4" />
                      Re-publish
                    </button>
                  )}
                </div>

                {issue.publishedAt && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Published {new Date(issue.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {issues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No issues created yet</p>
          <p className="text-sm">Create your first magazine issue to get started!</p>
        </div>
      )}

      {/* Edit Issue Modal */}
      {editingIssue && (
        <IssueEditor
          issue={editingIssue}
          authToken={authToken}
          onClose={() => setEditingIssue(null)}
          onUpdate={() => {
            fetchIssues();
            onUpdate();
          }}
        />
      )}

      {/* View Issue Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl mb-2">{selectedIssue.title}</h3>
                  <p className="text-gray-600">
                    {getMonthName(selectedIssue.month)} {selectedIssue.year}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded ${
                  selectedIssue.status === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedIssue.status}
                </span>
              </div>

              {selectedIssue.description && (
                <div className="mb-6">
                  <p className="text-gray-700">{selectedIssue.description}</p>
                </div>
              )}

              <h4 className="text-xl mb-4">Submissions in this Issue</h4>
              
              <div className="space-y-3 mb-6">
                {getIssueSubmissions(selectedIssue.id).map((submission) => (
                  <div key={submission.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium">{submission.title}</h5>
                        <p className="text-sm text-gray-600">
                          by {submission.authorName} • {submission.type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        submission.status === 'published' ? 'bg-green-100 text-green-700' :
                        submission.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                ))}

                {getIssueSubmissions(selectedIssue.id).length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No submissions assigned to this issue yet
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedIssue(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
