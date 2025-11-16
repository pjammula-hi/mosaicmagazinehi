import React from 'react';

// Logo 1: Mosaic Tiles forming HI with diverse colors
export const MosaicTilesLogo = ({ size = 120, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#FFF9F0" />
      
      {/* Mosaic tiles forming "HI" */}
      {/* Letter H - left vertical */}
      <rect x="40" y="50" width="18" height="25" rx="3" fill="#FF6B9D" />
      <rect x="40" y="80" width="18" height="25" rx="3" fill="#FFA07A" />
      <rect x="40" y="110" width="18" height="25" rx="3" fill="#98D8C8" />
      
      {/* Letter H - horizontal bar */}
      <rect x="62" y="88" width="18" height="18" rx="3" fill="#FFD93D" />
      <rect x="84" y="88" width="18" height="18" rx="3" fill="#6BCF7F" />
      
      {/* Letter H - right vertical */}
      <rect x="106" y="50" width="18" height="25" rx="3" fill="#A8DAFF" />
      <rect x="106" y="80" width="18" height="25" rx="3" fill="#C8A2E0" />
      <rect x="106" y="110" width="18" height="25" rx="3" fill="#FFB347" />
      
      {/* Letter I */}
      <rect x="144" y="50" width="18" height="25" rx="3" fill="#FF8FAB" />
      <rect x="144" y="80" width="18" height="25" rx="3" fill="#87CEEB" />
      <rect x="144" y="110" width="18" height="25" rx="3" fill="#B19CD9" />
      
      {/* Decorative accent tiles (celebrating diversity) */}
      <rect x="35" y="145" width="12" height="12" rx="2" fill="#FFD93D" opacity="0.8" />
      <rect x="52" y="145" width="12" height="12" rx="2" fill="#FF6B9D" opacity="0.8" />
      <rect x="69" y="145" width="12" height="12" rx="2" fill="#98D8C8" opacity="0.8" />
      <rect x="86" y="145" width="12" height="12" rx="2" fill="#A8DAFF" opacity="0.8" />
      <rect x="103" y="145" width="12" height="12" rx="2" fill="#C8A2E0" opacity="0.8" />
      <rect x="120" y="145" width="12" height="12" rx="2" fill="#6BCF7F" opacity="0.8" />
      <rect x="137" y="145" width="12" height="12" rx="2" fill="#FFA07A" opacity="0.8" />
      <rect x="154" y="145" width="12" height="12" rx="2" fill="#FFB347" opacity="0.8" />
      
      {/* Sparkle effects */}
      <path d="M170 65 L172 70 L177 72 L172 74 L170 79 L168 74 L163 72 L168 70 Z" fill="#FFD93D" opacity="0.9" />
      <path d="M30 75 L32 80 L37 82 L32 84 L30 89 L28 84 L23 82 L28 80 Z" fill="#FF6B9D" opacity="0.8" />
      <path d="M175 115 L177 120 L182 122 L177 124 L175 129 L173 124 L168 122 L173 120 Z" fill="#87CEEB" opacity="0.7" />
    </svg>
  );
};

// Logo 2: Abstract mosaic pattern with "HI" integrated
export const AbstractMosaicLogo = ({ size = 120, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect x="10" y="10" width="180" height="180" rx="30" fill="url(#warmGradient)" />
      
      <defs>
        <linearGradient id="warmGradient" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF5E6" />
          <stop offset="100%" stopColor="#FFE4CC" />
        </linearGradient>
        <linearGradient id="rainbow1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#FFA07A" />
        </linearGradient>
        <linearGradient id="rainbow2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A8DAFF" />
          <stop offset="100%" stopColor="#98D8C8" />
        </linearGradient>
      </defs>
      
      {/* Mosaic pieces arranged in a celebratory pattern */}
      <g transform="translate(35, 40)">
        {/* H shape with organic mosaic tiles */}
        <path d="M0,0 L15,0 L15,45 L0,45 Z M0,35 L35,35 L35,50 L0,50 Z M50,0 L65,0 L65,90 L50,90 Z" fill="url(#rainbow1)" />
        
        {/* I shape */}
        <rect x="85" y="0" width="15" height="90" rx="4" fill="url(#rainbow2)" />
        
        {/* Decorative mosaic fragments */}
        <circle cx="5" cy="100" r="6" fill="#FFD93D" opacity="0.9" />
        <circle cx="25" cy="105" r="5" fill="#FF8FAB" opacity="0.85" />
        <circle cx="45" cy="100" r="7" fill="#6BCF7F" opacity="0.9" />
        <circle cx="65" cy="103" r="6" fill="#C8A2E0" opacity="0.85" />
        <circle cx="85" cy="100" r="5" fill="#FFB347" opacity="0.9" />
        <circle cx="100" cy="105" r="6" fill="#87CEEB" opacity="0.85" />
      </g>
    </svg>
  );
};

