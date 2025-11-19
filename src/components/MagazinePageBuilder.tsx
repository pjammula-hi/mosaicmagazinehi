import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, Trash2, Save, Eye, MoveUp, MoveDown, FileText, Image as ImageIcon } from 'lucide-react';
import { MagazinePageFlipper } from './MagazinePageFlipper';

interface MagazinePageBuilderProps {
  issue: any;
  authToken: string;
  onClose: () => void;
}

export function MagazinePageBuilder({ issue, authToken, onClose }: MagazinePageBuilderProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
    fetchSubmissions();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}/pages`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPages(data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
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
        const issueSubmissions = data.submissions?.filter(
          (s: any) => s.issueId === issue.id && (s.status === 'published' || s.status === 'accepted')
        ) || [];
        setSubmissions(issueSubmissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const addPage = () => {
    const newPageNumber = pages.length > 0 
      ? Math.max(...pages.map(p => p.pageNumber)) + 1 
      : 1;
    
    setPages([...pages, {
      pageNumber: newPageNumber,
      title: '',
      content: '',
      imageUrl: '',
      submissionId: '',
      htmlContent: ''
    }]);
  };

  const removePage = (index: number) => {
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
  };

  const updatePage = (index: number, field: string, value: any) => {
    const updatedPages = [...pages];
    updatedPages[index] = { ...updatedPages[index], [field]: value };
    setPages(updatedPages);
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === pages.length - 1)
    ) {
      return;
    }

    const updatedPages = [...pages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap page numbers
    const tempPageNum = updatedPages[index].pageNumber;
    updatedPages[index].pageNumber = updatedPages[swapIndex].pageNumber;
    updatedPages[swapIndex].pageNumber = tempPageNum;

    // Swap positions in array
    [updatedPages[index], updatedPages[swapIndex]] = [updatedPages[swapIndex], updatedPages[index]];
    
    setPages(updatedPages);
  };

  const savePages = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}/pages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ pages })
        }
      );

      if (response.ok) {
        alert('Pages saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save pages: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving pages:', err);
      alert('An error occurred while saving pages.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading pages...</div>;
  }

  if (previewMode) {
    return (
      <MagazinePageFlipper
        pages={pages}
        issueName={issue.title}
        onBack={() => setPreviewMode(false)}
      />
    );
  }

  // Sort pages for display
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-amber-500 p-6 border-b-4 border-black sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Magazine Page Builder</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Close
            </button>
          </div>
          <p className="text-white/90">
            {issue.title} - Build the magazine layout page by page
          </p>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={addPage}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </button>
            
            <button
              onClick={savePages}
              disabled={saving || pages.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All Pages'}
            </button>
            
            <button
              onClick={() => setPreviewMode(true)}
              disabled={pages.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Eye className="w-4 h-4" />
              Preview Magazine
            </button>
          </div>
        </div>

        {/* Pages List */}
        <div className="p-6">
          {sortedPages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-4 border-black">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No pages created yet</p>
              <button
                onClick={addPage}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Create First Page
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedPages.map((page, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6"
                >
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-purple-500 text-white rounded-lg font-bold border-2 border-black">
                        Page {page.pageNumber}
                      </span>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePage(index, 'up')}
                          disabled={index === 0}
                          className="p-2 bg-gray-200 rounded border-2 border-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => movePage(index, 'down')}
                          disabled={index === sortedPages.length - 1}
                          className="p-2 bg-gray-200 rounded border-2 border-black hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removePage(index)}
                      className="p-2 bg-red-500 text-white rounded border-2 border-black hover:bg-red-600 transition-all"
                      title="Delete page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Page Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Page Title</label>
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => updatePage(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border-4 border-black rounded-lg focus:ring-2 focus:ring-purple-600 font-medium"
                        placeholder="e.g., Student Poetry Collection"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Link to Submission (Optional)</label>
                      <select
                        value={page.submissionId}
                        onChange={(e) => {
                          updatePage(index, 'submissionId', e.target.value);
                          // Auto-fill from submission
                          const submission = submissions.find(s => s.id === e.target.value);
                          if (submission) {
                            updatePage(index, 'title', page.title || submission.title);
                            updatePage(index, 'content', page.content || submission.content || '');
                            updatePage(index, 'imageUrl', page.imageUrl || submission.fileUrl || submission.imageUrl || '');
                          }
                        }}
                        className="w-full px-4 py-2 border-4 border-black rounded-lg focus:ring-2 focus:ring-purple-600 font-medium"
                      >
                        <option value="">-- Select a submission to auto-fill --</option>
                        {submissions.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.title} by {sub.authorName} ({sub.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={page.imageUrl}
                        onChange={(e) => updatePage(index, 'imageUrl', e.target.value)}
                        className="w-full px-4 py-2 border-4 border-black rounded-lg focus:ring-2 focus:ring-purple-600 font-medium"
                        placeholder="https://..."
                      />
                      {page.imageUrl && (
                        <img
                          src={page.imageUrl}
                          alt="Preview"
                          className="mt-2 max-h-40 rounded border-2 border-black"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Text Content (Optional)
                      </label>
                      <textarea
                        value={page.content}
                        onChange={(e) => updatePage(index, 'content', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border-4 border-black rounded-lg focus:ring-2 focus:ring-purple-600 font-medium"
                        placeholder="Enter the page content..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
