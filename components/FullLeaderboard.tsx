import React from 'react';
import { TeamResult } from '../types';
import { ArrowLeft, Crown, Medal, Award, Star } from 'lucide-react';

interface FullLeaderboardProps {
    teams: TeamResult[];
    onBack: () => void;
}

const FullLeaderboard: React.FC<FullLeaderboardProps> = ({ teams, onBack }) => {
    
    const renderCategoryColumn = (category: string, icon: React.ElementType, colorTheme: 'teal' | 'pink' | 'orange', delayStart: number) => {
        // Filter teams by category and sort by points
        const categoryTeams = teams
            .filter(t => t.category === category)
            .sort((a, b) => b.points - a.points);

        // Define colors based on theme
        const colors = {
            teal: {
                bg: 'bg-brand-teal',
                text: 'text-brand-teal',
                border: 'border-brand-teal',
                gradient: 'from-brand-teal'
            },
            pink: {
                bg: 'bg-brand-pink',
                text: 'text-brand-pink',
                border: 'border-brand-pink',
                gradient: 'from-brand-pink'
            },
            orange: {
                bg: 'bg-brand-orange',
                text: 'text-brand-orange',
                border: 'border-brand-orange',
                gradient: 'from-brand-orange'
            }
        }[colorTheme];

        return (
            <div className={`flex flex-col h-full opacity-0 animate-slide-up`} style={{ animationDelay: `${delayStart}ms` }}>
                {/* Header Card */}
                <div className={`${colors.bg}/10 p-6 rounded-3xl border ${colors.border}/20 backdrop-blur-sm shadow-lg mb-6 relative overflow-hidden group hover:shadow-2xl hover:shadow-${colorTheme}/10 transition-all duration-500`}>
                     <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${colors.gradient} to-transparent opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700`}></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl ${colors.bg} ${colorTheme === 'teal' ? 'text-white' : 'text-brand-charcoal'} flex items-center justify-center shadow-lg shadow-${colorTheme}/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                            {React.createElement(icon, { size: 24 })}
                        </div>
                        <h2 className="text-3xl font-bold text-brand-light">{category}</h2>
                    </div>
                </div>

                {/* List Container */}
                <div className={`bg-brand-charcoal border ${colors.border}/30 p-6 rounded-[2rem] shadow-xl flex-1 flex flex-col relative overflow-hidden`}>
                     {/* Background Glow */}
                     <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b ${colors.gradient} to-transparent opacity-5 pointer-events-none`}></div>

                    <div className="space-y-3 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
                        {categoryTeams.length === 0 ? (
                            <div className="text-center py-12 text-brand-light/30 border-2 border-dashed border-brand-light/5 rounded-xl animate-pulse">
                                No teams in {category}
                            </div>
                        ) : (
                            categoryTeams.map((team, idx) => (
                                <div 
                                    key={team.id} 
                                    className="bg-brand-dark/80 p-4 rounded-xl border border-brand-light/5 flex justify-between items-center hover:scale-[1.02] hover:bg-brand-dark transition-all duration-300 group opacity-0 animate-slide-up"
                                    style={{ animationDelay: `${delayStart + 200 + (idx * 100)}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${idx === 0 ? 'bg-brand-yellow text-brand-charcoal ring-2 ring-brand-yellow/50' : idx === 1 ? 'bg-gray-400 text-brand-charcoal' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-brand-light/10 text-brand-light'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-medium leading-tight group-hover:text-white transition-colors ${idx === 0 ? 'text-brand-light text-lg' : 'text-brand-light/80'}`}>{team.name}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-brand-light/40 mt-0.5 group-hover:text-brand-light/60">
                                                {team.campus === 'Campus 1' ? 'C1' : 'C2'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`font-pixel text-xl ${colors.text} whitespace-nowrap ml-2 group-hover:scale-110 transition-transform`}>{team.points} Pts</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-light font-sans p-4 md:p-8 animate-fade-in">
            <div className="container mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-12 animate-slide-down">
                    <button 
                        onClick={onBack}
                        className="w-12 h-12 rounded-full bg-brand-charcoal border border-brand-light/10 flex items-center justify-center hover:bg-brand-light/10 transition-all duration-300 group shadow-lg hover:shadow-brand-teal/20"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">Campus <span className="font-pixel text-brand-yellow">Result</span></h1>
                        <p className="text-brand-light/60">Live standings across all categories</p>
                    </div>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 min-h-[600px]">
                    {/* Sub Junior Column */}
                    {renderCategoryColumn('Sub Junior', Star, 'teal', 0)}

                    {/* Junior Column */}
                    {renderCategoryColumn('Junior', Medal, 'pink', 150)}

                    {/* Senior Column */}
                    {renderCategoryColumn('Senior', Crown, 'orange', 300)}
                </div>
            </div>
        </div>
    );
};

export default FullLeaderboard;