// Logo 3: Geometric and accessible with clear HI
export const GeometricMosaicLogo = ({ size = 120, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bg-gradient" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#FFFBF5" />
          <stop offset="100%" stopColor="#FFF0E0" />
        </linearGradient>
      </defs>
      
      {/* Clean background */}
      <rect width="200" height="200" rx="40" fill="url(#bg-gradient)" />
      
      {/* MOSAIC text arc on top */}
      <text
        x="100"
        y="35"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#8B7355"
        textAnchor="middle"
        letterSpacing="3"
      >
        MOSAIC
      </text>
      
      {/* Main HI with mosaic effect */}
      <g transform="translate(50, 60)">
        {/* Letter H */}
        <rect x="0" y="0" width="12" height="70" rx="2" fill="#FF6B9D" />
        <rect x="0" y="29" width="28" height="12" rx="2" fill="#FFD93D" />
        <rect x="28" y="0" width="12" height="70" rx="2" fill="#98D8C8" />
        
        {/* Gap between letters */}
        
        {/* Letter I with dot */}
        <rect x="60" y="0" width="12" height="70" rx="2" fill="#A8DAFF" />
        
        {/* Decorative elements around - celebrating diversity */}
        <circle cx="-8" cy="-8" r="4" fill="#FFA07A" opacity="0.7" />
        <circle cx="48" cy="-6" r="3" fill="#C8A2E0" opacity="0.7" />
        <circle cx="80" cy="-8" r="4" fill="#6BCF7F" opacity="0.7" />
        <circle cx="-10" cy="78" r="3" fill="#FFB347" opacity="0.7" />
        <circle cx="20" cy="82" r="4" fill="#87CEEB" opacity="0.7" />
        <circle cx="50" cy="80" r="3" fill="#FF8FAB" opacity="0.7" />
        <circle cx="82" cy="78" r="4" fill="#B19CD9" opacity="0.7" />
      </g>
      
      {/* MAGAZINE text on bottom */}
      <text
        x="100"
        y="165"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#8B7355"
        textAnchor="middle"
        letterSpacing="2"
      >
        MAGAZINE
      </text>
      
      {/* Inclusive pattern border (celebrating all students) */}
      <g opacity="0.5">
        <rect x="25" y="175" width="8" height="8" rx="2" fill="#FF6B9D" />
        <rect x="38" y="175" width="8" height="8" rx="2" fill="#FFD93D" />
        <rect x="51" y="175" width="8" height="8" rx="2" fill="#98D8C8" />
        <rect x="64" y="175" width="8" height="8" rx="2" fill="#A8DAFF" />
        <rect x="77" y="175" width="8" height="8" rx="2" fill="#FFA07A" />
        <rect x="90" y="175" width="8" height="8" rx="2" fill="#C8A2E0" />
        <rect x="103" y="175" width="8" height="8" rx="2" fill="#6BCF7F" />
        <rect x="116" y="175" width="8" height="8" rx="2" fill="#FFB347" />
        <rect x="129" y="175" width="8" height="8" rx="2" fill="#87CEEB" />
        <rect x="142" y="175" width="8" height="8" rx="2" fill="#FF8FAB" />
        <rect x="155" y="175" width="8" height="8" rx="2" fill="#B19CD9" />
      </g>
    </svg>
  );
};

