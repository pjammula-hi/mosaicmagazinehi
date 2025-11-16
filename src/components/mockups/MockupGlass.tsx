import React from 'react';
import { Sparkles, Star, TrendingUp, Users, Award, ArrowUpRight, Circle } from 'lucide-react';

/**
 * MOCKUP 4: GLASSMORPHISM MODERN
 * Inspired by: iOS, macOS Big Sur, modern web apps
 * Features: Frosted glass effects, vibrant gradients, depth, floating elements
 */

export default function MockupGlass() {
  const submissions = [
    { id: 1, title: "Climate Action in NYC Schools", author: "Sarah Chen", status: "pending", priority: "high", score: 95 },
    { id: 2, title: "Mental Health Awareness", author: "Marcus Johnson", status: "review", priority: "medium", score: 88 },
    { id: 3, title: "Poetry: Urban Dreams", author: "Aisha Patel", status: "approved", priority: "high", score: 92 },
    { id: 4, title: "Photography Essay", author: "James Rodriguez", status: "pending", priority: "low", score: 78 },
  ];

  const stats = [
    { label: "Total Views", value: "12.4K", icon: TrendingUp, gradient: "from-cyan-400 to-blue-500" },
    { label: "Contributors", value: "156", icon: Users, gradient: "from-purple-400 to-pink-500" },
    { label: "Top Rated", value: "45", icon: Award, gradient: "from-orange-400 to-red-500" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-white tracking-tight" style={{ fontSize: '24px', fontWeight: '700' }}>MOSAIC Magazine</h1>
                <p className="text-white/70" style={{ fontSize: '14px' }}>Editor Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="backdrop-blur-xl bg-white/20 rounded-2xl px-6 py-3 border border-white/30">
                <p className="text-white/70" style={{ fontSize: '12px' }}>Current Issue</p>
                <p className="text-white" style={{ fontSize: '16px', fontWeight: '600' }}>Spring 2025</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white/30 shadow-lg" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white/70 mb-2" style={{ fontSize: '13px', fontWeight: '500' }}>{stat.label}</p>
              <p className="text-white" style={{ fontSize: '32px', fontWeight: '700' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="col-span-2 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '22px', fontWeight: '700' }}>Recent Submissions</h2>
              <button className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl transition-all border border-white/30" style={{ fontSize: '14px', fontWeight: '600' }}>
                View All
              </button>
            </div>

            <div className="space-y-4">
              {submissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white" style={{ fontSize: '16px', fontWeight: '600' }}>
                          {submission.title}
                        </h3>
                        {submission.priority === 'high' && (
                          <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        )}
                      </div>
                      <p className="text-white/60" style={{ fontSize: '14px' }}>by {submission.author}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="backdrop-blur-xl bg-white/20 rounded-xl px-3 py-1.5 border border-white/30">
                        <p className="text-white" style={{ fontSize: '13px', fontWeight: '600' }}>{submission.score}%</p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-xl backdrop-blur-xl border border-white/30 ${
                          submission.status === 'approved' ? 'bg-green-400/30 text-green-100' :
                          submission.status === 'review' ? 'bg-blue-400/30 text-blue-100' :
                          'bg-orange-400/30 text-orange-100'
                        }`}
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl transition-all border border-white/30" style={{ fontSize: '13px', fontWeight: '500' }}>
                      Review
                    </button>
                    <button className="flex-1 backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl transition-all border border-white/30" style={{ fontSize: '13px', fontWeight: '500' }}>
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-white mb-4" style={{ fontSize: '18px', fontWeight: '700' }}>Quick Actions</h3>
              <div className="space-y-3">
                {['New Submission', 'Create Issue', 'Add Contributor', 'Send Update'].map((action) => (
                  <button
                    key={action}
                    className="w-full backdrop-blur-xl bg-white/10 hover:bg-white/20 text-white text-left px-4 py-3 rounded-xl transition-all border border-white/20"
                    style={{ fontSize: '14px', fontWeight: '500' }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-white mb-4" style={{ fontSize: '18px', fontWeight: '700' }}>Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shadow-lg shadow-cyan-400/50" />
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: '13px', fontWeight: '500' }}>New submission received</p>
                      <p className="text-white/60" style={{ fontSize: '12px' }}>{i * 5} minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Orb */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <Circle className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
              <p className="text-white/70 mb-2" style={{ fontSize: '13px' }}>Deadline</p>
              <p className="text-white mb-1" style={{ fontSize: '24px', fontWeight: '700' }}>12 Days</p>
              <p className="text-white/60" style={{ fontSize: '13px' }}>Until Spring Issue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
