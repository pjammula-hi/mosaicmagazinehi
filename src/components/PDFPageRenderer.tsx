import { FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface PDFPageRendererProps {
  url: string;
  fileName: string;
  className?: string;
}

export function PDFPageRenderer({ url, fileName, className = '' }: PDFPageRendererProps) {
  // Simple, clean PDF embed with magazine styling
  return (
    <div className={`${className}`}>
      {/* Recommendation banner */}
      <div className="mb-6 bg-gradient-to-r from-amber-50 to-purple-50 border-2 border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 mb-1">💡 Pro Tip for Better Magazine Appearance</p>
            <p className="text-sm text-amber-800">
              For the best magazine-style presentation, we recommend uploading page screenshots as <strong>JPG or PNG images</strong> instead of PDFs. 
              This gives readers a true glossy magazine experience!
            </p>
          </div>
        </div>
      </div>

      {/* Clean PDF viewer with magazine frame */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200">
        <div className="bg-gradient-to-r from-purple-100 to-amber-100 px-6 py-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-purple-300 shadow-sm">
              <FileText className="w-4 h-4 text-purple-700" />
            </div>
            <span className="font-medium text-gray-800">Document</span>
          </div>
        </div>
        <div className="bg-gray-50 p-2">
          <iframe
            src={url}
            className="w-full h-[900px] border-0 rounded-lg bg-white shadow-inner"
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
}
