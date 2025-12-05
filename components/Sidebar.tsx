import React from 'react';
import { LayoutDashboard, Newspaper, Trophy, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'results', label: 'Live Results', icon: Trophy },
        { id: 'news', label: 'News Manager', icon: Newspaper },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-brand-charcoal border-r border-brand-teal/20 h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-brand-teal/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-yellow/10 rounded-md border border-brand-yellow/50 flex items-center justify-center">
                        <span className="font-pixel text-brand-yellow text-xl">C</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Consoulium</h1>
                        <p className="text-xs text-brand-light/50">Admin Panel</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            activeTab === item.id 
                            ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' 
                            : 'text-brand-light/70 hover:bg-brand-light/5 hover:text-brand-light'
                        }`}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-brand-teal/10">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-brand-pink/80 hover:bg-brand-pink/10 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;