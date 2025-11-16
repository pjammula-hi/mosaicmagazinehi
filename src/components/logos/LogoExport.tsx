import { StackedTilesLogo } from './MosaicLogos';
import { Download } from 'lucide-react';

/**
 * Logo Export Component
 * Displays the selected logo with download functionality
 */
export function LogoExport() {
  const handleDownloadSVG = () => {
    // Create a blob with the SVG content
    const svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="soft-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dx="2" dy="2" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.2" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <circle cx="100" cy="100" r="95" fill="#FFFBF5" />
  
  <!-- Stacked mosaic tiles forming HI - 3D effect -->
  <g filter="url(#soft-shadow)">
    <!-- H - left vertical stack -->
    <rect x="45" y="50" width="20" height="22" rx="3" fill="#FF6B9D" />
    <rect x="47" y="52" width="16" height="18" rx="2" fill="#FF8FAB" opacity="0.6" />
    
    <rect x="45" y="76" width="20" height="22" rx="3" fill="#FFD93D" />
    <rect x="47" y="78" width="16" height="18" rx="2" fill="#FFE66D" opacity="0.6" />
    
    <rect x="45" y="102" width="20" height="22" rx="3" fill="#98D8C8" />
    <rect x="47" y="104" width="16" height="18" rx="2" fill="#B8F2E6" opacity="0.6" />
    
    <!-- H - horizontal bar -->
    <rect x="69" y="85" width="22" height="20" rx="3" fill="#FFA07A" />
    <rect x="71" y="87" width="18" height="16" rx="2" fill="#FFB89A" opacity="0.6" />
    
    <!-- H - right vertical stack -->
    <rect x="95" y="50" width="20" height="22" rx="3" fill="#A8DAFF" />
    <rect x="97" y="52" width="16" height="18" rx="2" fill="#C8E8FF" opacity="0.6" />
    
    <rect x="95" y="76" width="20" height="22" rx="3" fill="#C8A2E0" />
    <rect x="97" y="78" width="16" height="18" rx="2" fill="#D8B2F0" opacity="0.6" />
    
    <rect x="95" y="102" width="20" height="22" rx="3" fill="#6BCF7F" />
    <rect x="97" y="104" width="16" height="18" rx="2" fill="#8BDF9F" opacity="0.6" />
    
    <!-- I - vertical stack -->
    <rect x="135" y="50" width="20" height="22" rx="3" fill="#FFB347" />
    <rect x="137" y="52" width="16" height="18" rx="2" fill="#FFC367" opacity="0.6" />
    
    <rect x="135" y="76" width="20" height="22" rx="3" fill="#87CEEB" />
    <rect x="137" y="78" width="16" height="18" rx="2" fill="#A7DEFB" opacity="0.6" />
    
    <rect x="135" y="102" width="20" height="22" rx="3" fill="#B19CD9" />
    <rect x="137" y="104" width="16" height="18" rx="2" fill="#C1ACE9" opacity="0.6" />
  </g>
  
  <!-- Celebration confetti -->
  <g opacity="0.8">
    <circle cx="30" cy="70" r="3" fill="#FFD93D" />
    <circle cx="25" cy="110" r="2.5" fill="#FF6B9D" />
    <rect x="168" y="65" width="5" height="5" rx="1" fill="#98D8C8" transform="rotate(15 170 67)" />
    <circle cx="175" cy="95" r="3" fill="#C8A2E0" />
    <rect x="170" y="120" width="4" height="4" rx="1" fill="#FFA07A" transform="rotate(-20 172 122)" />
    <circle cx="35" cy="140" r="2" fill="#87CEEB" />
  </g>
  
  <!-- Text labels -->
  <text x="100" y="155" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#8B7355" text-anchor="middle" letter-spacing="4">MOSAIC</text>
  <text x="100" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#A89080" text-anchor="middle" letter-spacing="2">magazine</text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mosaic-magazine-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = async (size: number) => {
    // Create a canvas to render the logo
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create an SVG element
    const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="soft-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
      <feOffset dx="2" dy="2" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.2" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  
  <circle cx="100" cy="100" r="95" fill="#FFFBF5" />
  
  <g filter="url(#soft-shadow)">
    <rect x="45" y="50" width="20" height="22" rx="3" fill="#FF6B9D" />
    <rect x="47" y="52" width="16" height="18" rx="2" fill="#FF8FAB" opacity="0.6" />
    <rect x="45" y="76" width="20" height="22" rx="3" fill="#FFD93D" />
    <rect x="47" y="78" width="16" height="18" rx="2" fill="#FFE66D" opacity="0.6" />
    <rect x="45" y="102" width="20" height="22" rx="3" fill="#98D8C8" />
    <rect x="47" y="104" width="16" height="18" rx="2" fill="#B8F2E6" opacity="0.6" />
    <rect x="69" y="85" width="22" height="20" rx="3" fill="#FFA07A" />
    <rect x="71" y="87" width="18" height="16" rx="2" fill="#FFB89A" opacity="0.6" />
    <rect x="95" y="50" width="20" height="22" rx="3" fill="#A8DAFF" />
    <rect x="97" y="52" width="16" height="18" rx="2" fill="#C8E8FF" opacity="0.6" />
    <rect x="95" y="76" width="20" height="22" rx="3" fill="#C8A2E0" />
    <rect x="97" y="78" width="16" height="18" rx="2" fill="#D8B2F0" opacity="0.6" />
    <rect x="95" y="102" width="20" height="22" rx="3" fill="#6BCF7F" />
    <rect x="97" y="104" width="16" height="18" rx="2" fill="#8BDF9F" opacity="0.6" />
    <rect x="135" y="50" width="20" height="22" rx="3" fill="#FFB347" />
    <rect x="137" y="52" width="16" height="18" rx="2" fill="#FFC367" opacity="0.6" />
    <rect x="135" y="76" width="20" height="22" rx="3" fill="#87CEEB" />
    <rect x="137" y="78" width="16" height="18" rx="2" fill="#A7DEFB" opacity="0.6" />
    <rect x="135" y="102" width="20" height="22" rx="3" fill="#B19CD9" />
    <rect x="137" y="104" width="16" height="18" rx="2" fill="#C1ACE9" opacity="0.6" />
  </g>
  
  <g opacity="0.8">
    <circle cx="30" cy="70" r="3" fill="#FFD93D" />
    <circle cx="25" cy="110" r="2.5" fill="#FF6B9D" />
    <rect x="168" y="65" width="5" height="5" rx="1" fill="#98D8C8" transform="rotate(15 170 67)" />
    <circle cx="175" cy="95" r="3" fill="#C8A2E0" />
    <rect x="170" y="120" width="4" height="4" rx="1" fill="#FFA07A" transform="rotate(-20 172 122)" />
    <circle cx="35" cy="140" r="2" fill="#87CEEB" />
  </g>
  
  <text x="100" y="155" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#8B7355" text-anchor="middle" letter-spacing="4">MOSAIC</text>
  <text x="100" y="172" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#A89080" text-anchor="middle" letter-spacing="2">magazine</text>
</svg>`;

    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `mosaic-magazine-logo-${size}px.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }
      }, 'image/png');
    };

    img.src = url;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-center mb-6">Mosaic Magazine HI Logo - Download</h2>
        
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-xl">
            <StackedTilesLogo size={200} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3">Download as SVG (Recommended)</h3>
            <p className="text-gray-600 text-sm mb-3">
              Vector format - scalable to any size without quality loss. Best for all uses.
            </p>
            <button
              onClick={handleDownloadSVG}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download SVG
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="mb-3">Download as PNG (Raster)</h3>
            <p className="text-gray-600 text-sm mb-3">
              Bitmap format - choose your size. Note: PNG files cannot be scaled up without quality loss.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownloadPNG(256)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                256×256px
              </button>
              <button
                onClick={() => handleDownloadPNG(512)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                512×512px
              </button>
              <button
                onClick={() => handleDownloadPNG(1024)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                1024×1024px
              </button>
              <button
                onClick={() => handleDownloadPNG(2048)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                2048×2048px
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="mb-3">Logo File Locations</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span><strong>SVG File:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/public/mosaic-logo.svg</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span><strong>React Component:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/components/logos/MosaicLogos.tsx</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span><strong>Usage Guide:</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/components/logos/LogoDownloadGuide.md</code></span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-6 bg-amber-50 -mx-8 -mb-8 px-8 py-6 rounded-b-2xl">
            <h4 className="mb-2">✨ Design Features</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 3D stacked tiles forming "HI" (Hawaii)</li>
              <li>• Vibrant, neurodivergent-friendly color palette</li>
              <li>• Celebrates student diversity and culture</li>
              <li>• Modern, warm, and uplifting design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
