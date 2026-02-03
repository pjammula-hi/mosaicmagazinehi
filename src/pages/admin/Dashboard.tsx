
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, FileText, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    // Mock data for the chart
    const data = [
        { name: 'Sep', articles: 4 },
        { name: 'Oct', articles: 12 },
        { name: 'Nov', articles: 8 },
        { name: 'Dec', articles: 15 },
        { name: 'Jan', articles: 22 },
        { name: 'Feb', articles: 10 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black mb-2 uppercase tracking-wide">Dashboard</h1>
                    <p className="text-gray-600 font-medium">Welcome back, Admin. Here's what's happening.</p>
                </div>
                <button className="bg-black text-white px-6 py-3 rounded-lg font-bold shadow-[4px_4px_0px_0px_gray] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_gray] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all">
                    + New Issue
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Issues Published" value="12" icon={<BookOpen size={24} />} color="bg-cyan-200" />
                <StatCard title="Total Articles" value="156" icon={<FileText size={24} />} color="bg-green-200" />
                <StatCard title="Active Authors" value="45" icon={<Users size={24} />} color="bg-purple-200" />
                <StatCard title="Monthly Views" value="2.4k" icon={<TrendingUp size={24} />} color="bg-orange-200" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6 uppercase flex items-center gap-3">
                        <TrendingUp size={28} />
                        Submission Activity
                    </h2>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '4px 4px 0px 0px black' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="articles" fill="#000" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6 uppercase">Recent Activity</h2>
                    <div className="space-y-4">
                        <ActivityItem
                            user="Todd Alessandro"
                            action="published letter"
                            target="Feb 2026 Issue"
                            time="2h ago"
                        />
                        <ActivityItem
                            user="Daniel Sepulveda"
                            action="submitted artwork"
                            target="Blue Horizons"
                            time="4h ago"
                        />
                        <ActivityItem
                            user="System"
                            action="created draft"
                            target="March 2026 Issue"
                            time="1d ago"
                        />
                        <ActivityItem
                            user="Sarah Editor"
                            action="approved article"
                            target="Why We Write"
                            time="1d ago"
                        />
                    </div>
                    <button className="w-full mt-6 py-2 border-2 border-black font-bold hover:bg-gray-100 rounded-lg">
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: any, color: string }) => (
    <div className={`${color} border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform`}>
        <div className="flex justify-between items-start">
            <span className="font-bold text-gray-800 uppercase text-sm tracking-wider">{title}</span>
            <div className="p-2 bg-white border-2 border-black rounded-lg">{icon}</div>
        </div>
        <span className="text-4xl font-black">{value}</span>
    </div>
);

const ActivityItem = ({ user, action, target, time }: { user: string, action: string, target: string, time: string }) => (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
        <p className="text-sm">
            <span className="font-bold">{user}</span> {action} <span className="font-bold text-blue-600">"{target}"</span>
        </p>
        <span className="text-xs text-gray-400 font-bold uppercase">{time}</span>
    </div>
);

export default Dashboard;
