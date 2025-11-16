import { BookOpen } from 'lucide-react';
import craftImage from 'figma:asset/84df7b839cb17ab37c60ffd8ae6b35583c9e0a18.png';

interface MagazineCardProps {
  position: 'left' | 'right';
  issueNumber: number;
  season: string;
  year: number;
  featured: string;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  contents: string[];
  coverImage?: string;
}

export function MagazineCard({
  position,
  issueNumber,
  season,
  year,
  featured,
  gradientFrom,
  gradientVia,
  gradientTo,
  contents,
  coverImage = craftImage
}: MagazineCardProps) {
  const isLeft = position === 'left';
  
  const gradientStyle = gradientVia 
    ? `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientVia} 50%, ${gradientTo} 100%)`
    : `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`;
  
  return (
    <div 
      className={`absolute ${isLeft ? 'left-16 2xl:left-24' : 'right-16 2xl:right-24'} top-1/2 -translate-y-1/2 hidden xl:block`}
      style={{
        perspective: '2000px',
      }}
    >
      {/* Magazine Card with 3D perspective */}
      <div
        className="w-[266px] transition-all duration-700 hover:scale-[1.02]"
        style={{
          transform: isLeft 
            ? 'rotateY(15deg) rotateZ(-3deg)' 
            : 'rotateY(-15deg) rotateZ(3deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] blur-3xl opacity-50 -z-10"
          style={{
            background: gradientStyle,
          }}
        ></div>

        {/* Magazine Card */}
        <div 
          className="rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          style={{
            background: gradientStyle,
            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
          }}
        >
          {/* Header with Logo and Title */}
          <div className="p-5 pb-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 
                  className="text-white tracking-tight" 
                  style={{ 
                    fontWeight: '800',
                    fontSize: '27px',
                    letterSpacing: '0.02em'
                  }}
                >
                  MOSAIC
                </h2>
              </div>
            </div>
            <p 
              className="text-white/95" 
              style={{ 
                fontSize: '11px',
                fontWeight: '400',
                letterSpacing: '0.01em'
              }}
            >
              Student Creative Works
            </p>
          </div>

          {/* Magazine Cover Photo - Student Crafts */}
          <div className="px-5 pb-4">
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black">
              <img 
                src={coverImage} 
                alt="Student creative work" 
                className="w-full h-[196px] object-cover"
              />
            </div>
          </div>

          {/* Edition Badge */}
          <div className="px-5 pb-4">
            <div className="space-y-1">
              <p 
                className="text-white" 
                style={{ 
                  fontWeight: '700',
                  fontSize: '13px',
                  lineHeight: '1.3'
                }}
              >
                {season} {year} Edition
              </p>
              <p 
                className="text-white/90" 
                style={{ 
                  fontSize: '10px',
                  fontWeight: '400'
                }}
              >
                {featured}
              </p>
            </div>
          </div>

          {/* Contents Section - White Background */}
          <div 
            className="rounded-b-[2.5rem] p-5 pt-5"
            style={{
              background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
            }}
          >
            <h3 
              className="text-gray-700 mb-3.5 uppercase tracking-wide" 
              style={{ 
                fontWeight: '800',
                fontSize: '9px',
                letterSpacing: '0.08em'
              }}
            >
              IN THIS ISSUE
            </h3>
            <ul className="space-y-2">
              {contents.map((item, idx) => (
                <li 
                  key={idx} 
                  className="text-gray-700 flex items-start gap-2"
                  style={{
                    fontSize: '10px',
                    fontWeight: '400'
                  }}
                >
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preset magazine configurations
export const holidayIssue = {
  issueNumber: 1,
  season: 'Christmas, Kwanza, Hanukkah and Winter Holidays',
  year: 2025,
  featured: 'Featured: 50+ student works',
  gradientFrom: '#ff4d9d', // Hot Pink
  gradientVia: '#a855f7',  // Purple
  gradientTo: '#6366f1',   // Indigo/Blue
  contents: [
    'Poetry & Prose',
    'Student Artwork',
    'Photography',
    'Creative Writing',
    'Digital Media'
  ]
};

export const fallIssue = {
  issueNumber: 2,
  season: 'Fall',
  year: 2024,
  featured: 'Featured: 45+ creative pieces',
  gradientFrom: '#f59e0b', // Amber
  gradientTo: '#ef4444',  // Red
  contents: [
    'Short Stories',
    'Visual Arts',
    'Student Essays',
    'Comics & Graphics',
    'Music & Performance'
  ]
};

export const winterIssue = {
  issueNumber: 3,
  season: 'Winter',
  year: 2025,
  featured: 'Featured: 40+ inspiring works',
  gradientFrom: '#06b6d4', // Cyan
  gradientTo: '#3b82f6',  // Blue
  contents: [
    'Winter Reflections',
    'Holiday Stories',
    'Visual Narratives',
    'Cultural Celebrations',
    'STEM Projects'
  ]
};

export const summerIssue = {
  issueNumber: 4,
  season: 'Summer',
  year: 2024,
  featured: 'Featured: 35+ summer stories',
  gradientFrom: '#10b981', // Emerald
  gradientTo: '#14b8a6',  // Teal
  contents: [
    'Summer Adventures',
    'Nature Photography',
    'Travel Writing',
    'Environmental Art',
    'Science Experiments'
  ]
};
