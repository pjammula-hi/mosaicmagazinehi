import { useState, useEffect } from 'react';
import { BookOpen, Search, X, Sparkles } from 'lucide-react';
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c0f842e/issues`,
        {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        // Filter for published issues only
        const publishedIssues = (data.issues || [])
          .filter((i: any) => i.status === 'published')
          .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        setIssues(publishedIssues);
      } else {
        console.error('Error fetching issues:', data.error);
        if (response.status === 401) {
          alert('Your session has expired. Please log out and log in again.');
        }
      }
    } catch (err) {
      console.error('Network error fetching published issues:', err);
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
      {/* Neo-Brutal Magazine Header */}
      <div className="border-b-4 border-black bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: NYC Map */}
            <div className="flex-shrink-0 bg-white border-4 border-black p-3 rotate-2 brutal-shadow">
              <img 
                src={nycMapImage} 
                alt="NYC Five Boroughs" 
                className="w-24 h-auto mb-2"
              />
              <p className="text-[9px] leading-tight text-black font-bold max-w-[100px] uppercase">
                Bronx • Brooklyn Queens • Manhattan Staten Island
              </p>
            </div>

            {/* Center: MOSAIC Title */}
            <div className="text-center flex-1">
              <div className="relative inline-block">
                <h1 
                  className="text-7xl tracking-wider select-none font-black uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 20%, #8b5cf6 40%, #06b6d4 60%, #10b981 80%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '4px 4px 0px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  MOSAIC
                </h1>
                {/* Sparkles */}
                <Sparkles className="absolute -top-2 left-4 w-6 h-6 text-yellow-400" fill="currentColor" />
                <Sparkles className="absolute top-3 right-8 w-4 h-4 text-pink-400" fill="currentColor" />
                <Sparkles className="absolute -bottom-1 left-1/3 w-5 h-5 text-purple-400" fill="currentColor" />
              </div>
              <div className="inline-block bg-black px-4 py-1 border-3 border-black mt-2 -rotate-1">
                <p className="text-xs tracking-widest text-yellow-300 uppercase font-black">
                  Monthly Home Instruction Magazine
                </p>
              </div>
            </div>

            {/* Right: Mosaic Logo */}
            <div className="flex-shrink-0 bg-black border-4 border-black p-3 -rotate-2 brutal-shadow">
              <StackedTilesLogo size={90} />
            </div>
          </div>

          {/* Navigation Categories - Brutal Style */}
          <div className="mt-6 pt-4 border-t-4 border-black">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { label: 'Poetry', color: 'bg-yellow-300' },
                { label: 'Stories', color: 'bg-orange-300' },
                { label: 'Drawings', color: 'bg-pink-300' },
                { label: 'Opinion', color: 'bg-purple-300' },
                { label: 'Food', color: 'bg-red-300' },
                { label: 'Science', color: 'bg-cyan-300' },
                { label: 'Sports', color: 'bg-green-300' }
              ].map((cat) => (
                <span 
                  key={cat.label}
                  className={`${cat.color} px-3 py-1 border-3 border-black text-black font-black uppercase text-xs cursor-pointer brutal-hover`}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Brutal Style */}
      <div className="border-b-4 border-black bg-purple-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" strokeWidth={3} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="SEARCH ISSUES..."
                className="w-full pl-12 pr-12 py-4 border-4 border-black bg-white text-black font-bold uppercase placeholder-gray-400 focus:outline-none brutal-shadow"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-red-400 border-2 border-black brutal-hover"
                >
                  <X className="w-4 h-4 text-black" strokeWidth={3} />
                </button>
              )}
            </div>
            <button
              onClick={onSubmitForPublication}
              className="px-6 py-4 bg-gradient-to-r from-purple-400 to-pink-400 border-4 border-black text-black font-black uppercase brutal-shadow brutal-hover whitespace-nowrap"
            >
              + Submit Work
            </button>
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-black mt-3 font-bold uppercase">
              Found {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
            </p>
          )}
        </div>
      </div>

      {/* Issues Grid - Brutal Style */}
      <div className="relative min-h-screen">
        {/* Background Doodles */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-40 h-40 bg-purple-300 border-4 border-black rotate-12"></div>
          <div className="absolute top-60 right-20 w-32 h-32 bg-yellow-300 border-4 border-black -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-cyan-300 border-4 border-black rotate-45"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block bg-yellow-300 border-4 border-black p-8 brutal-shadow animate-pulse">
                <p className="text-2xl font-black uppercase text-black">Loading...</p>
              </div>
            </div>
          ) : currentIssues.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block bg-pink-200 border-4 border-black p-12 brutal-shadow -rotate-2">
                <BookOpen className="w-16 h-16 text-black mx-auto mb-4" strokeWidth={3} />
                <h3 className="text-3xl font-black uppercase text-black mb-4">
                  {searchQuery ? 'No issues found' : 'No Issues Yet'}
                </h3>
                <p className="text-black font-bold uppercase text-sm">
                  {searchQuery ? (
                    <>
                      Try a different search or{' '}
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="underline hover:no-underline"
                      >
                        clear search
                      </button>
                    </>
                  ) : (
                    'Check back soon!'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentIssues.map((issue, idx) => (
                <div
                  key={issue.id}
                  onClick={() => onViewIssue(issue)}
                  className={`cursor-pointer bg-white border-4 border-black brutal-shadow brutal-hover ${
                    idx % 3 === 0 ? 'rotate-1' : idx % 3 === 1 ? '-rotate-1' : 'rotate-2'
                  }`}
                >
                  {/* Issue Cover */}
                  {issue.coverImageUrl ? (
                    <div className="aspect-[3/4] overflow-hidden border-b-4 border-black">
                      <ImageWithFallback
                        src={issue.coverImageUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-gradient-to-br from-yellow-200 via-pink-200 to-cyan-200 border-b-4 border-black flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-black" strokeWidth={3} />
                    </div>
                  )}

                  {/* Issue Info */}
                  <div className="p-6">
                    <div className="inline-block bg-yellow-300 px-3 py-1 border-3 border-black mb-3">
                      <span className="text-xs font-black uppercase text-black">
                        {getMonthName(issue.month)} {issue.year}
                      </span>
                    </div>
                    
                    {issue.number && issue.volume && (
                      <p className="text-xs font-bold uppercase text-black mb-2">
                        Issue {issue.number} • Vol {issue.volume}
                      </p>
                    )}

                    {issue.description && (
                      <p className="text-sm text-black font-medium line-clamp-3">
                        {issue.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination - Brutal Style */}
          {currentIssues.length > 0 && totalPages > 1 && (
            <>
              <div className="mt-16 flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white border-4 border-black brutal-shadow brutal-hover font-black uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 border-4 border-black font-black text-sm brutal-shadow brutal-hover ${
                        currentPage === page
                          ? 'bg-black text-yellow-300'
                          : 'bg-white text-black'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white border-4 border-black brutal-shadow brutal-hover font-black uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-block bg-cyan-200 px-4 py-2 border-3 border-black">
                  <p className="text-sm font-black uppercase text-black">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
