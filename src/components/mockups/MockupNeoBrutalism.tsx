import React from 'react';
import { Zap, Flame, Star, TrendingUp, ChevronRight, Plus, AlertCircle } from 'lucide-react';

/**
 * MOCKUP 5: NEO-BRUTALISM
 * Inspired by: Gumroad redesign, brutalist web design, y2k aesthetics
 * Features: Bold borders, high contrast, geometric shapes, playful colors
 */

export default function MockupNeoBrutalism() {
  const submissions = [
    { id: 1, title: "Climate Action in NYC Schools", author: "Sarah Chen", status: "HOT", color: "bg-red-400", border: "border-red-600" },
    { id: 2, title: "Mental Health Awareness", author: "Marcus Johnson", status: "NEW", color: "bg-cyan-400", border: "border-cyan-600" },
    { id: 3, title: "Poetry: Urban Dreams", author: "Aisha Patel", status: "TOP", color: "bg-yellow-400", border: "border-yellow-600" },
    { id: 4, title: "Photography Essay", author: "James Rodriguez", status: "NEW", color: "bg-purple-400", border: "border-purple-600" },
  ];

  const stats = [
    { label: "SUBMISSIONS", value: "234", color: "bg-cyan-400", border: "border-cyan-600", shadow: "shadow-cyan-600" },
    { label: "PENDING", value: "42", color: "bg-yellow-400", border: "border-yellow-600", shadow: "shadow-yellow-600" },
    { label: "PUBLISHED", value: "89", color: "bg-green-400", border: "border-green-600", shadow: "shadow-green-600" },
    { label: "CONTRIBUTORS", value: "156", color: "bg-purple-400", border: "border-purple-600", shadow: "shadow-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-gradient-to-r from-purple-400 to-pink-400 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black border-4 border-black rotate-3 flex items-center justify-center">
              <Zap className="w-7 h-7 text-yellow-400" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-black tracking-tight" style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase' }}>
                MOSAIC
              </h1>
              <p className="text-black" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
                MAGAZINE HI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-yellow-400 text-black px-6 py-3 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none" style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}>
              Create
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 border-4 border-black -rotate-6" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Page Title */}
        <div className="mb-8 inline-block">
          <h2 className="text-black mb-2 inline-block bg-yellow-300 px-4 py-2 border-4 border-black -rotate-1" style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase' }}>
            EDITOR ZONE
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <Flame className="w-6 h-6 text-red-500" />
            <p className="text-black" style={{ fontSize: '16px', fontWeight: '700' }}>
              12 SUBMISSIONS NEED YOUR ATTENTION!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div 
              key={stat.label}
              className={`${stat.color} border-4 ${stat.border} p-6 hover:translate-x-2 hover:translate-y-2 transition-transform ${stat.shadow} shadow-[8px_8px_0px_0px] hover:shadow-none cursor-pointer`}
              style={{ transform: `rotate(${idx % 2 === 0 ? -2 : 2}deg)` }}
            >
              <p className="text-black mb-2" style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em' }}>
                {stat.label}
              </p>
              <p className="text-black" style={{ fontSize: '38px', fontWeight: '900' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8">
          {/* Submissions */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-black inline-block bg-cyan-300 px-4 py-2 border-4 border-black rotate-1" style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase' }}>
                HOT SUBMISSIONS
              </h3>
              <button className="flex items-center gap-2 text-black hover:translate-x-1 transition-transform" style={{ fontSize: '14px', fontWeight: '800' }}>
                VIEW ALL
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6">
              {submissions.map((submission, idx) => (
                <div 
                  key={submission.id}
                  className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all cursor-pointer group`}
                  style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className={`inline-block ${submission.color} border-3 ${submission.border} px-3 py-1 mb-3`}>
                        <span className="text-black" style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.05em' }}>
                          {submission.status}
                        </span>
                      </div>
                      <h4 className="text-black mb-2" style={{ fontSize: '20px', fontWeight: '800' }}>
                        {submission.title}
                      </h4>
                      <p className="text-gray-700" style={{ fontSize: '14px', fontWeight: '700' }}>
                        BY {submission.author.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 bg-white border-4 border-black py-2 hover:bg-gray-100 transition-colors" style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
                      REVIEW
                    </button>
                    <button className="flex-1 bg-green-400 border-4 border-black py-2 hover:bg-green-300 transition-colors" style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
                      APPROVE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-purple-300 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              <h3 className="text-black mb-4 flex items-center gap-2" style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>
                <Star className="w-5 h-5" />
                QUICK ACTIONS
              </h3>
              <div className="space-y-3">
                {['NEW SUBMISSION', 'CREATE ISSUE', 'ADD PERSON', 'SEND EMAIL'].map((action) => (
                  <button
                    key={action}
                    className="w-full bg-white border-4 border-black py-3 hover:bg-yellow-200 transition-colors flex items-center justify-between px-4 group"
                    style={{ fontSize: '13px', fontWeight: '800' }}
                  >
                    {action}
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" strokeWidth={3} />
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Box */}
            <div className="bg-yellow-300 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-2">
              <TrendingUp className="w-8 h-8 text-black mb-3" strokeWidth={3} />
              <p className="text-black mb-2" style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>
                ENGAGEMENT UP
              </p>
              <p className="text-black mb-1" style={{ fontSize: '32px', fontWeight: '900' }}>
                +47%
              </p>
              <p className="text-black" style={{ fontSize: '13px', fontWeight: '700' }}>
                THIS MONTH
              </p>
            </div>

            {/* Alert */}
            <div className="bg-red-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-1">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-black flex-shrink-0" strokeWidth={3} />
                <div>
                  <p className="text-black mb-1" style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>
                    DEADLINE ALERT
                  </p>
                  <p className="text-black" style={{ fontSize: '13px', fontWeight: '700' }}>
                    Spring Issue due in 12 days!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
