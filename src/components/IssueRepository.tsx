import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { BookOpen, Calendar, Eye, MessageSquare, FileText, Image as ImageIcon } from 'lucide-react';
import { IssueViewer } from './IssueViewer';

interface IssueRepositoryProps {
  user: any;
  authToken: string;
}

export function IssueRepository({ user, authToken }: IssueRepositoryProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      console.log('[IssueRepository] Fetching issues...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      console.log('[IssueRepository] Response:', { status: response.status, data });
      
      if (response.ok) {
        // Only show published issues to readers
        setIssues(data.issues?.filter((i: any) => i.status === 'published') || []);
      } else {
        console.error('[IssueRepository] Error fetching issues:', data.error, data.details);
        alert(`Failed to load issues: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('[IssueRepository] Network error fetching issues:', err);
      alert('Network error: Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  };

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

  if (loading) {
    return <div className="text-center py-12">Loading issues...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl mb-2">Issue Repository</h2>
        <p className="text-gray-600">Browse past issues of Mosaic Magazine</p>
      </div>

      {issues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl mb-2 text-gray-700">No issues published yet</h3>
          <p className="text-gray-500">Check back soon for new magazine issues!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div 
              key={issue.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedIssue(issue)}
            >
              {issue.coverImageUrl ? (
                <div className="h-64 overflow-hidden">
                  <img 
                    src={issue.coverImageUrl} 
                    alt={issue.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-purple-100 via-blue-50 to-purple-50 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-purple-300" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-sans-modern uppercase tracking-wider">
                  <BookOpen className="w-3 h-3" />
                  <span>{getMonthName(issue.month)} {issue.year}</span>
                  {issue.number && issue.volume && (
                    <span>• Issue {issue.number} Vol {issue.volume}</span>
                  )}
                </div>
                
                {issue.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {issue.description}
                  </p>
                )}

                <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                    <Eye className="w-4 h-4" />
                    View Issue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
