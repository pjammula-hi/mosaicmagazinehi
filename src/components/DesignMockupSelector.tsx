import React from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import MockupMinimalist from './mockups/MockupMinimalist';
import MockupVibrant from './mockups/MockupVibrant';
import MockupEditorial from './mockups/MockupEditorial';
import MockupGlass from './mockups/MockupGlass';
import MockupNeoBrutalism from './mockups/MockupNeoBrutalism';

/**
 * Design Mockup Selector
 * Allows stakeholders to preview and choose from 5 different design directions
 */

export default function DesignMockupSelector() {
  const [selectedMockup, setSelectedMockup] = React.useState(0);

  console.log('[DesignMockupSelector] Component rendering');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMockup]);

  const mockups = [
    {
      id: 0,
      name: 'Minimalist Modern',
      description: 'Clean, spacious, and focused. Perfect for distraction-free content management.',
      tags: ['Professional', 'Clean', 'Spacious', 'Easy to Navigate'],
      inspiration: 'Notion, Linear, Arc Browser',
      component: MockupMinimalist,
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 1,
      name: 'Vibrant Magazine',
      description: 'Bold and energetic with colorful gradients. Brings excitement to the editorial process.',
      tags: ['Colorful', 'Energetic', 'Modern', 'Engaging'],
      inspiration: 'Spotify, Stripe, Modern Design Systems',
      component: MockupVibrant,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 2,
      name: 'Sophisticated Editorial',
      description: 'Elegant typography with dark mode support. A refined, publication-first approach.',
      tags: ['Elegant', 'Premium', 'Dark Mode', 'Typography-focused'],
      inspiration: 'NY Times, The Atlantic, Medium Premium',
      component: MockupEditorial,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 3,
      name: 'Glassmorphism',
      description: 'Frosted glass effects with vibrant backgrounds. Modern, depth-rich, and visually stunning.',
      tags: ['Modern', 'Depth', 'Vibrant', 'iOS-inspired'],
      inspiration: 'iOS, macOS Big Sur, Modern Web Apps',
      component: MockupGlass,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 4,
      name: 'Neo-Brutalism',
      description: 'Bold, geometric, and high-contrast. Makes a strong statement with playful energy.',
      tags: ['Bold', 'Playful', 'High Contrast', 'Trendy'],
      inspiration: 'Gumroad, Brutalist Web Design, Y2K',
      component: MockupNeoBrutalism,
      color: 'from-yellow-400 to-red-500'
    },
  ];

  const handlePrevious = () => {
    setSelectedMockup((prev) => (prev === 0 ? mockups.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedMockup((prev) => (prev === mockups.length - 1 ? 0 : prev + 1));
  };

  const currentMockup = mockups[selectedMockup];
  const CurrentComponent = currentMockup.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Control Panel */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
        <div className="px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: '700' }}>
                    Dashboard Design Mockups
                  </h1>
                </div>
                <p className="text-gray-600" style={{ fontSize: '14px' }}>
                  Choose the design direction that best fits Mosaic Magazine's vision
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  aria-label="Previous mockup"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div className="flex items-center gap-2">
                  {mockups.map((mockup, idx) => (
                    <button
                      key={mockup.id}
                      onClick={() => setSelectedMockup(idx)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        selectedMockup === idx
                          ? `bg-gradient-to-br ${mockup.color} shadow-lg`
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={`View ${mockup.name}`}
                    >
                      {selectedMockup === idx && (
                        <Check className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  aria-label="Next mockup"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Current Mockup Info */}
            <div className={`bg-gradient-to-r ${currentMockup.color} rounded-2xl p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 style={{ fontSize: '28px', fontWeight: '700' }}>
                      {selectedMockup + 1}. {currentMockup.name}
                    </h2>
                  </div>
                  <p className="text-white/90 mb-4" style={{ fontSize: '15px' }}>
                    {currentMockup.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentMockup.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-white/80" style={{ fontSize: '13px' }}>
                    Inspired by: {currentMockup.inspiration}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:shadow-xl transition-all" style={{ fontSize: '14px', fontWeight: '700' }}>
                    Select This Design
                  </button>
                  <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl hover:bg-white/30 transition-all" style={{ fontSize: '14px', fontWeight: '600' }}>
                    View Fullscreen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mockup Preview */}
      <div className="p-8">
        <div className="max-w-[1920px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-gray-400 text-xs font-mono">
              mosaic-magazine-editor-dashboard.preview
            </span>
          </div>
          
          <div className="relative" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
            <CurrentComponent />
          </div>
        </div>
      </div>

      {/* Navigation Hint */}
      <div className="fixed bottom-8 right-8 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl">
        <p style={{ fontSize: '13px', fontWeight: '600' }}>
          Use arrow buttons or keyboard ← → to navigate
        </p>
      </div>
    </div>
  );
}
