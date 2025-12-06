import React, { useState, useEffect } from 'react';
import { NewsItem, FestivalStats } from './types';
import { db, ref, onValue } from './firebase';
import PublicSite from './components/PublicSite';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import NewsManager from './components/NewsManager';
import FullLeaderboard from './components/FullLeaderboard';
import { Users, Calendar, Trophy, Zap, ArrowLeft, Lock, X } from 'lucide-react';

const App: React.FC = () => {
    // view state: 'public', 'admin', or 'leaderboard'
    const [view, setView] = useState<'public' | 'admin' | 'leaderboard'>('public');
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const [stats] = useState<FestivalStats>({
        daysLeft: 40,
        totalEvents: 300,
        totalCompetitors: 600
    });

    const [news, setNews] = useState<NewsItem[]>([]);

    // Fetch Data from IndexedDB on Load (Single source of truth)
    useEffect(() => {
        // 1. News
        const newsRef = ref(db, 'news');
        const unsubscribeNews = onValue(newsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newsArray = Array.isArray(data) ? data : Object.values(data);
                // Sort by date (newest first)
                const sortedNews = [...newsArray].sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setNews(sortedNews as NewsItem[]);
            } else {
                setNews([]);
            }
        });

        return () => {
            unsubscribeNews();
        };
    }, []);

    // Login Handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Update password to 860622
        if (loginPassword === '860622') {
            setIsAuthenticated(true);
            setView('admin');
            setShowLoginModal(false);
            setLoginPassword('');
            setLoginError('');
        } else {
            // Removed hint about the password
            setLoginError('Invalid password.');
        }
    };

    // Logout Handler
    const handleLogout = () => {
        setIsAuthenticated(false);
        setView('public');
        setActiveTab('dashboard');
    };

    // --- RENDER ADMIN PANEL ---
    const renderAdminPanel = () => {
        const renderContent = () => {
            switch(activeTab) {
                case 'dashboard':
                    return (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h2 className="text-3xl font-bold text-brand-light mb-2 animate-slide-down">Dashboard Overview</h2>
                                <p className="text-brand-light/60 animate-slide-down" style={{animationDelay: '100ms'}}>Welcome back, Admin. Here's what's happening at Consoulium.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <StatsCard title="Days Remaining" value={stats.daysLeft} icon={Calendar} colorClass="text-brand-yellow" trend="On Schedule" />
                                <StatsCard title="Active Events" value={stats.totalEvents} icon={Zap} colorClass="text-brand-teal" />
                                <StatsCard title="Total Competitors" value={stats.totalCompetitors} icon={Users} colorClass="text-brand-pink" trend="+12% this week" />
                            </div>
                        </div>
                    );
                case 'results': 
                    // Return a simplified results manager since we removed team tables
                    return (
                        <div className="text-center py-20">
                            <Trophy size={64} className="mx-auto mb-4 text-brand-light/20" />
                            <h3 className="text-2xl font-bold text-brand-light mb-2">Results Management</h3>
                            <p className="text-brand-light/60 max-w-md mx-auto">
                                Team management has been removed from this version. 
                                You can manage events and news content through the respective tabs.
                            </p>
                        </div>
                    );
                case 'news': return <NewsManager news={news} setNews={setNews} />;
                default: return <div className="p-10 text-center text-brand-light/50">Feature Coming Soon</div>;
            }
        };

        return (
            <div className="min-h-screen bg-brand-dark flex font-sans text-brand-light animate-fade-in">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
                <main className="ml-64 flex-1 p-8 md:p-12 overflow-y-auto h-screen relative">
                    {/* Back to Website Button */}
                    <button 
                        onClick={() => setView('public')}
                        className="absolute top-8 right-8 bg-brand-charcoal border border-brand-light/10 text-brand-light px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-light/10 transition-colors z-50 hover:scale-105 active:scale-95 duration-200"
                    >
                        <ArrowLeft size={16} /> Back to Website
                    </button>

                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        );
    };

    // MAIN RENDER LOGIC
    return (
        <>
            {/* View Switching */}
            {view === 'leaderboard' && (
                <FullLeaderboard teams={[]} onBack={() => setView('public')} />
            )}

            {view === 'public' && (
                <div className="animate-fade-in">
                    <PublicSite 
                        teams={[]} 
                        consouliumTeams={[]}
                        news={news} 
                        onLoginClick={() => {
                            if (isAuthenticated) {
                                setView('admin');
                            } else {
                                setShowLoginModal(true);
                            }
                        }}
                        onViewLeaderboard={() => setView('leaderboard')}
                    />
                </div>
            )}

            {view === 'admin' && renderAdminPanel()}

            {/* Login Modal - Global Overlay */}
            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-brand-dark border border-brand-teal/30 rounded-2xl w-full max-w-md p-8 shadow-2xl relative transform scale-100 transition-transform animate-scale-in">
                        <button 
                            onClick={() => { setShowLoginModal(false); setLoginPassword(''); setLoginError(''); }} 
                            className="absolute top-4 right-4 text-brand-light/50 hover:text-brand-light p-2 hover:rotate-90 transition-transform duration-200"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6 text-brand-teal border border-brand-teal/20 shadow-[0_0_15px_rgba(42,157,143,0.2)] animate-float">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-brand-light mb-2">Admin Access</h2>
                            <p className="text-brand-light/60">Enter password to manage festival</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <input 
                                    type="password" 
                                    autoFocus
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    className="w-full bg-brand-charcoal border border-brand-light/10 rounded-xl px-4 py-4 text-center text-xl tracking-widest focus:border-brand-teal focus:outline-none transition-all placeholder:text-brand-light/10 focus:shadow-[0_0_20px_rgba(42,157,143,0.1)]"
                                    placeholder="••••••••"
                                />
                                {loginError && (
                                    <p className="text-brand-pink text-sm text-center font-medium animate-pulse">{loginError}</p>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-brand-teal text-white font-bold py-4 rounded-xl hover:bg-brand-teal/90 transition-all shadow-lg shadow-brand-teal/20 hover:shadow-brand-teal/40 hover:-translate-y-0.5 active:translate-y-0 duration-200"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default App;