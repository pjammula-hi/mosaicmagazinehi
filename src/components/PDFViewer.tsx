import { useState } from 'react';
import { Download, Eye, EyeOff, X, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  fileName?: string;
  onClose?: () => void;
  showControls?: boolean;
}

export function PDFViewer({ url, fileName, onClose, showControls = true }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
      {showControls && (
        <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Eye className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">
              {fileName || 'PDF Preview'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs text-gray-600 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-gray-200 rounded"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Download PDF"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>

            {onClose && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200 rounded"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="min-h-full flex items-center justify-center p-4">
          <div 
            style={{ 
              width: `${zoom}%`,
              maxWidth: '100%'
            }}
          >
            <iframe
              src={`${url}#toolbar=0&navpanes=0`}
              className="w-full bg-white shadow-lg"
              style={{ 
                height: isFullscreen ? 'calc(100vh - 80px)' : '600px',
                border: '1px solid #e5e7eb'
              }}
              title={fileName || 'PDF Document'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact inline preview for lists
interface PDFPreviewInlineProps {
  url: string;
  fileName: string;
  onView?: () => void;
  onRemove?: () => void;
}

export function PDFPreviewInline({ url, fileName, onView, onRemove }: PDFPreviewInlineProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded flex items-center justify-center">
        <span className="text-xs text-red-600">PDF</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{fileName}</p>
        <p className="text-xs text-gray-500">PDF Document</p>
      </div>
      
      <div className="flex items-center gap-2">
        {onView && (
          <button
            onClick={onView}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="View PDF"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        )}
        
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Download PDF"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </a>
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            title="Remove PDF"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  );
}