// Logo 4: Playful stacked tiles with HI
export const StackedTilesLogo = ({ size = 120, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
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
      
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="#FFFBF5" />
      
      {/* Stacked mosaic tiles forming HI - 3D effect */}
      <g filter="url(#soft-shadow)">
        {/* H - left vertical stack */}
        <rect x="45" y="50" width="20" height="22" rx="3" fill="#FF6B9D" />
        <rect x="47" y="52" width="16" height="18" rx="2" fill="#FF8FAB" opacity="0.6" />
        
        <rect x="45" y="76" width="20" height="22" rx="3" fill="#FFD93D" />
        <rect x="47" y="78" width="16" height="18" rx="2" fill="#FFE66D" opacity="0.6" />
        
        <rect x="45" y="102" width="20" height="22" rx="3" fill="#98D8C8" />
        <rect x="47" y="104" width="16" height="18" rx="2" fill="#B8F2E6" opacity="0.6" />
        
        {/* H - horizontal bar */}
        <rect x="69" y="85" width="22" height="20" rx="3" fill="#FFA07A" />
        <rect x="71" y="87" width="18" height="16" rx="2" fill="#FFB89A" opacity="0.6" />
        
        {/* H - right vertical stack */}
        <rect x="95" y="50" width="20" height="22" rx="3" fill="#A8DAFF" />
        <rect x="97" y="52" width="16" height="18" rx="2" fill="#C8E8FF" opacity="0.6" />
        
        <rect x="95" y="76" width="20" height="22" rx="3" fill="#C8A2E0" />
        <rect x="97" y="78" width="16" height="18" rx="2" fill="#D8B2F0" opacity="0.6" />
        
        <rect x="95" y="102" width="20" height="22" rx="3" fill="#6BCF7F" />
        <rect x="97" y="104" width="16" height="18" rx="2" fill="#8BDF9F" opacity="0.6" />
        
        {/* I - vertical stack */}
        <rect x="135" y="50" width="20" height="22" rx="3" fill="#FFB347" />
        <rect x="137" y="52" width="16" height="18" rx="2" fill="#FFC367" opacity="0.6" />
        
        <rect x="135" y="76" width="20" height="22" rx="3" fill="#87CEEB" />
        <rect x="137" y="78" width="16" height="18" rx="2" fill="#A7DEFB" opacity="0.6" />
        
        <rect x="135" y="102" width="20" height="22" rx="3" fill="#B19CD9" />
        <rect x="137" y="104" width="16" height="18" rx="2" fill="#C1ACE9" opacity="0.6" />
      </g>
      
      {/* Celebration confetti */}
      <g opacity="0.8">
        <circle cx="30" cy="70" r="3" fill="#FFD93D" />
        <circle cx="25" cy="110" r="2.5" fill="#FF6B9D" />
        <rect x="168" y="65" width="5" height="5" rx="1" fill="#98D8C8" transform="rotate(15 170 67)" />
        <circle cx="175" cy="95" r="3" fill="#C8A2E0" />
        <rect x="170" y="120" width="4" height="4" rx="1" fill="#FFA07A" transform="rotate(-20 172 122)" />
        <circle cx="35" cy="140" r="2" fill="#87CEEB" />
      </g>
      
      {/* Text labels */}
      <text
        x="100"
        y="155"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#8B7355"
        textAnchor="middle"
        letterSpacing="4"
      >
        MOSAIC
      </text>
      <text
        x="100"
        y="172"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="#A89080"
        textAnchor="middle"
        letterSpacing="2"
      >
        magazine
      </text>
    </svg>
  );
};

