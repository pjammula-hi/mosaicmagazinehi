import React from 'react';
import { Sparkles, Zap, TrendingUp, Users, FileText, Star, ArrowRight, Calendar } from 'lucide-react';

/**
 * MOCKUP 2: VIBRANT MAGAZINE
 * Inspired by: Spotify, Stripe, modern design systems
 * Features: Bold gradients, vibrant colors, energetic cards
 */

export default function MockupVibrant() {
  const featuredSubmissions = [
    { id: 1, title: "Climate Action in NYC", author: "Sarah Chen", gradient: "from-purple-500 to-pink-500", category: "Featured" },
    { id: 2, title: "Mental Health Awareness", author: "Marcus Johnson", gradient: "from-blue-500 to-cyan-500", category: "Trending" },
    { id: 3, title: "Urban Dreams Poetry", author: "Aisha Patel", gradient: "from-orange-500 to-red-500", category: "New" },
  ];

  const quickStats = [
    { icon: FileText, label: "Submissions", value: "234", bg: "bg-gradient-to-br from-violet-500 to-purple-600" },
    { icon: Users, label: "Contributors", value: "156", bg: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { icon: Star, label: "Published", value: "89", bg: "bg-gradient-to-br from-orange-500 to-pink-600" },
    { icon: TrendingUp, label: "Engagement", value: "+23%", bg: "bg-gradient-to-br from-green-500 to-emerald-600" },
  ];

  const recentActivity = [
    { action: "New submission", item: "Photography: NYC Through Our Eyes", time: "2 min ago", color: "text-purple-600", bgColor: "bg-purple-100" },
    { action: "Approved", item: "Student Voices: Mental Health", time: "15 min ago", color: "text-green-600", bgColor: "bg-green-100" },
    { action: "Comment added", item: "The Future of Climate Action", time: "1 hour ago", color: "text-blue-600", bgColor: "bg-blue-100" },
    { action: "Published", item: "Poetry Collection: Urban Dreams", time: "3 hours ago", color: "text-orange-600", bgColor: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="tracking-tight" style={{ fontSize: '18px', fontWeight: '700' }}>MOSAIC Magazine</h1>
              <p className="text-gray-500" style={{ fontSize: '12px' }}>Editor Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2" style={{ fontSize: '14px', fontWeight: '600' }}>
              <Zap className="w-4 h-4" />
              Quick Create
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500" />
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2" style={{ fontSize: '36px', fontWeight: '800' }}>
            Welcome back! 👋
          </h2>
          <p className="text-gray-600" style={{ fontSize: '16px' }}>You have 12 submissions pending review and 5 new contributors.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-transform cursor-pointer`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <stat.icon className="w-8 h-8 mb-3 opacity-90" />
              <p className="opacity-90 mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>{stat.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '700' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Featured Submissions */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: '700' }}>Featured Submissions</h3>
              <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {featuredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
                <div className="flex gap-4">
                  <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${submission.gradient} flex-shrink-0 group-hover:scale-105 transition-transform`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${submission.gradient} text-white text-xs mb-2`} style={{ fontWeight: '600' }}>
                          {submission.category}
                        </span>
                        <h4 className="text-gray-900 mb-1" style={{ fontSize: '18px', fontWeight: '600' }}>{submission.title}</h4>
                        <p className="text-gray-500" style={{ fontSize: '14px' }}>by {submission.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" style={{ fontSize: '14px', fontWeight: '500' }}>
                        Review
                      </button>
                      <button className={`px-4 py-2 bg-gradient-to-r ${submission.gradient} text-white rounded-lg hover:shadow-lg transition-all`} style={{ fontSize: '14px', fontWeight: '500' }}>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div>
            <h3 className="text-gray-900 mb-4" style={{ fontSize: '20px', fontWeight: '700' }}>Recent Activity</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.bgColor}`} />
                    <div className="flex-1">
                      <p className={`mb-1 ${activity.color}`} style={{ fontSize: '13px', fontWeight: '600' }}>{activity.action}</p>
                      <p className="text-gray-900 mb-1" style={{ fontSize: '14px' }}>{activity.item}</p>
                      <p className="text-gray-400" style={{ fontSize: '12px' }}>{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Widget */}
            <div className="mt-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <Calendar className="w-8 h-8 mb-3 opacity-90" />
              <p className="opacity-90 mb-1" style={{ fontSize: '13px', fontWeight: '500' }}>Upcoming Deadline</p>
              <p className="mb-1" style={{ fontSize: '20px', fontWeight: '700' }}>Spring Issue 2025</p>
              <p className="opacity-90" style={{ fontSize: '14px' }}>Due in 12 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
