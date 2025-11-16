import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { StackedTilesLogo } from './logos/MosaicLogos';
import { projectId } from '../utils/supabase/info';
import nycMapImage from 'figma:asset/28c3cd53c127b3e012f33ba5e0a11a223a6a1360.png';

interface MagazineLandingProps {
  onViewIssue: (issue: any) => void;
  onSubmitForPublication: () => void;
  authToken: string;
}

export function MagazineLanding({ onViewIssue, onSubmitForPublication, authToken }: MagazineLandingProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchPublishedIssues();
  }, []);

  const fetchPublishedIssues = async () => {
    setLoading(true);
    try {
      console.log('[MagazineLanding] Fetching issues...');
      console.log('[MagazineLanding] authToken present:', !!authToken);
      console.log('[MagazineLanding] authToken length:', authToken?.length || 0);
      console.log('[MagazineLanding] authToken (first 20 chars):', authToken?.substring(0, 20) || 'empty');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      
      console.log('[MagazineLanding] Response status:', response.status);
      
      const data = await response.json();
      console.log('[MagazineLanding] Response data:', data);
      
      if (response.ok) {
        // Filter for published issues only
        const publishedIssues = (data.issues || [])
          .filter((i: any) => i.status === 'published')
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        console.log('[MagazineLanding] Found', publishedIssues.length, 'published issues');
        setIssues(publishedIssues);
      } else {
        console.error('[MagazineLanding] Error fetching issues:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details
        });
        
        if (response.status === 401) {
          console.error('[MagazineLanding] Authentication failed - session may have expired');
          alert('Your session has expired. Please log out and log in again.');
        } else {
          alert(`Failed to load issues: ${data.error || 'Unknown error'}`)
;
        }
      }
    } catch (err) {
      console.error('[MagazineLanding] Network error fetching published issues:', err);
      alert('Network error: Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  };

  // Filter issues based on search query
  const filteredIssues = issues.filter(issue => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(query) ||
      (issue.description && issue.description.toLowerCase().includes(query)) ||
      getMonthName(issue.month).toLowerCase().includes(query) ||
      issue.year.toString().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentIssues = filteredIssues.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Magazine Header - Mosaic Style */}
      <div className="border-b-2 border-amber-100 py-4 bg-gradient-to-b from-orange-50/30 via-amber-50/20 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: NYC Map */}
            <div className="flex-shrink-0">
              <img 
                src={nycMapImage} 
                alt="NYC Five Boroughs" 
                className="w-24 h-auto mb-2 rounded-sm shadow-sm"
              />
              <p className="text-[10px] leading-relaxed text-amber-700 font-sans-modern max-w-[100px] font-medium">
                Currently being edited in Bronx, Brooklyn, Queens, Manhattan and Staten Island
              </p>
            </div>

            {/* Center: Magazine Title with Crystal Glass Effect */}
            <div className="text-center flex-1">
              <div className="relative inline-block">
                <h1 
                  className="text-6xl tracking-[0.25em] mb-1.5 select-none font-display"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 20%, #8b5cf6 40%, #06b6d4 60%, #10b981 80%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: '800',
                    letterSpacing: '0.2em',
                    filter: 'drop-shadow(0 2px 12px rgba(245, 158, 11, 0.25)) drop-shadow(0 4px 20px rgba(139, 92, 246, 0.2))',
                    textShadow: '0 0 40px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  MOSAIC
                </h1>
                {/* Crystal sparkle accents - more vibrant */}
                <div className="absolute -top-1 left-8 w-2 h-2 bg-amber-400 rounded-full opacity-70 animate-pulse shadow-lg shadow-amber-300" />
                <div className="absolute top-3 right-12 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-80 animate-pulse shadow-lg shadow-pink-300" style={{ animationDelay: '0.3s' }} />
                <div className="absolute -bottom-0.5 left-1/3 w-2 h-2 bg-purple-400 rounded-full opacity-70 animate-pulse shadow-lg shadow-purple-300" style={{ animationDelay: '0.6s' }} />
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.9s' }} />
                <div className="absolute top-4 right-1/4 w-1 h-1 bg-emerald-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1.2s' }} />
              </div>
              <p className="text-xs tracking-[0.25em] text-amber-600 uppercase font-sans-modern font-semibold">
                A Monthly Home Instruction Schools Magazine
              </p>
            </div>

            {/* Right: Mosaic Logo */}
            <div className="flex-shrink-0">
              <StackedTilesLogo size={100} />
            </div>
          </div>

          {/* Navigation Categories - Warm & Inviting */}
          <div className="mt-4 pt-3 border-t border-amber-100">
            <div className="flex items-center justify-center gap-5 text-sm font-sans-modern font-semibold">
              <span className="text-amber-600 hover:text-amber-700 cursor-pointer transition-all hover:scale-110 transform">Poetry</span>
              <span className="text-orange-300">•</span>
              <span className="text-orange-600 hover:text-orange-700 cursor-pointer transition-all hover:scale-110 transform">Stories</span>
              <span className="text-pink-300">•</span>
              <span className="text-teal-600 hover:text-teal-700 cursor-pointer transition-all hover:scale-110 transform">Drawings</span>
              <span className="text-purple-300">•</span>
              <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer transition-all hover:scale-110 transform">Opinion</span>
              <span className="text-cyan-300">•</span>
              <span className="text-rose-600 hover:text-rose-700 cursor-pointer transition-all hover:scale-110 transform">Food</span>
              <span className="text-emerald-300">•</span>
              <span className="text-cyan-600 hover:text-cyan-700 cursor-pointer transition-all hover:scale-110 transform">Science</span>
              <span className="text-amber-300">•</span>
              <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer transition-all hover:scale-110 transform">Sports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 via-amber-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 max-w-full">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                placeholder="Search articles by title, author, or category..."
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white shadow-sm font-sans-modern"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={onSubmitForPublication}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:from-purple-700 hover:to-amber-700 transition-all font-sans-modern flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit for Publication
            </button>
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-gray-600 mt-3 font-sans-modern">
              Found {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} matching "{searchQuery}"
            </p>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
      </div>

      {/* 9-Cell Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {currentIssues.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif-warm text-gray-600 mb-2">
              {searchQuery ? 'No issues found' : 'No Issues Published Yet'}
            </h3>
            <p className="text-gray-500 font-sans-modern">
              {searchQuery ? (
                <>
                  Try adjusting your search query or{' '}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    clear the search
                  </button>
                </>
              ) : (
                'Check back soon for our first published issue!'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onViewIssue(issue)}
              className="group cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-xl transition-all border border-gray-200 hover:border-amber-300"
            >
              {/* Issue Cover Image */}
              {issue.coverImageUrl ? (
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={issue.coverImageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 via-orange-100 to-pink-100 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-amber-300" />
                </div>
              )}

              <div className="px-6 pt-3 pb-6">
                {/* Issue Info - Number/Volume and Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-sans-modern uppercase tracking-wider">
                  <BookOpen className="w-3 h-3" />
                  <span>{getMonthName(issue.month)} {issue.year}</span>
                  {issue.number && issue.volume && (
                    <span>• Issue {issue.number} Vol {issue.volume}</span>
                  )}
                </div>

                {/* Issue Description */}
                {issue.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 font-sans-modern">
                    {issue.description}
                  </p>
                )}
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {currentIssues.length > 0 && (
          <>
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 hover:border-amber-500 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-sans-modern text-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center border font-sans-modern text-sm transition-all ${
                      currentPage === page
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-gray-300 hover:border-amber-500 hover:text-amber-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 hover:border-amber-500 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-sans-modern text-sm"
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <div className="mt-6 text-center text-sm text-gray-500 font-sans-modern">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length} issues
            </div>
          </>
        )}
      </div>
    </div>
  );
}
