import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  FileText, 
  MessageSquare, 
  BookOpen, 
  LogOut, 
  Plus,
  Check,
  X,
  Eye,
  Edit,
  Upload,
  Mail,
  Settings,
  Users
} from 'lucide-react';
import { EnhancedSubmissionManager } from './EnhancedSubmissionManager';
import { IssueManager } from './IssueManager';
import { CommentModeration } from './CommentModeration';
import { ReaderDashboard } from './ReaderDashboard';
import { CommunicationsDashboard } from './CommunicationsDashboard';
import { TypeManager } from './TypeManager';
import { ContributorStatusManager } from './ContributorStatusManager';
import { StackedTilesLogo } from './logos/MosaicLogos';

interface EditorDashboardProps {
  user: any;
  authToken: string;
  onLogout: () => void;
}

export function EditorDashboard({ user, authToken, onLogout }: EditorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submissions' | 'issues' | 'comments' | 'communications' | 'types' | 'contributors'>('submissions');
  const [showReaderView, setShowReaderView] = useState(false);
  const [stats, setStats] = useState({
    pendingSubmissions: 0,
    pendingComments: 0,
    totalIssues: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch submissions
      const submissionsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const submissionsData = await submissionsRes.json();
      const pendingSubmissions = submissionsData.submissions?.filter(
        (s: any) => s.status === 'pending'
      ).length || 0;

      // Fetch pending comments
      const commentsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/comments-pending`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const commentsData = await commentsRes.json();
      const pendingComments = commentsData.comments?.length || 0;

      // Fetch issues
      const issuesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const issuesData = await issuesRes.json();
      const totalIssues = issuesData.issues?.length || 0;

      setStats({ pendingSubmissions, pendingComments, totalIssues });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  if (showReaderView) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowReaderView(false)}
            className="text-purple-600 hover:text-purple-700"
          >
            ← Back to Editorial Dashboard
          </button>
        </div>
        <ReaderDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StackedTilesLogo size={60} />
              <div>
                <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Mosaic Magazine HI
                </h1>
                <p className="text-gray-600 text-sm">Editorial Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReaderView(true)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Reader View
              </button>
              <div className="text-right">
                <p className="text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending Submissions</p>
                  <p className="text-3xl mt-1">{stats.pendingSubmissions}</p>
                </div>
                <FileText className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending Comments</p>
                  <p className="text-3xl mt-1">{stats.pendingComments}</p>
                </div>
                <MessageSquare className="w-10 h-10 opacity-80" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Issues</p>
                  <p className="text-3xl mt-1">{stats.totalIssues}</p>
                </div>
                <BookOpen className="w-10 h-10 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submissions
                {stats.pendingSubmissions > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingSubmissions}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'issues'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Issues
              </div>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'comments'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comment Moderation
                {stats.pendingComments > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingComments}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('communications')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'communications'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Communications
              </div>
            </button>

            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'types'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Content Types
              </div>
            </button>

            <button
              onClick={() => setActiveTab('contributors')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'contributors'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Contributor Status
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'submissions' && (
          <EnhancedSubmissionManager authToken={authToken} onUpdate={fetchStats} />
        )}
        {activeTab === 'issues' && (
          <IssueManager authToken={authToken} onUpdate={fetchStats} />
        )}
        {activeTab === 'comments' && (
          <CommentModeration authToken={authToken} onUpdate={fetchStats} />
        )}
        {activeTab === 'communications' && (
          <CommunicationsDashboard authToken={authToken} />
        )}
        {activeTab === 'types' && (
          <TypeManager authToken={authToken} />
        )}
        {activeTab === 'contributors' && (
          <ContributorStatusManager authToken={authToken} />
        )}
      </div>
    </div>
  );
}
