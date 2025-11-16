import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  FileText, 
  MessageSquare, 
  BookOpen, 
  LogOut, 
  Plus,
  Zap,
  Flame,
  Star,
  Mail,
  Settings,
  Users,
  Eye,
  AlertCircle
} from 'lucide-react';
import { EnhancedSubmissionManager } from './EnhancedSubmissionManager';
import { IssueManager } from './IssueManager';
import { CommentModeration } from './CommentModeration';
import { ReaderDashboard } from './ReaderDashboard';
import { CommunicationsDashboard } from './CommunicationsDashboard';
import { TypeManager } from './TypeManager';
import { ContributorStatusManager } from './ContributorStatusManager';
import { BrutalButton, BrutalStat, BrutalHeader, BrutalCard, BrutalBadge } from './BrutalUI';

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
    totalIssues: 0,
    totalContributors: 0
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

      // Fetch users for contributor count
      const usersRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/users`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const usersData = await usersRes.json();
      const totalContributors = usersData.users?.filter(
        (u: any) => u.role === 'student' || u.role === 'teacher'
      ).length || 0;

      setStats({ pendingSubmissions, pendingComments, totalIssues, totalContributors });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  if (showReaderView) {
    return (
      <div>
        <div className="bg-gradient-to-r from-purple-400 to-pink-400 border-b-4 border-black px-6 py-4">
          <BrutalButton onClick={() => setShowReaderView(false)} variant="primary" size="sm">
            ← Back to Editor Zone
          </BrutalButton>
        </div>
        <ReaderDashboard user={user} authToken={authToken} onLogout={onLogout} />
      </div>
    );
  }

  const tabs = [
    { id: 'submissions', label: 'Submissions', icon: FileText, badge: stats.pendingSubmissions },
    { id: 'issues', label: 'Issues', icon: BookOpen, badge: 0 },
    { id: 'comments', label: 'Comments', icon: MessageSquare, badge: stats.pendingComments },
    { id: 'communications', label: 'Communications', icon: Mail, badge: 0 },
    { id: 'types', label: 'Content Types', icon: Settings, badge: 0 },
    { id: 'contributors', label: 'Contributors', icon: Users, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-gradient-to-r from-purple-400 to-pink-400 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black border-4 border-black rotate-3 flex items-center justify-center">
                <Zap className="w-7 h-7 text-yellow-400" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-black tracking-tight" style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase' }}>
                  MOSAIC
                </h1>
                <p className="text-black" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
                  MAGAZINE HI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BrutalButton onClick={() => setShowReaderView(true)} variant="secondary" size="sm" icon={Eye}>
                Reader View
              </BrutalButton>
              <div 
                className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black -rotate-6 flex items-center justify-center cursor-pointer brutal-shadow-sm brutal-hover"
                onClick={onLogout}
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-black" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Page Title */}
        <div className="mb-8">
          <BrutalHeader color="yellow" rotate={-1}>
            EDITOR ZONE
          </BrutalHeader>
          
          {stats.pendingSubmissions > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Flame className="w-6 h-6 text-red-500" />
              <p className="text-black font-black" style={{ fontSize: '16px' }}>
                {stats.pendingSubmissions} SUBMISSION{stats.pendingSubmissions !== 1 ? 'S' : ''} NEED YOUR ATTENTION!
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-gray-700 font-bold">
              Welcome back, {user.fullName}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <BrutalStat 
            label="SUBMISSIONS" 
            value={stats.pendingSubmissions} 
            color="cyan" 
            icon={FileText}
            rotate={-2}
          />
          <BrutalStat 
            label="PENDING COMMENTS" 
            value={stats.pendingComments} 
            color="yellow" 
            icon={MessageSquare}
            rotate={2}
          />
          <BrutalStat 
            label="TOTAL ISSUES" 
            value={stats.totalIssues} 
            color="green" 
            icon={BookOpen}
            rotate={-1}
          />
          <BrutalStat 
            label="CONTRIBUTORS" 
            value={stats.totalContributors} 
            color="purple" 
            icon={Users}
            rotate={1}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  px-6 py-3 border-4 border-black font-black uppercase text-sm
                  flex items-center gap-2
                  brutal-shadow brutal-hover
                  ${isActive 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-white text-black hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" strokeWidth={3} />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full border-2 border-black font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'submissions' && (
            <div>
              <EnhancedSubmissionManager authToken={authToken} />
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <IssueManager authToken={authToken} />
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <CommentModeration authToken={authToken} />
            </div>
          )}

          {activeTab === 'communications' && (
            <div>
              <CommunicationsDashboard authToken={authToken} />
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              <TypeManager authToken={authToken} />
            </div>
          )}

          {activeTab === 'contributors' && (
            <div>
              <ContributorStatusManager authToken={authToken} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