// Logo 5: Minimal and accessible - highly readable
export const MinimalAccessibleLogo = ({ size = 120, className = '' }: { size?: number; className?: string }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Clean white background with subtle border */}
      <rect width="200" height="200" rx="35" fill="#FFFFFF" />
      <rect x="5" y="5" width="190" height="190" rx="30" stroke="#F0E6D8" strokeWidth="2" fill="none" />
      
      {/* Bold, clear HI */}
      <g transform="translate(45, 65)">
        {/* H */}
        <rect x="0" y="0" width="16" height="70" rx="3" fill="#8B7355" />
        <rect x="0" y="27" width="34" height="16" rx="3" fill="#8B7355" />
        <rect x="34" y="0" width="16" height="70" rx="3" fill="#8B7355" />
        
        {/* I */}
        <rect x="70" y="0" width="16" height="70" rx="3" fill="#D4A574" />
        
        {/* Colorful accent dots - representing diversity */}
        <circle cx="8" cy="-12" r="5" fill="#FF6B9D" />
        <circle cx="42" cy="-12" r="5" fill="#98D8C8" />
        <circle cx="78" cy="-12" r="5" fill="#FFD93D" />
        
        <circle cx="8" cy="82" r="5" fill="#A8DAFF" />
        <circle cx="42" cy="82" r="5" fill="#C8A2E0" />
        <circle cx="78" cy="82" r="5" fill="#6BCF7F" />
      </g>
      
      {/* Text */}
      <text
        x="100"
        y="160"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#8B7355"
        textAnchor="middle"
        letterSpacing="3"
      >
        MOSAIC
      </text>
      <text
        x="100"
        y="178"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="#A89080"
        textAnchor="middle"
        letterSpacing="1.5"
      >
        MAGAZINE
      </text>
    </svg>
  );
};

// Demo component to showcase all logos
export const LogoShowcase = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center mb-2">Mosaic Magazine HI - Logo Concepts</h1>
        <p className="text-center text-gray-600 mb-12">Modern, neurodivergent-friendly designs celebrating student work and culture</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <MosaicTilesLogo size={160} />
            </div>
            <h3 className="text-center mb-2">Mosaic Tiles</h3>
            <p className="text-center text-gray-600 text-sm">Colorful tiles forming HI with celebration sparkles</p>
          </div>
          
          {/* Logo 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <AbstractMosaicLogo size={160} />
            </div>
            <h3 className="text-center mb-2">Abstract Mosaic</h3>
            <p className="text-center text-gray-600 text-sm">Organic shapes with gradient warmth</p>
          </div>
          
          {/* Logo 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <GeometricMosaicLogo size={160} />
            </div>
            <h3 className="text-center mb-2">Geometric Clear</h3>
            <p className="text-center text-gray-600 text-sm">Clean, accessible with diversity pattern</p>
          </div>
          
          {/* Logo 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <StackedTilesLogo size={160} />
            </div>
            <h3 className="text-center mb-2">Stacked Tiles</h3>
            <p className="text-center text-gray-600 text-sm">3D layered effect with confetti celebration</p>
          </div>
          
          {/* Logo 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-center mb-4">
              <MinimalAccessibleLogo size={160} />
            </div>
            <h3 className="text-center mb-2">Minimal Accessible</h3>
            <p className="text-center text-gray-600 text-sm">Highly readable with colorful diversity accents</p>
          </div>
          
          {/* Size variations demo */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center gap-4 mb-4">
              <GeometricMosaicLogo size={80} />
              <GeometricMosaicLogo size={60} />
              <GeometricMosaicLogo size={40} />
            </div>
            <h3 className="text-center mb-2">Size Variations</h3>
            <p className="text-center text-gray-600 text-sm">Scalable for different contexts</p>
          </div>
        </div>
        
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="mb-4">Design Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="mb-2">🎨 Neurodivergent-Friendly</h4>
              <ul className="text-gray-700 space-y-1 text-sm list-disc list-inside">
                <li>Clear, readable letterforms</li>
                <li>Balanced visual weight</li>
                <li>Soft, non-overwhelming colors</li>
                <li>Consistent structure with variety</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2">🌈 Celebrating Diversity</h4>
              <ul className="text-gray-700 space-y-1 text-sm list-disc list-inside">
                <li>Multiple colors representing all students</li>
                <li>Mosaic pattern = many pieces = one community</li>
                <li>Warm, welcoming color palette</li>
                <li>Inclusive and joyful design</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2">✨ Modern & Professional</h4>
              <ul className="text-gray-700 space-y-1 text-sm list-disc list-inside">
                <li>Clean geometric shapes</li>
                <li>Contemporary color combinations</li>
                <li>Scalable SVG format</li>
                <li>Versatile for digital and print</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2">🏝️ Hawaiian Identity (HI)</h4>
              <ul className="text-gray-700 space-y-1 text-sm list-disc list-inside">
                <li>Bold "HI" letterforms</li>
                <li>Warm tropical color palette</li>
                <li>Community-focused design</li>
                <li>Celebrating local student culture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
