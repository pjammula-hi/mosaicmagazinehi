import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BookOpen, PenTool, LogOut, Plus, Home, User } from 'lucide-react';
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

  // If on magazine tab, show magazine landing with brutal header
  if (activeTab === 'magazine') {
    return (
      <div className="min-h-screen bg-white">
        {/* Neo-Brutal Top Bar */}
        <div className="border-b-4 border-black bg-yellow-300 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="bg-black p-3 border-4 border-black -rotate-3 brutal-shadow-sm">
                  <StackedTilesLogo size={50} />
                </div>
                <div>
                  <h1 
                    className="text-3xl text-black font-black uppercase tracking-tight"
                    style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)' }}
                  >
                    MOSAIC
                  </h1>
                  <p className="text-black text-xs font-bold uppercase tracking-wider">Magazine HI</p>
                </div>
              </div>
              
              {/* Navigation Tabs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('magazine')}
                  className="px-5 py-2 bg-black text-yellow-300 border-4 border-black brutal-shadow-sm font-black uppercase text-sm"
                >
                  Latest Issue
                </button>
                <button
                  onClick={() => setActiveTab('issues')}
                  className="px-5 py-2 bg-white border-4 border-black brutal-shadow-sm brutal-hover font-black uppercase text-sm text-black"
                >
                  Archives
                </button>
                {canSubmit && (
                  <>
                    <button
                      onClick={() => setActiveTab('submit')}
                      className="px-5 py-2 bg-purple-400 border-4 border-black brutal-shadow-sm brutal-hover font-black uppercase text-sm text-black"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setActiveTab('my-submissions')}
                      className="px-5 py-2 bg-cyan-300 border-4 border-black brutal-shadow-sm brutal-hover font-black uppercase text-sm text-black"
                    >
                      My Work
                    </button>
                  </>
                )}
                
                {/* User Menu */}
                <div className="flex items-center gap-2 border-l-4 border-black pl-4">
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-2 border-3 border-black">
                    <User className="w-4 h-4" strokeWidth={3} />
                    <span className="text-xs font-black uppercase">{user.fullName}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 bg-red-400 border-3 border-black brutal-shadow-sm brutal-hover"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4 text-black" strokeWidth={3} />
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
    <div className="min-h-screen bg-white">
      {/* Neo-Brutal Header */}
      <div className="border-b-4 border-black bg-yellow-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-black p-3 border-4 border-black rotate-3 brutal-shadow">
                <StackedTilesLogo size={50} />
              </div>
              <div>
                <h1 
                  className="text-3xl text-black font-black uppercase tracking-tight"
                  style={{ textShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)' }}
                >
                  MOSAIC
                </h1>
                <p className="text-black text-xs font-bold uppercase tracking-wider">Magazine HI</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="inline-block bg-white px-4 py-2 border-3 border-black -rotate-1">
                <p className="text-sm font-black uppercase text-black">{user.fullName}</p>
                <p className="text-xs font-bold uppercase text-gray-600">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-3 bg-red-400 border-4 border-black brutal-shadow brutal-hover"
              >
                <LogOut className="w-5 h-5 text-black" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Neo-Brutal Tabs */}
      <div className="border-b-4 border-black bg-cyan-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-2 py-3">
            <button
              onClick={() => setActiveTab('magazine')}
              className={`py-3 px-6 border-4 border-black font-black uppercase text-sm transition-all ${
                activeTab === 'magazine'
                  ? 'bg-black text-yellow-300 brutal-shadow translate-y-0'
                  : 'bg-white text-black brutal-shadow-sm hover:translate-y-[-2px] hover:brutal-shadow'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" strokeWidth={3} />
                Latest Issue
              </div>
            </button>

            <button
              onClick={() => setActiveTab('issues')}
              className={`py-3 px-6 border-4 border-black font-black uppercase text-sm transition-all ${
                activeTab === 'issues'
                  ? 'bg-black text-yellow-300 brutal-shadow translate-y-0'
                  : 'bg-white text-black brutal-shadow-sm hover:translate-y-[-2px] hover:brutal-shadow'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" strokeWidth={3} />
                Archive
              </div>
            </button>

            {canSubmit && (
              <>
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`py-3 px-6 border-4 border-black font-black uppercase text-sm transition-all ${
                    activeTab === 'submit'
                      ? 'bg-black text-yellow-300 brutal-shadow translate-y-0'
                      : 'bg-purple-400 text-black brutal-shadow-sm hover:translate-y-[-2px] hover:brutal-shadow'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Submit Work
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('my-submissions')}
                  className={`py-3 px-6 border-4 border-black font-black uppercase text-sm transition-all ${
                    activeTab === 'my-submissions'
                      ? 'bg-black text-yellow-300 brutal-shadow translate-y-0'
                      : 'bg-cyan-300 text-black brutal-shadow-sm hover:translate-y-[-2px] hover:brutal-shadow'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" strokeWidth={3} />
                    My Submissions
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Area with Brutal Background */}
      <div className="relative min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-purple-300 border-4 border-black rotate-12"></div>
          <div className="absolute top-60 right-20 w-32 h-32 bg-yellow-300 border-4 border-black -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-cyan-300 border-4 border-black rotate-45"></div>
          <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-pink-300 border-4 border-black -rotate-12"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8">
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
    </div>
  );
}
