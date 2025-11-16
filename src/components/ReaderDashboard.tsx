import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BookOpen, PenTool, LogOut, Plus, Home } from 'lucide-react';
import { IssueRepository } from './IssueRepository';
import { IssueViewer } from './IssueViewer';
import { SubmissionForm } from './SubmissionForm';
import { MySubmissions } from './MySubmissions';
import { MagazineLanding } from './MagazineLanding';
import { ArticleViewer } from './ArticleViewer';
import { SubmissionGuidelines } from './SubmissionGuidelines';
import { StackedTilesLogo } from './logos/MosaicLogos';

interface ReaderDashboardProps {
  user: any;
  authToken: string;
  onLogout: () => void;
}

export function ReaderDashboard({ user, authToken, onLogout }: ReaderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'magazine' | 'issues' | 'submit' | 'my-submissions'>('magazine');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showSubmissionGuidelines, setShowSubmissionGuidelines] = useState(false);
  const [stats, setStats] = useState({
    publishedIssues: 0,
    mySubmissions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch issues
      const issuesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const issuesData = await issuesRes.json();
      const publishedIssues = issuesData.issues?.filter((i: any) => i.status === 'published').length || 0;

      // Fetch my submissions
      const submissionsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const submissionsData = await submissionsRes.json();
      const mySubmissions = submissionsData.submissions?.filter((s: any) => s.authorId === user.id).length || 0;

      setStats({ publishedIssues, mySubmissions });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const canSubmit = user.role === 'student' || user.role === 'teacher';

  // If viewing an issue, show issue viewer
  if (selectedIssue) {
    return (
      <IssueViewer
        issue={selectedIssue}
        user={user}
        authToken={authToken}
        onBack={() => setSelectedIssue(null)}
      />
    );
  }

  // If viewing an article, show article viewer
  if (selectedArticle) {
    return (
      <ArticleViewer
        article={selectedArticle}
        user={user}
        authToken={authToken}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  // If on magazine tab, show magazine landing without header
  if (activeTab === 'magazine') {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal Top Bar */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StackedTilesLogo size={60} />
                <div>
                  <h1 className="text-2xl">Mosaic Magazine HI</h1>
                  <p className="text-xs text-gray-500">K-12 School Magazine</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => setActiveTab('magazine')}
                    className="px-4 py-2 bg-black text-white rounded-sm"
                  >
                    Latest Issue
                  </button>
                  <button
                    onClick={() => setActiveTab('issues')}
                    className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    Archives
                  </button>
                  {canSubmit && (
                    <>
                      <button
                        onClick={() => setActiveTab('submit')}
                        className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setActiveTab('my-submissions')}
                        className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                      >
                        My Work
                      </button>
                    </>
                  )}
                </div>
                <div className="text-right border-l border-gray-200 pl-4">
                  <p className="text-xs text-gray-600">{user.fullName}</p>
                  <button
                    onClick={onLogout}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MagazineLanding 
          onViewIssue={setSelectedIssue} 
          onSubmitForPublication={() => setShowSubmissionGuidelines(true)}
          authToken={authToken}
        />
        
        {showSubmissionGuidelines && (
          <SubmissionGuidelines
            user={user}
            authToken={authToken}
            onClose={() => {
              setShowSubmissionGuidelines(false);
              fetchStats();
            }}
          />
        )}
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
                <p className="text-gray-600 text-sm">K-12 School Magazine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('magazine')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'magazine'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Latest Issue
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
                Archive
              </div>
            </button>

            {canSubmit && (
              <>
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`py-4 px-2 border-b-2 transition-colors ${
                    activeTab === 'submit'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Submit Work
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-submissions')}
                  className={`py-4 px-2 border-b-2 transition-colors ${
                    activeTab === 'my-submissions'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    My Submissions
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'issues' && (
          <IssueRepository user={user} authToken={authToken} />
        )}
        {activeTab === 'submit' && canSubmit && (
          <div className="relative">
            <SubmissionGuidelines
              user={user}
              authToken={authToken}
              onClose={() => {
                setActiveTab('magazine');
                fetchStats();
              }}
            />
          </div>
        )}
        {activeTab === 'my-submissions' && canSubmit && (
          <MySubmissions user={user} authToken={authToken} />
        )}
      </div>
    </div>
  );
}
