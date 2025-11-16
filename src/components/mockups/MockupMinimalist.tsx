import React from 'react';
import { Search, Plus, Filter, MoreVertical, Heart, MessageCircle, Eye, TrendingUp, Clock, Calendar } from 'lucide-react';

/**
 * MOCKUP 1: MINIMALIST MODERN
 * Inspired by: Notion, Linear, Arc Browser
 * Features: Clean, lots of white space, subtle shadows, muted colors
 */

export default function MockupMinimalist() {
  const submissions = [
    { id: 1, title: "The Future of Climate Action in NYC Schools", author: "Sarah Chen", type: "Article", status: "Pending Review", date: "2 hours ago", views: 234, likes: 12 },
    { id: 2, title: "Student Voices: Mental Health Awareness", author: "Marcus Johnson", type: "Essay", status: "In Review", date: "5 hours ago", views: 189, likes: 24 },
    { id: 3, title: "Poetry Collection: Urban Dreams", author: "Aisha Patel", type: "Poetry", status: "Approved", date: "1 day ago", views: 456, likes: 67 },
    { id: 4, title: "Photography: NYC Through Our Eyes", author: "James Rodriguez", type: "Photo Essay", status: "Pending Review", date: "2 days ago", views: 892, likes: 143 },
  ];

  const stats = [
    { label: "Total Submissions", value: "234", change: "+12%", trend: "up" },
    { label: "Pending Review", value: "42", change: "+5", trend: "up" },
    { label: "Published This Month", value: "89", change: "+23%", trend: "up" },
    { label: "Active Contributors", value: "156", change: "+8%", trend: "up" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="tracking-tight" style={{ fontSize: '20px', fontWeight: '600' }}>MOSAIC</h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>Magazine HI</p>
        </div>
        
        <nav className="px-3 space-y-1">
          {['Dashboard', 'Submissions', 'Issues', 'Contributors', 'Analytics', 'Settings'].map((item, idx) => (
            <button
              key={item}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                idx === 0 ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontSize: '14px' }}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-56 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2" style={{ fontSize: '28px', fontWeight: '600' }}>Good afternoon, Editor</h2>
          <p className="text-gray-500" style={{ fontSize: '15px' }}>Here's what's happening with your magazine today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-gray-500 mb-2" style={{ fontSize: '13px' }}>{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: '600' }}>{stat.value}</span>
                <div className="flex items-center gap-1 text-green-600" style={{ fontSize: '13px', fontWeight: '500' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900" style={{ fontSize: '18px', fontWeight: '600' }}>Recent Submissions</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400"
                    style={{ fontSize: '14px', width: '240px' }}
                  />
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg border border-gray-200">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2" style={{ fontSize: '14px', fontWeight: '500' }}>
                  <Plus className="w-4 h-4" />
                  New Submission
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {submissions.map((submission) => (
              <div key={submission.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1" style={{ fontSize: '15px', fontWeight: '500' }}>{submission.title}</h4>
                    <div className="flex items-center gap-4 text-gray-500" style={{ fontSize: '13px' }}>
                      <span>{submission.author}</span>
                      <span>•</span>
                      <span>{submission.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {submission.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        submission.status === 'Approved' ? 'bg-green-50 text-green-700' :
                        submission.status === 'In Review' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}
                      style={{ fontSize: '12px', fontWeight: '500' }}
                    >
                      {submission.status}
                    </span>
                    <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: '13px' }}>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {submission.views}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        {submission.likes}
                      </span>
                    </div>
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
