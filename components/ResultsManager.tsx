import React, { useState } from 'react';
import { TeamResult } from '../types';
import { Save, Plus, Trash2, Trophy, Star, Medal, Crown, Grid, Layout } from 'lucide-react';
import { db, ref, set, remove } from '../firebase';

interface ResultsManagerProps {
    teams: TeamResult[];
    setTeams: React.Dispatch<React.SetStateAction<TeamResult[]>>;
    consouliumTeams: TeamResult[];
    setConsouliumTeams: React.Dispatch<React.SetStateAction<TeamResult[]>>;
}

const ResultsManager: React.FC<ResultsManagerProps> = ({ teams, setTeams, consouliumTeams, setConsouliumTeams }) => {
    // Mode: 'campus' (Sub Jr, Jr, Sr) or 'consoulium' (Separate Program)
    const [viewMode, setViewMode] = useState<'campus' | 'consoulium'>('campus');
    
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<TeamResult>>({});

    // Generic IndexedDB Update
    const updateFirebase = (path: string, newTeams: TeamResult[]) => {
        set(ref(db, path), newTeams)
            .catch(error => {
                console.error("Error updating data:", error);
                alert("Failed to update data");
            });
    };

    const handleEdit = (team: TeamResult) => {
        setIsEditing(team.id);
        setEditForm(team);
    };

    const handleSave = () => {
        if (!isEditing) return;
        
        if (viewMode === 'campus') {
            const updatedTeams = teams.map(t => t.id === isEditing ? { ...t, ...editForm } as TeamResult : t);
            setTeams(updatedTeams);
            updateFirebase('teams', updatedTeams);
        } else {
            const updatedTeams = consouliumTeams.map(t => t.id === isEditing ? { ...t, ...editForm } as TeamResult : t);
            setConsouliumTeams(updatedTeams);
            updateFirebase('consoulium_teams', updatedTeams);
        }
        
        setIsEditing(null);
    };

    const handleDelete = (id: string) => {
        // Strict check to allow 0 or "0" as ID
        if (id === undefined || id === null) return;
        
        if(window.confirm('Are you sure you want to delete this team?')) {
            const stringId = String(id); // Force string comparison
            
            if (viewMode === 'campus') {
                const updatedTeams = teams.filter(t => String(t.id) !== stringId);
                setTeams(updatedTeams);
                updateFirebase('teams', updatedTeams);
            } else {
                const updatedTeams = consouliumTeams.filter(t => String(t.id) !== stringId);
                setConsouliumTeams(updatedTeams);
                updateFirebase('consoulium_teams', updatedTeams);
            }
        }
    };

    const handleAdd = (category: string) => {
        // Ensure random ID is unique
        const randomId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newTeam: TeamResult = {
            id: randomId,
            name: 'New Team',
            points: 0,
            campus: 'Campus 1', // Default
            category: category as any
        };
        
        if (viewMode === 'campus') {
            const updatedTeams = [...teams, newTeam];
            setTeams(updatedTeams);
            updateFirebase('teams', updatedTeams);
        } else {
            // For Consoulium mode, we might not strictly use categories, but we keep the struct
            const cTeam = { ...newTeam, campus: 'Consoulium', category: 'General' as any };
            const updatedTeams = [...consouliumTeams, cTeam];
            setConsouliumTeams(updatedTeams);
            updateFirebase('consoulium_teams', updatedTeams);
        }
        
        handleEdit(viewMode === 'campus' ? newTeam : { ...newTeam, campus: 'Consoulium' });
    };

    // Reusable Render Function 
    const renderTeamList = (title: string, teamsList: TeamResult[], Icon: any, colorClass: string, categoryKey: string) => {
         // Create a copy before sorting to avoid mutating prop
         const sortedTeams = [...teamsList].sort((a,b) => b.points - a.points);
         
         return (
            <div className="bg-brand-charcoal border border-brand-light/5 rounded-2xl overflow-hidden flex flex-col h-full shadow-xl animate-scale-in">
                <div className="p-6 border-b border-brand-light/5 flex justify-between items-center bg-brand-light/5">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 bg-current`}>
                            <Icon size={24} className={colorClass} />
                         </div>
                         <h3 className="text-xl font-bold text-brand-light">{title}</h3>
                    </div>
                     <button 
                        onClick={() => handleAdd(categoryKey)} 
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${colorClass} bg-opacity-10 bg-current hover:bg-opacity-20 text-sm hover:scale-105 active:scale-95`}
                    >
                        <Plus size={16} /> Add Team
                    </button>
                </div>
                
                <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                     {sortedTeams.length === 0 ? (
                        <div className="text-center py-8 text-brand-light/30 border-2 border-dashed border-brand-light/5 rounded-xl">
                            No teams in {title}
                        </div>
                    ) : (
                        sortedTeams.map((team, index) => (
                            <div 
                                key={team.id} 
                                className={`group relative bg-brand-dark/50 border ${isEditing === team.id ? 'border-brand-yellow' : 'border-brand-light/5'} p-4 rounded-xl transition-all hover:border-brand-light/20 shadow-sm opacity-0 animate-slide-up`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {isEditing === team.id ? (
                                    <div className="flex flex-col gap-3 animate-fade-in">
                                        <div className="flex gap-2">
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editForm.name || ''} 
                                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                                className="flex-1 bg-brand-charcoal border border-brand-teal/30 rounded px-3 py-2 text-brand-light focus:outline-none focus:border-brand-yellow transition-all"
                                                placeholder="Team Name"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {viewMode === 'campus' && (
                                                <select
                                                    value={editForm.campus || 'Campus 1'}
                                                    onChange={e => setEditForm({...editForm, campus: e.target.value})}
                                                    className="bg-brand-charcoal border border-brand-teal/30 rounded px-3 py-2 text-brand-light text-sm focus:outline-none focus:border-brand-yellow w-1/3 transition-all"
                                                >
                                                    <option value="Campus 1">Campus 1</option>
                                                    <option value="Campus 2">Campus 2</option>
                                                </select>
                                            )}
                                            <input 
                                                type="number" 
                                                value={editForm.points || 0} 
                                                onChange={e => setEditForm({...editForm, points: parseInt(e.target.value) || 0})}
                                                className="flex-1 bg-brand-charcoal border border-brand-teal/30 rounded px-3 py-2 text-brand-light focus:outline-none focus:border-brand-yellow font-pixel tracking-widest transition-all"
                                                placeholder="Pts"
                                            />
                                            <button onClick={handleSave} className="px-3 bg-brand-teal text-white rounded hover:bg-brand-teal/80 transition-all hover:scale-105">
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-brand-light/5 flex items-center justify-center font-pixel text-lg text-brand-light/30 border border-brand-light/5 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base leading-tight group-hover:text-white transition-colors">{team.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {viewMode === 'campus' && (
                                                        <span className="text-[10px] uppercase tracking-wide bg-brand-light/5 px-2 py-0.5 rounded text-brand-light/50">
                                                            {team.campus === 'Campus 1' ? 'C1' : 'C2'}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Trophy size={12} className={colorClass} />
                                                        <span className={`font-pixel text-lg ${colorClass}`}>{team.points}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10">
                                             <button onClick={() => handleEdit(team)} className="px-3 py-1.5 bg-brand-light/5 hover:bg-brand-light/10 rounded-lg text-brand-light/60 hover:text-brand-light transition-all hover:scale-105 text-sm font-medium">
                                                Edit
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Only stop bubbling, don't prevent default
                                                    handleDelete(team.id);
                                                }}
                                                className="p-2 bg-brand-pink/5 hover:bg-brand-pink/20 rounded-lg text-brand-pink/60 hover:text-brand-pink transition-all hover:scale-110 flex items-center justify-center group/del"
                                                title="Delete Team"
                                            >
                                                <Trash2 size={16} className="pointer-events-none" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
         );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-down">
                <div>
                    <h2 className="text-3xl font-bold text-brand-light">Live Results Manager</h2>
                    <p className="text-brand-light/60 mt-1">Manage scores for festival events.</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="bg-brand-charcoal p-1 rounded-xl border border-brand-light/10 flex">
                    <button 
                        onClick={() => setViewMode('campus')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                            viewMode === 'campus' 
                            ? 'bg-brand-teal text-white shadow scale-105' 
                            : 'text-brand-light/50 hover:text-brand-light hover:bg-brand-light/5'
                        }`}
                    >
                        <Grid size={16} /> Campus Categories
                    </button>
                    <button 
                        onClick={() => setViewMode('consoulium')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                            viewMode === 'consoulium' 
                            ? 'bg-brand-orange text-brand-charcoal shadow scale-105' 
                            : 'text-brand-light/50 hover:text-brand-light hover:bg-brand-light/5'
                        }`}
                    >
                        <Layout size={16} /> Consoulium
                    </button>
                </div>
            </div>

            {viewMode === 'campus' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    {renderTeamList(
                        "Sub Junior",
                        teams.filter(t => t.category === 'Sub Junior'),
                        Star,
                        "text-brand-teal",
                        "Sub Junior"
                    )}
                    {renderTeamList(
                        "Junior",
                        teams.filter(t => t.category === 'Junior'),
                        Medal,
                        "text-brand-pink",
                        "Junior"
                    )}
                    {renderTeamList(
                        "Senior",
                        teams.filter(t => t.category === 'Senior'),
                        Crown,
                        "text-brand-orange",
                        "Senior"
                    )}
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <div className="col-span-full md:col-span-1 h-full">
                         {renderTeamList(
                            "Consoulium Leaderboard",
                            consouliumTeams,
                            Trophy,
                            "text-brand-orange",
                            "General"
                        )}
                    </div>
                    <div className="hidden md:flex flex-col justify-center items-center text-center p-12 border border-dashed border-brand-light/10 rounded-2xl bg-brand-charcoal/30 animate-scale-in">
                        <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4 text-brand-orange animate-float">
                            <Trophy size={40} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Consoulium Program</h3>
                        <p className="text-brand-light/50 max-w-sm">
                            This is a separate backend for the Consoulium specific events. 
                            Results added here will appear in the "Consoulium Result" card on the public site.
                        </p>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ResultsManager;