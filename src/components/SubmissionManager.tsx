import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  Upload, 
  Check, 
  X, 
  Eye, 
  Edit, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Palette,
  BookOpen,
  Newspaper,
  MessageSquare
} from 'lucide-react';

interface SubmissionManagerProps {
  authToken: string;
  onUpdate: () => void;
}

export function SubmissionManager({ authToken, onUpdate }: SubmissionManagerProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [editorNotes, setEditorNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [contentTypes, setContentTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [contributorStatuses, setContributorStatuses] = useState<Array<{ value: string; label: string }>>([]);

  const [manualSubmission, setManualSubmission] = useState({
    type: '',
    title: '',
    content: '',
    fileUrl: '',
    authorName: '',
    authorEmail: '',
    contributorStatus: ''
  });

  useEffect(() => {
    fetchSubmissions();
    fetchIssues();
    fetchContentTypes();
    fetchContributorStatuses();
  }, []);

  const fetchContentTypes = async () => {
    try {
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
          label: t.label
        }));
        setContentTypes(types);
        
        // Set first type as default for manual submission
        if (types.length > 0 && !manualSubmission.type) {
          setManualSubmission(prev => ({ ...prev, type: types[0].value }));
        }
      }
    } catch (err) {
      console.error('Error fetching content types:', err);
      // Fallback to default types
      setContentTypes([
        { value: 'writing', label: 'Writing' },
        { value: 'poem', label: 'Poem' }
      ]);
      setManualSubmission(prev => ({ ...prev, type: 'writing' }));
    }
  };

  const fetchContributorStatuses = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/contributor-statuses`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      const data = await response.json();

      if (response.ok && data.statuses) {
        const statuses = data.statuses.map((s: any) => (({
          value: s.value,
          label: s.label
        })));
        setContributorStatuses(statuses);
        
        // Set first status as default for manual submission
        if (statuses.length > 0 && !manualSubmission.contributorStatus) {
          setManualSubmission(prev => ({ ...prev, contributorStatus: statuses[0].value }));
        }
      }
    } catch (err) {
      console.error('Error fetching contributor statuses:', err);
      // Fallback to default statuses
      setContributorStatuses([
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]);
    }
  };

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
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/${selectedSubmission.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            status: selectedStatus || selectedSubmission.status,
            editorNotes,
            issueId: selectedIssue || selectedSubmission.issueId
          })
        }
      );

      if (response.ok) {
        setSelectedSubmission(null);
        setEditorNotes('');
        setSelectedStatus('');
        setSelectedIssue('');
        fetchSubmissions();
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating submission:', err);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(manualSubmission)
        }
      );

      if (response.ok) {
        setManualSubmission({ 
          type: contentTypes.length > 0 ? contentTypes[0].value : '', 
          title: '', 
          content: '', 
          fileUrl: '',
          authorName: '',
          authorEmail: '',
          contributorStatus: ''
        });
        setShowManualUpload(false);
        fetchSubmissions();
        onUpdate();
      }
    } catch (err) {
      console.error('Error uploading submission:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'photo' || type === 'art' || type === 'crafts') return <ImageIcon className="w-4 h-4" />;
    if (type === 'poem' || type === 'writing' || type === 'story') return <FileText className="w-4 h-4" />;
    return <Palette className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-700',
      acknowledged: 'bg-blue-100 text-blue-700',
      reviewing: 'bg-purple-100 text-purple-700',
      editing: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      published: 'bg-green-200 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getContributorStatusLabel = (value: string) => {
    const status = contributorStatuses.find(s => s.value === value);
    return status ? status.label : (value || 'Not Specified');
  };

  const filteredSubmissions = submissions.filter(s => 
    filterStatus === 'all' || s.status === filterStatus
  );

  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl">Submissions</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="reviewing">Reviewing</option>
            <option value="editing">Editing</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button
          onClick={() => setShowManualUpload(!showManualUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Manual Upload
        </button>
      </div>

      {showManualUpload && (
        <form onSubmit={handleManualUpload} className="mb-6 p-6 bg-purple-50 rounded-lg">
          <h3 className="text-lg mb-4">Upload Submission Manually</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Type</label>
              <select
                value={manualSubmission.type}
                onChange={(e) => setManualSubmission({ ...manualSubmission, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                required
              >
                {contentTypes.length === 0 ? (
                  <option value="">Loading types...</option>
                ) : (
                  contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Title</label>
              <input
                type="text"
                value={manualSubmission.title}
                onChange={(e) => setManualSubmission({ ...manualSubmission, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">Content</label>
              <textarea
                value={manualSubmission.content}
                onChange={(e) => setManualSubmission({ ...manualSubmission, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-2 text-gray-700">File URL (optional)</label>
              <input
                type="url"
                value={manualSubmission.fileUrl}
                onChange={(e) => setManualSubmission({ ...manualSubmission, fileUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Author Name</label>
              <input
                type="text"
                value={manualSubmission.authorName}
                onChange={(e) => setManualSubmission({ ...manualSubmission, authorName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="Leave empty for anonymous"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Author Email</label>
              <input
                type="email"
                value={manualSubmission.authorEmail}
                onChange={(e) => setManualSubmission({ ...manualSubmission, authorEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                placeholder="Leave empty for anonymous"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Contributor Status</label>
              <select
                value={manualSubmission.contributorStatus}
                onChange={(e) => setManualSubmission({ ...manualSubmission, contributorStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="">None</option>
                {contributorStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Upload Submission
            </button>
            <button
              type="button"
              onClick={() => setShowManualUpload(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-gray-700">Title</th>
                <th className="text-left py-3 px-4 text-gray-700">Author</th>
                <th className="text-left py-3 px-4 text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-gray-700">Issue</th>
                <th className="text-left py-3 px-4 text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(submission.type)}
                      <span className="text-sm">{submission.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{submission.title}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {submission.authorName || <span className="italic text-gray-400">Anonymous</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {submission.issueId ? 
                      issues.find(i => i.id === submission.issueId)?.title || 'Unknown' 
                      : 'None'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setEditorNotes(submission.editorNotes || '');
                        setSelectedStatus(submission.status);
                        setSelectedIssue(submission.issueId || '');
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No submissions found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl mb-4">Review Submission</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="text-lg">{selectedSubmission.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Author</p>
                  {selectedSubmission.authorName ? (
                    <p>{selectedSubmission.authorName} ({getContributorStatusLabel(selectedSubmission.contributorStatus)})</p>
                  ) : (
                    <p className="italic text-gray-400">Anonymous</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="capitalize">{selectedSubmission.type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Content</p>
                  <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                    {selectedSubmission.content || 'No content'}
                  </div>
                </div>

                {selectedSubmission.fileUrl && (
                  <div>
                    <p className="text-sm text-gray-600">File</p>
                    <a 
                      href={selectedSubmission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      View file
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="pending">Pending</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="editing">Editing</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Assign to Issue</label>
                  <select
                    value={selectedIssue}
                    onChange={(e) => setSelectedIssue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="">No Issue</option>
                    {issues.filter(i => i.status === 'draft').map(issue => (
                      <option key={issue.id} value={issue.id}>
                        {issue.title} ({issue.month}/{issue.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Editor Notes</label>
                  <textarea
                    value={editorNotes}
                    onChange={(e) => setEditorNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    placeholder="Add notes for the author..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateSubmission}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Update Submission
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}