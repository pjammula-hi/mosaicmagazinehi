import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { 
  X, 
  Save, 
  GripVertical, 
  Image as ImageIcon, 
  FileText,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface IssuePublisherProps {
  issue: any;
  authToken: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface PageItem {
  id: string;
  pageNumber: number;
  type: 'editorial' | 'toc' | 'submission';
  submissionId?: string;
  title: string;
  contributorName: string;
  imageUrl?: string;
  description?: string;
  issueNumber: string;
}

export function IssuePublisher({ issue, authToken, onClose, onUpdate }: IssuePublisherProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorialContent, setEditorialContent] = useState({
    type: 'editorial',
    title: "Letter from the Editor",
    content: ""
  });
  const [tocContent, setTocContent] = useState({
    type: 'toc',
    title: "Table of Contents",
    content: ""
  });

  useEffect(() => {
    fetchIssuePages();
    fetchAcceptedSubmissions();
  }, [issue.id]);

  const fetchIssuePages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}/pages`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok && data.pages) {
        setPages(data.pages.sort((a: PageItem, b: PageItem) => a.pageNumber - b.pageNumber));
      }
    } catch (err) {
      console.error('Error fetching issue pages:', err);
    }
  };

  const fetchAcceptedSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/submissions/accepted?issueId=${issue.id}`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAcceptedSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching accepted submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEditorialPage = () => {
    const newPage: PageItem = {
      id: `editorial-${Date.now()}`,
      pageNumber: 1,
      type: 'editorial',
      title: editorialContent.title,
      contributorName: "Editorial Team",
      description: editorialContent.content,
      issueNumber: issue.number
    };
    
    // Shift all existing pages down
    const updatedPages = pages.map(p => ({ ...p, pageNumber: p.pageNumber + 1 }));
    setPages([newPage, ...updatedPages]);
    setEditorialContent({ type: 'editorial', title: "Letter from the Editor", content: "" });
  };

  const addTOCPage = () => {
    // Generate TOC content from pages
    const tocText = pages
      .filter(p => p.type === 'submission')
      .map((p, idx) => `${p.pageNumber}. ${p.title} - ${p.contributorName}`)
      .join('\n');

    const newPage: PageItem = {
      id: `toc-${Date.now()}`,
      pageNumber: 2,
      type: 'toc',
      title: "Table of Contents",
      contributorName: "Editorial Team",
      description: tocText,
      issueNumber: issue.number
    };
    
    // Insert at position 2
    const updatedPages = pages.map(p => 
      p.pageNumber >= 2 ? { ...p, pageNumber: p.pageNumber + 1 } : p
    );
    setPages([...updatedPages.filter(p => p.pageNumber < 2), newPage, ...updatedPages.filter(p => p.pageNumber >= 2)].sort((a, b) => a.pageNumber - b.pageNumber));
  };

  const addSubmissionPage = (submission: any) => {
    const newPage: PageItem = {
      id: `page-${Date.now()}`,
      pageNumber: pages.length + 1,
      type: 'submission',
      submissionId: submission.id,
      title: submission.title,
      contributorName: submission.authorName,
      // Prioritize cell image (imageUrl), fall back to fileUrl for photo/art/crafts submissions
      imageUrl: submission.imageUrl || (
        (submission.type === 'photo' || submission.type === 'art' || submission.type === 'crafts') 
          ? submission.fileUrl 
          : undefined
      ),
      description: submission.content?.substring(0, 200) || '',
      issueNumber: issue.number
    };
    
    setPages([...pages, newPage]);
  };

  const movePageUp = (index: number) => {
    if (index === 0) return;
    
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    
    // Renumber pages
    newPages.forEach((page, idx) => {
      page.pageNumber = idx + 1;
    });
    
    setPages(newPages);
  };

  const movePageDown = (index: number) => {
    if (index === pages.length - 1) return;
    
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    
    // Renumber pages
    newPages.forEach((page, idx) => {
      page.pageNumber = idx + 1;
    });
    
    setPages(newPages);
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, idx) => idx !== index);
    
    // Renumber remaining pages
    newPages.forEach((page, idx) => {
      page.pageNumber = idx + 1;
    });
    
    setPages(newPages);
  };

  const updatePageImage = (index: number, imageUrl: string) => {
    const newPages = [...pages];
    newPages[index].imageUrl = imageUrl;
    setPages(newPages);
  };

  const updatePageDescription = (index: number, description: string) => {
    const newPages = [...pages];
    newPages[index].description = description;
    setPages(newPages);
  };

  const handleSavePages = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues/${issue.id}/pages`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ pages })
        }
      );

      if (response.ok) {
        alert('Issue pages saved successfully!');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error saving pages: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving issue pages:', err);
      alert('Failed to save issue pages. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getUnusedSubmissions = () => {
    const usedSubmissionIds = pages
      .filter(p => p.submissionId)
      .map(p => p.submissionId);
    return acceptedSubmissions.filter(s => !usedSubmissionIds.includes(s.id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-display text-purple-900">Issue Publisher</h3>
              <p className="text-sm text-gray-600 mt-1 font-sans-modern">
                {issue.title} - Issue #{issue.number}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Editorial & TOC */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="font-sans-modern font-semibold mb-3 text-blue-900">Add Editorial Page</h4>
              <input
                type="text"
                value={editorialContent.title}
                onChange={(e) => setEditorialContent({ ...editorialContent, title: e.target.value })}
                placeholder="Title (e.g., Letter from the Editor)"
                className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
              />
              <textarea
                value={editorialContent.content}
                onChange={(e) => setEditorialContent({ ...editorialContent, content: e.target.value })}
                placeholder="Editorial content..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
              />
              <button
                onClick={addEditorialPage}
                disabled={!editorialContent.title.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-sans-modern"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add as First Page
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <h4 className="font-sans-modern font-semibold mb-3 text-green-900">Add Table of Contents</h4>
              <p className="text-xs text-gray-600 mb-3">
                Auto-generated from submission pages
              </p>
              <button
                onClick={addTOCPage}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-sans-modern"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add TOC as Page 2
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <h4 className="font-sans-modern font-semibold mb-3 text-purple-900">Available Submissions</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : getUnusedSubmissions().length === 0 ? (
                  <p className="text-sm text-gray-500">All accepted submissions added</p>
                ) : (
                  getUnusedSubmissions().map((submission) => (
                    <div
                      key={submission.id}
                      className="p-3 bg-white rounded border hover:border-purple-400 transition-colors"
                    >
                      <p className="text-sm font-medium">{submission.title}</p>
                      <p className="text-xs text-gray-600 mb-2">{submission.authorName}</p>
                      <button
                        onClick={() => addSubmissionPage(submission)}
                        className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Add to Issue
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Page Layout */}
          <div className="lg:col-span-2">
            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200 mb-4">
              <h4 className="font-sans-modern font-semibold text-amber-900 mb-2">
                Issue Layout ({pages.length} pages)
              </h4>
              <p className="text-xs text-gray-600">
                Drag to reorder pages. Page numbers will auto-update based on order.
              </p>
            </div>

            <div className="space-y-3">
              {pages.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-sans-modern">No pages added yet</p>
                  <p className="text-sm">Add editorial content or submissions to begin</p>
                </div>
              ) : (
                pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Page Number & Controls */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          {page.pageNumber}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => movePageUp(index)}
                            disabled={index === 0}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => movePageDown(index)}
                            disabled={index === pages.length - 1}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removePage(index)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div className="w-40 h-52 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                        {page.imageUrl ? (
                          <ImageWithFallback
                            src={page.imageUrl}
                            alt={page.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            page.type === 'editorial' ? 'bg-blue-100 text-blue-700' :
                            page.type === 'toc' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {page.type === 'editorial' ? 'Editorial' : 
                             page.type === 'toc' ? 'TOC' : 'Submission'}
                          </span>
                        </div>
                        
                        <h5 className="font-serif-warm text-lg mb-1">{page.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">By {page.contributorName}</p>
                        
                        <div className="mb-2">
                          <label className="text-xs text-gray-600">Image URL:</label>
                          <input
                            type="url"
                            value={page.imageUrl || ''}
                            onChange={(e) => updatePageImage(index, e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2 py-1 text-sm border rounded mt-1"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600">Description (optional):</label>
                          <textarea
                            value={page.description || ''}
                            onChange={(e) => updatePageDescription(index, e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-sm border rounded mt-1"
                            placeholder="Short description..."
                          />
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500 font-sans-modern">
                          Issue #{page.issueNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-sans-modern"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePages}
            disabled={saving || pages.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans-modern"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : `Save ${pages.length} Pages`}
          </button>
        </div>
      </div>
    </div>
  );
}
