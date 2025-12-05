import React, { useState } from 'react';
import { NewsItem } from '../types';
import { Plus, Calendar, X, LayoutList, PartyPopper, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { db, ref, set, remove } from '../firebase';

interface NewsManagerProps {
    news: NewsItem[];
    setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
}

const NewsManager: React.FC<NewsManagerProps> = ({ news, setNews }) => {
    // Tab state: 'events' or 'news'
    const [activeSubTab, setActiveSubTab] = useState<'events' | 'news'>('events');
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [newItem, setNewItem] = useState<Partial<NewsItem>>({
        category: 'Events',
        title: '',
        description: '',
        imageUrl: ''
    });

    // Filter data based on active tab
    const filteredItems = news.filter(item => {
        if (activeSubTab === 'events') {
            return item.category === 'Events';
        } else {
            return item.category !== 'Events'; // Shows General, Workshop, Partnership
        }
    });

    const openForm = () => {
        // Set default category based on active tab
        setNewItem({
            category: activeSubTab === 'events' ? 'Events' : 'General',
            title: '',
            description: '',
            imageUrl: ''
        });
        setShowForm(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem({ ...newItem, imageUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setNewItem({ ...newItem, imageUrl: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = Date.now().toString();
        
        // If no image uploaded, use a default placeholder
        const finalImage = newItem.imageUrl || 'https://picsum.photos/600/400';

        const item: NewsItem = {
            id: id,
            title: newItem.title || 'Untitled',
            category: newItem.category as any,
            description: newItem.description || '',
            imageUrl: finalImage,
            date: new Date().toLocaleDateString()
        };
        
        set(ref(db, 'news/' + id), item)
            .then(() => {
                setShowForm(false);
            })
            .catch((error) => {
                console.error("Error saving item:", error);
                alert("Failed to save item");
            });
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this item?')) {
            remove(ref(db, 'news/' + id))
                .catch(error => {
                    console.error("Error deleting item:", error);
                    alert("Failed to delete item");
                });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-light">Content Manager</h2>
                    <p className="text-brand-light/60">Manage your festival events and news updates.</p>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex bg-brand-charcoal p-1 rounded-lg border border-brand-light/10">
                    <button 
                        onClick={() => setActiveSubTab('events')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                            activeSubTab === 'events' 
                            ? 'bg-brand-teal text-white shadow' 
                            : 'text-brand-light/50 hover:text-brand-light'
                        }`}
                    >
                        <PartyPopper size={16} /> Events
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('news')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
                            activeSubTab === 'news' 
                            ? 'bg-brand-pink text-brand-charcoal shadow' 
                            : 'text-brand-light/50 hover:text-brand-light'
                        }`}
                    >
                        <LayoutList size={16} /> News & Updates
                    </button>
                </div>

                <button 
                    onClick={openForm} 
                    className={`${activeSubTab === 'events' ? 'bg-brand-teal' : 'bg-brand-pink text-brand-charcoal'} px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-colors shadow-lg`}
                >
                    <Plus size={18} /> Add {activeSubTab === 'events' ? 'Event' : 'News'}
                </button>
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-charcoal border border-brand-light/20 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-brand-light/50 hover:text-brand-light">
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-6">
                            Add New {activeSubTab === 'events' ? 'Event' : 'News Post'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Title</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none"
                                    placeholder={activeSubTab === 'events' ? "e.g. DJ Night Main Stage" : "e.g. Schedule Update"}
                                    value={newItem.title}
                                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm text-brand-light/60 mb-1">Category</label>
                                    <select 
                                        className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none disabled:opacity-50"
                                        value={newItem.category}
                                        disabled={activeSubTab === 'events'} // Lock to 'Events' if in Event tab
                                        onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                                    >
                                        {activeSubTab === 'events' ? (
                                            <option value="Events">Events</option>
                                        ) : (
                                            <>
                                                <option value="General">General</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Partnership">Partnership</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-brand-light/60 mb-1">Cover Image</label>
                                    {newItem.imageUrl ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-brand-light/10 group">
                                            <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    type="button" 
                                                    onClick={removeImage}
                                                    className="bg-brand-pink text-brand-charcoal px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                                >
                                                    <Trash2 size={16} /> Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-32 border-2 border-dashed border-brand-light/10 rounded-lg bg-brand-dark/30 hover:bg-brand-dark/50 hover:border-brand-teal/50 transition-all relative group">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-light/40 group-hover:text-brand-teal transition-colors pointer-events-none">
                                                <Upload size={24} className="mb-2" />
                                                <span className="text-sm font-medium">Click to upload photo</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Description</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none"
                                    placeholder="Write details here..."
                                    value={newItem.description}
                                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" className={`w-full ${activeSubTab === 'events' ? 'bg-brand-teal' : 'bg-brand-pink text-brand-charcoal'} py-3 rounded-lg font-bold hover:opacity-90 transition-all`}>
                                Publish
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-brand-light/30 border border-dashed border-brand-light/10 rounded-2xl">
                        <div className="flex justify-center mb-4">
                            {activeSubTab === 'events' ? <PartyPopper size={48} className="opacity-20" /> : <LayoutList size={48} className="opacity-20" />}
                        </div>
                        No {activeSubTab} added yet.
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className={`bg-brand-charcoal border ${activeSubTab === 'events' ? 'border-brand-teal/20' : 'border-brand-pink/20'} rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all shadow-lg`}>
                            <div className="h-40 relative overflow-hidden bg-brand-dark/50">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-brand-light/10">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-brand-dark/80 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase text-brand-yellow border border-brand-yellow/20">
                                    {item.category}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                                <p className="text-brand-light/60 text-sm mb-4 line-clamp-2">{item.description}</p>
                                <div className="flex justify-between items-center border-t border-brand-light/5 pt-4">
                                    <span className="text-xs text-brand-light/40 flex items-center gap-1">
                                        <Calendar size={12} /> {item.date}
                                    </span>
                                    <button onClick={() => handleDelete(item.id)} className="text-brand-pink/60 hover:text-brand-pink text-xs font-bold uppercase tracking-wider">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NewsManager;