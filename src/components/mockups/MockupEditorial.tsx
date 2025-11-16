import React from 'react';
import { Book, Moon, Bell, Search, ChevronRight, Bookmark, Clock } from 'lucide-react';

/**
 * MOCKUP 3: SOPHISTICATED EDITORIAL
 * Inspired by: NY Times, The Atlantic, Medium (premium)
 * Features: Elegant typography, serif fonts, editorial layout, dark mode ready
 */

export default function MockupEditorial() {
  const [darkMode, setDarkMode] = React.useState(false);

  const featuredStories = [
    { 
      id: 1, 
      title: "The Future of Climate Action in New York City Schools",
      author: "Sarah Chen",
      category: "Environment",
      readTime: "8 min read",
      excerpt: "A comprehensive look at how NYC students are leading the charge in environmental activism and sustainability initiatives across the five boroughs.",
      image: "https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=800"
    },
    { 
      id: 2, 
      title: "Student Voices: Navigating Mental Health in Modern Education",
      author: "Marcus Johnson",
      category: "Wellness",
      readTime: "6 min read",
      excerpt: "Candid conversations with students about the challenges and triumphs of maintaining mental wellness in today's academic environment.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
    },
  ];

  const quickLinks = [
    { label: "Pending Review", count: 12, color: "text-amber-600" },
    { label: "In Progress", count: 8, color: "text-blue-600" },
    { label: "Published", count: 45, color: "text-green-600" },
    { label: "Drafts", count: 23, color: "text-gray-600" },
  ];

  const bgColor = darkMode ? 'bg-[#1a1a1a]' : 'bg-[#faf9f6]';
  const cardBg = darkMode ? 'bg-[#242424]' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Book className={`w-6 h-6 ${textPrimary}`} />
                <div>
                  <h1 className={`${textPrimary} tracking-tight`} style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
                    MOSAIC
                  </h1>
                  <p className={`${textSecondary}`} style={{ fontSize: '11px', letterSpacing: '0.05em' }}>MAGAZINE HI</p>
                </div>
              </div>
              
              <nav className="flex items-center gap-6 ml-12">
                {['Editorial', 'Submissions', 'Issues', 'Contributors'].map((item) => (
                  <button key={item} className={`${textSecondary} hover:${textPrimary} transition-colors`} style={{ fontSize: '14px', fontWeight: '500' }}>
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button className={`p-2 ${textSecondary} hover:${textPrimary}`}>
                <Search className="w-5 h-5" />
              </button>
              <button className={`p-2 ${textSecondary} hover:${textPrimary}`}>
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${textSecondary} hover:${textPrimary}`}
              >
                <Moon className="w-5 h-5" />
              </button>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500`} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h2 className={`${textPrimary} mb-3`} style={{ fontSize: '42px', fontWeight: '600', fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            Editor's Desk
          </h2>
          <p className={`${textSecondary}`} style={{ fontSize: '17px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Curating excellence in student journalism
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              className={`${cardBg} border ${borderColor} p-6 text-left hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className={`${textSecondary}`} style={{ fontSize: '13px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {link.label}
                </p>
                <ChevronRight className={`w-4 h-4 ${textSecondary} group-hover:translate-x-1 transition-transform`} />
              </div>
              <p className={`${link.color}`} style={{ fontSize: '32px', fontWeight: '600', fontFamily: 'Georgia, serif' }}>
                {link.count}
              </p>
            </button>
          ))}
        </div>

        {/* Featured Stories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${textPrimary}`} style={{ fontSize: '24px', fontWeight: '600', fontFamily: 'Georgia, serif' }}>
              Featured for Review
            </h3>
            <button className={`${textSecondary} hover:${textPrimary} flex items-center gap-2`} style={{ fontSize: '14px' }}>
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-8">
            {featuredStories.map((story, idx) => (
              <article key={story.id} className={`${cardBg} border ${borderColor} overflow-hidden hover:shadow-xl transition-all group cursor-pointer`}>
                <div className="grid grid-cols-3 gap-0">
                  <div className="col-span-2 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-amber-600 tracking-wider`} style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em' }}>
                        {story.category.toUpperCase()}
                      </span>
                      <span className={`${textSecondary}`}>•</span>
                      <span className={`${textSecondary} flex items-center gap-1.5`} style={{ fontSize: '13px' }}>
                        <Clock className="w-3.5 h-3.5" />
                        {story.readTime}
                      </span>
                    </div>
                    
                    <h4 className={`${textPrimary} mb-3 group-hover:text-amber-600 transition-colors`} style={{ fontSize: '28px', fontWeight: '600', fontFamily: 'Georgia, serif', lineHeight: '1.3' }}>
                      {story.title}
                    </h4>
                    
                    <p className={`${textSecondary} mb-4`} style={{ fontSize: '16px', lineHeight: '1.6', fontFamily: 'Georgia, serif' }}>
                      {story.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className={`${textSecondary}`} style={{ fontSize: '14px' }}>
                        By <span className={textPrimary}>{story.author}</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <button className={`px-5 py-2 border ${borderColor} ${textPrimary} hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-800' : ''} transition-colors`} style={{ fontSize: '14px', fontWeight: '500' }}>
                          Review
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                          <Bookmark className={`w-4 h-4 ${textSecondary}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`${cardBg} border ${borderColor} p-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`${textPrimary} mb-2`} style={{ fontSize: '20px', fontWeight: '600', fontFamily: 'Georgia, serif' }}>
                Spring Issue 2025
              </h3>
              <p className={`${textSecondary}`} style={{ fontSize: '15px' }}>
                12 submissions pending • Deadline in 12 days
              </p>
            </div>
            <button className={`px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg transition-all`} style={{ fontSize: '14px', fontWeight: '600' }}>
              Manage Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
