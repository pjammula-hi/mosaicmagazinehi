
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Image, Settings, BookOpen, PenTool, LogOut } from 'lucide-react';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar - Neo-Brutalist Style */}
            <aside className="w-64 bg-white border-r-4 border-black flex flex-col fixed h-full z-10">
                <div className="p-6 border-b-4 border-black bg-yellow-400">
                    <h1 className="text-2xl font-black tracking-tighter uppercase">Mosaic<br />Admin</h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <NavItem to="/admin" end icon={<LayoutDashboard size={20} />} label="Dashboard" />

                    <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Content</div>
                    <NavItem to="/admin/issues" icon={<BookOpen size={20} />} label="Issues" />
                    <NavItem to="/admin/articles" icon={<FileText size={20} />} label="Articles" />
                    <NavItem to="/admin/authors" icon={<Users size={20} />} label="Authors" />
                    <NavItem to="/admin/media" icon={<Image size={20} />} label="Media Library" />
                    <NavItem to="/admin/principal-letters" icon={<PenTool size={20} />} label="Principal Letters" />

                    <div className="pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">System</div>
                    <NavItem to="/admin/settings" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t-4 border-black bg-gray-100">
                    <button className="flex items-center gap-3 w-full p-2 hover:bg-red-100 transition-colors rounded-lg font-bold text-red-600">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// Nav Item Component
const NavItem = ({ to, icon, label, end = false }: { to: string, icon: any, label: string, end?: boolean }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] ${isActive
                ? 'bg-black text-white border-black shadow-none pointer-events-none'
                : 'bg-white text-gray-800 border-black hover:bg-yellow-100'
            }`
        }
    >
        {icon}
        <span className="font-bold">{label}</span>
    </NavLink>
);

export default AdminLayout;
