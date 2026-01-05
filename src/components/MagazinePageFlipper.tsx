import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Maximize2 } from 'lucide-react';
import DOMPurify from 'dompurify';

interface MagazinePageFlipperProps {
  pages: any[];
  onBack?: () => void;
  issueName?: string;
}

export function MagazinePageFlipper({ pages, onBack, issueName }: MagazinePageFlipperProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Sort pages by page number
 const sortedPages = JSON.parse(JSON.stringify(pages)).sort((a, b) => a.pageNumber - b.pageNumber);

  const goToNextPage = () => {
    if (currentPageIndex < sortedPages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('right');
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex + 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('left');
      setTimeout(() => {
        setCurrentPageIndex(currentPageIndex - 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, isFlipping]);

  if (sortedPages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pages available for this issue yet.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const currentPage = sortedPages[currentPageIndex];

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black/95' : 'relative'}`}>
      {/* Header */}
      {!fullscreen && (
        <div className="mb-6 flex items-center justify-between">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          {issueName && (
            <h2 className="text-xl font-medium">{issueName}</h2>
          )}
          
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </button>
        </div>
      )}

      {/* Main Flipper Container */}
      <div className={`flex items-center justify-center ${fullscreen ? 'h-screen' : 'min-h-[600px]'}`}>
        {/* Previous Button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0 || isFlipping}
          className={`p-4 rounded-full transition-all ${
            currentPageIndex === 0 || isFlipping
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110 shadow-lg'
          } ${fullscreen ? 'absolute left-8 z-20' : 'mr-8'}`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Page Display with Flip Animation */}
        <div className="relative perspective-[2000px]">
          {/* Page Container */}
          <div
            className={`relative transition-all duration-600 ${
              fullscreen ? 'w-[90vw] max-w-5xl' : 'w-[800px]'
            } ${
              isFlipping && flipDirection === 'right' ? 'animate-flip-right' : ''
            } ${
              isFlipping && flipDirection === 'left' ? 'animate-flip-left' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Neo-Brutalism Page Card */}
            <div className="bg-white rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden transform-gpu">
              {/* Page Header */}
              <div className="bg-gradient-to-r from-purple-500 to-amber-500 p-4 border-b-4 border-black">
                <div className="flex items-center justify-between text-white">
                  <span className="text-lg font-bold">Page {currentPage.pageNumber}</span>
                  <span className="text-sm">
                    {currentPageIndex + 1} of {sortedPages.length}
                  </span>
                </div>
                {currentPage.title && (
                  <h3 className="text-xl font-bold mt-2 text-white">{currentPage.title}</h3>
                )}
              </div>

              {/* Page Content */}
              <div className={`bg-white p-8 ${fullscreen ? 'min-h-[calc(90vh-120px)]' : 'min-h-[500px]'}`}>
                {/* Image Content */}
                {currentPage.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={currentPage.imageUrl}
                      alt={currentPage.title || `Page ${currentPage.pageNumber}`}
                      className="w-full h-auto rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                )}

                {/* Text Content */}
                {currentPage.content && (
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                      {currentPage.content}
                    </div>
                  </div>
                )}

                {/* HTML Content - Sanitized to prevent XSS attacks */}
                {currentPage.htmlContent && (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(currentPage.htmlContent, {
                        ALLOWED_TAGS: [
                          'p', 'br', 'strong', 'em', 'u', 'b', 'i',
                          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                          'ul', 'ol', 'li',
                          'a', 'img',
                          'blockquote', 'pre', 'code',
                          'table', 'thead', 'tbody', 'tr', 'th', 'td',
                          'div', 'span'
                        ],
                        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
                      })
                    }}
                  />
                )}

                {/* Submission Reference */}
                {currentPage.submissionId && (
                  <div className="mt-6 p-4 bg-purple-50 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    <p className="text-sm text-purple-700">
                      <strong>Submission ID:</strong> {currentPage.submissionId}
                    </p>
                  </div>
                )}

                {/* Empty Page */}
                {!currentPage.content && !currentPage.htmlContent && !currentPage.imageUrl && !currentPage.submissionId && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-lg">This page is blank</p>
                  </div>
                )}
              </div>

              {/* Page Footer */}
              <div className="bg-gray-100 px-6 py-3 border-t-4 border-black text-center">
                <span className="text-sm text-gray-600">Page {currentPage.pageNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex === sortedPages.length - 1 || isFlipping}
          className={`p-4 rounded-full transition-all ${
            currentPageIndex === sortedPages.length - 1 || isFlipping
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-110 shadow-lg'
          } ${fullscreen ? 'absolute right-8 z-20' : 'ml-8'}`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Page Navigation Dots */}
      <div className={`flex items-center justify-center gap-2 ${fullscreen ? 'absolute bottom-8 left-0 right-0' : 'mt-8'}`}>
        {sortedPages.map((page, index) => (
          <button
            key={page.pageNumber}
            onClick={() => {
              if (index !== currentPageIndex && !isFlipping) {
                setIsFlipping(true);
                setFlipDirection(index > currentPageIndex ? 'right' : 'left');
                setTimeout(() => {
                  setCurrentPageIndex(index);
                  setIsFlipping(false);
                  setFlipDirection(null);
                }, 600);
              }
            }}
            disabled={isFlipping}
            className={`transition-all ${
              index === currentPageIndex
                ? 'w-12 h-3 bg-purple-600 rounded-full'
                : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
            } ${isFlipping ? 'cursor-not-allowed' : ''}`}
            title={`Page ${page.pageNumber}`}
          />
        ))}
      </div>

      {/* Fullscreen Exit */}
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors z-20"
        >
          Exit Fullscreen (ESC)
        </button>
      )}

      {/* Instructions */}
      {!fullscreen && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Use arrow keys ← → or click the buttons to flip pages</p>
        </div>
      )}

      <style>{`
        @keyframes flip-right {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }

        @keyframes flip-left {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }

        .animate-flip-right {
          animation: flip-right 0.6s ease-in-out;
        }

        .animate-flip-left {
          animation: flip-left 0.6s ease-in-out;
        }

        .perspective-\\[2000px\\] {
          perspective: 2000px;
        }
      `}</style>
    </div>
  );
}
