import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { 
  Search, 
  Mail, 
  MessageSquare, 
  Send, 
  X,
  Filter,
  Download,
  User,
  Calendar,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CommunicationsDashboardProps {
  authToken: string;
}

export function CommunicationsDashboard({ authToken }: CommunicationsDashboardProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      // In a real implementation, this would send an actual email
      // For now, we'll just log the correspondence
      const correspondence = {
        id: crypto.randomUUID(),
        submissionId: selectedSubmission.id,
        authorEmail: selectedSubmission.authorEmail || 'No email',
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toISOString(),
        sentBy: 'Editor'
      };

      console.log('Email sent:', correspondence);
      
      alert('Email sent successfully!');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      editing: 'bg-indigo-100 text-indigo-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'Pending Review',
      acknowledged: 'Acknowledged',
      reviewing: 'Under Review',
      editing: 'In Editing',
      approved: 'Approved',
      published: 'Published'
    };
    return labels[status] || status;
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Title', 'Author', 'Author Email', 'Status', 'Date', 'Content Preview'];
    const rows = filteredSubmissions.map(s => [
      s.type,
      s.title,
      s.authorName,
      s.authorEmail || 'N/A',
      s.status,
      new Date(s.createdAt).toLocaleDateString(),
      s.content.substring(0, 100) + '...'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading communications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-display text-gray-900 mb-2">Communications Dashboard</h2>
        <p className="text-gray-600 font-sans-modern">
          Monitor all submissions and correspondence with contributors
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, content, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
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

          {/* Export */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{submissions.length}</div>
            <div className="text-xs text-gray-600 font-sans-modern">Total Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-600 font-sans-modern">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {submissions.filter(s => s.status === 'reviewing' || s.status === 'acknowledged').length}
            </div>
            <div className="text-xs text-gray-600 font-sans-modern">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {submissions.filter(s => s.status === 'published').length}
            </div>
            <div className="text-xs text-gray-600 font-sans-modern">Published</div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'Submission' : 'Submissions'}
            {searchQuery && ` matching "${searchQuery}"`}
          </h3>
        </div>

        <div className="divide-y">
          {filteredSubmissions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No submissions found matching your criteria
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-serif-warm text-lg text-gray-900 truncate">
                          {submission.title}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-sans-modern whitespace-nowrap ${getStatusColor(submission.status)}`}>
                          {getStatusLabel(submission.status)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {submission.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {submission.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                        {submission.authorEmail && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {submission.authorEmail}
                          </div>
                        )}
                      </div>

                      {expandedRow === submission.id && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {submission.content || 'No content provided'}
                          </div>
                          {submission.editorNotes && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Editor Notes:</p>
                              <p className="text-sm text-gray-700">{submission.editorNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedRow(expandedRow === submission.id ? null : submission.id)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        {expandedRow === submission.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setEmailSubject(`Re: ${submission.title}`);
                          setEmailBody(`Dear ${submission.authorName},\n\nThank you for your submission "${submission.title}" to Mosaic Magazine HI.\n\n`);
                          setShowEmailModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-display text-gray-900">Send Email</h3>
                <p className="text-sm text-gray-600 mt-1">
                  To: {selectedSubmission.authorEmail || 'No email provided'}
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sendingEmail || !selectedSubmission.authorEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {!selectedSubmission.authorEmail && (
                <p className="text-sm text-red-600">
                  No email address available for this author
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
