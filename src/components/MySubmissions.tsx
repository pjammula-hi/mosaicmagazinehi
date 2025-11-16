import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { FileText, Clock, Check, Eye, Edit, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface MySubmissionsProps {
  user: any;
  authToken: string;
}

export function MySubmissions({ user, authToken }: MySubmissionsProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
        const mySubmissions = data.submissions?.filter((s: any) => s.authorId === user.id) || [];
        setSubmissions(mySubmissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      pending: {
        label: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-4 h-4" />,
        description: 'Your submission is waiting to be reviewed by our editors'
      },
      acknowledged: {
        label: 'Acknowledged',
        color: 'bg-blue-100 text-blue-700',
        icon: <Check className="w-4 h-4" />,
        description: 'The editors have acknowledged your submission'
      },
      reviewing: {
        label: 'Under Review',
        color: 'bg-purple-100 text-purple-700',
        icon: <Eye className="w-4 h-4" />,
        description: 'Your submission is currently being reviewed'
      },
      editing: {
        label: 'Being Edited',
        color: 'bg-orange-100 text-orange-700',
        icon: <Edit className="w-4 h-4" />,
        description: 'The editors are working on your submission'
      },
      approved: {
        label: 'Approved',
        color: 'bg-green-100 text-green-700',
        icon: <Check className="w-4 h-4" />,
        description: 'Your submission has been approved and will be published soon'
      },
      published: {
        label: 'Published',
        color: 'bg-green-200 text-green-800',
        icon: <Check className="w-4 h-4" />,
        description: 'Your submission is now live in a published issue!'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'photo' || type === 'art' || type === 'crafts') return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return <div className="text-center py-12">Loading your submissions...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl mb-2">My Submissions</h2>
        <p className="text-gray-600">
          Track the status of your contributions to Mosaic Magazine
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl mb-2 text-gray-700">No submissions yet</h3>
          <p className="text-gray-500 mb-6">
            Ready to share your creativity with the community?
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Submit Your First Work
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const statusInfo = getStatusInfo(submission.status);
            
            return (
              <div 
                key={submission.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        {getTypeIcon(submission.type)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl mb-1">{submission.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="capitalize">{submission.type}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                            {submission.contributorStatus === 'hi-staff' ? 'HI Staff' : (submission.contributorStatus || 'Student')}
                          </span>
                          <span>•</span>
                          <span>Submitted {new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="text-sm">{statusInfo.label}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{statusInfo.description}</p>

                  {submission.editorNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">Editor's Notes</p>
                          <p className="text-sm text-blue-800">{submission.editorNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedSubmission(
                      selectedSubmission?.id === submission.id ? null : submission
                    )}
                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
                  >
                    {selectedSubmission?.id === submission.id ? (
                      <>Hide Details</>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Details
                      </>
                    )}
                  </button>

                  {selectedSubmission?.id === submission.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {submission.fileUrl && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Attached File</p>
                          <a 
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline text-sm"
                          >
                            View File
                          </a>
                        </div>
                      )}
                      
                      {submission.content && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Content</p>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            <p className="text-gray-800 whitespace-pre-wrap">{submission.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Timeline */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex flex-col items-center gap-1 ${
                      ['pending', 'acknowledged', 'reviewing', 'editing', 'approved', 'published'].includes(submission.status)
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        ['pending', 'acknowledged', 'reviewing', 'editing', 'approved', 'published'].includes(submission.status)
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}></div>
                      <span>Submitted</span>
                    </div>

                    <div className={`flex-1 h-px ${
                      ['acknowledged', 'reviewing', 'editing', 'approved', 'published'].includes(submission.status)
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    } mx-2`}></div>

                    <div className={`flex flex-col items-center gap-1 ${
                      ['acknowledged', 'reviewing', 'editing', 'approved', 'published'].includes(submission.status)
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        ['acknowledged', 'reviewing', 'editing', 'approved', 'published'].includes(submission.status)
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}></div>
                      <span>Reviewing</span>
                    </div>

                    <div className={`flex-1 h-px ${
                      ['approved', 'published'].includes(submission.status)
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    } mx-2`}></div>

                    <div className={`flex flex-col items-center gap-1 ${
                      ['approved', 'published'].includes(submission.status)
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        ['approved', 'published'].includes(submission.status)
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}></div>
                      <span>Approved</span>
                    </div>

                    <div className={`flex-1 h-px ${
                      submission.status === 'published'
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    } mx-2`}></div>

                    <div className={`flex flex-col items-center gap-1 ${
                      submission.status === 'published'
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        submission.status === 'published'
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}></div>
                      <span>Published</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
