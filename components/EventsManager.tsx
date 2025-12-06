import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { db, ref, set, remove, onValue } from '../firebase';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, X } from 'lucide-react';

interface EventsManagerProps {
    events: EventItem[];
    setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
}

const EventsManager: React.FC<EventsManagerProps> = ({ events, setEvents }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<EventItem>>({
        title: '',
        description: '',
        venue: '',
        startTime: '',
        endTime: '',
        category: '',
        imageUrl: '',
        organizer: '',
        contactEmail: '',
        registrationRequired: false,
        registrationLink: '',
        capacity: 0,
        createdAt: new Date().toISOString()
    });

    // Load events from IndexedDB on component mount
    useEffect(() => {
        const eventsRef = ref(db, 'events');
        const unsubscribe = onValue(eventsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setEvents(Array.isArray(data) ? data : Object.values(data));
            } else {
                setEvents([]);
            }
        });
        
        return () => unsubscribe();
    }, [setEvents]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const eventId = editingId || Date.now().toString();
            const eventData: EventItem = {
                id: eventId,
                title: formData.title || '',
                description: formData.description || '',
                venue: formData.venue || '',
                startTime: formData.startTime || '',
                endTime: formData.endTime || '',
                category: formData.category || '',
                imageUrl: formData.imageUrl || '',
                organizer: formData.organizer || '',
                contactEmail: formData.contactEmail || '',
                registrationRequired: formData.registrationRequired || false,
                registrationLink: formData.registrationLink || '',
                capacity: formData.capacity || 0,
                createdAt: formData.createdAt || new Date().toISOString()
            };
            
            // For IndexedDB, we need to get all events, update the specific one, and save back
            const updatedEvents = editingId 
                ? events.map(event => event.id === editingId ? eventData : event)
                : [...events, eventData];
                
            const eventsRef = ref(db, 'events');
            await set(eventsRef, updatedEvents);
            
            setEvents(updatedEvents);
            setShowForm(false);
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                venue: '',
                startTime: '',
                endTime: '',
                category: '',
                imageUrl: '',
                organizer: '',
                contactEmail: '',
                registrationRequired: false,
                registrationLink: '',
                capacity: 0,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Failed to save event');
        }
    };

    const handleEdit = (event: EventItem) => {
        setEditingId(event.id);
        setFormData(event);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const updatedEvents = events.filter(event => event.id !== id);
                const eventsRef = ref(db, 'events');
                await set(eventsRef, updatedEvents);
                setEvents(updatedEvents);
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event');
            }
        }
    };

    const openForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            venue: '',
            startTime: '',
            endTime: '',
            category: '',
            imageUrl: '',
            organizer: '',
            contactEmail: '',
            registrationRequired: false,
            registrationLink: '',
            capacity: 0,
            createdAt: new Date().toISOString()
        });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-brand-light">Events Manager</h2>
                    <p className="text-brand-light/60">Manage your festival events.</p>
                </div>
                <button 
                    onClick={openForm}
                    className="bg-brand-teal text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-teal/90 transition-colors"
                >
                    <Plus size={18} /> Add Event
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-charcoal border border-brand-light/20 rounded-2xl p-6 w-full max-w-lg relative shadow-2xl">
                        <button 
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                            }} 
                            className="absolute top-4 right-4 text-brand-light/50 hover:text-brand-light"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-6">
                            {editingId ? 'Edit Event' : 'Add New Event'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Event Title</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none"
                                    placeholder="e.g. DJ Night Main Stage"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-brand-light/60 mb-1">Date</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light/40" />
                                        <input 
                                            required
                                            type="date" 
                                            className="w-full bg-brand-dark border border-brand-light/10 rounded-lg pl-10 pr-4 py-3 focus:border-brand-teal focus:outline-none appearance-none"
                                            value={formData.startTime ? formData.startTime.split('T')[0] : ''}
                                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-brand-light/60 mb-1">Time</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light/40" />
                                        <input 
                                            required
                                            type="time" 
                                            className="w-full bg-brand-dark border border-brand-light/10 rounded-lg pl-10 pr-4 py-3 focus:border-brand-teal focus:outline-none appearance-none"
                                            value={formData.startTime ? formData.startTime.split('T')[1]?.substring(0, 5) : ''}
                                            onChange={e => {
                                                const datePart = formData.startTime ? formData.startTime.split('T')[0] : new Date().toISOString().split('T')[0];
                                                setFormData({...formData, startTime: `${datePart}T${e.target.value}`});
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Venue</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light/40" />
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-brand-dark border border-brand-light/10 rounded-lg pl-10 pr-4 py-3 focus:border-brand-teal focus:outline-none"
                                        placeholder="e.g. Main Auditorium"
                                        value={formData.venue || ''}
                                        onChange={e => setFormData({...formData, venue: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Description</label>
                                <textarea 
                                    required
                                    rows={3}
                                    className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none"
                                    placeholder="Event details..."
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-brand-light/60 mb-1">Image URL</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-brand-dark border border-brand-light/10 rounded-lg px-4 py-3 focus:border-brand-teal focus:outline-none"
                                    placeholder="/images/event.jpg"
                                    value={formData.imageUrl || ''}
                                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full bg-brand-teal text-white py-3 rounded-lg font-bold hover:bg-brand-teal/90 transition-colors"
                            >
                                {editingId ? 'Update Event' : 'Create Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-brand-light/30 border border-dashed border-brand-light/10 rounded-2xl">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        No events scheduled yet.
                    </div>
                ) : (
                    [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(event => (
                        <div key={event.id} className="bg-brand-charcoal border border-brand-teal/20 rounded-2xl overflow-hidden group hover:border-brand-yellow/30 transition-all shadow-lg">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEdit(event)}
                                            className="p-2 bg-brand-light/5 hover:bg-brand-light/10 rounded-lg text-brand-light/60 hover:text-brand-light transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(event.id)}
                                            className="p-2 bg-brand-pink/5 hover:bg-brand-pink/20 rounded-lg text-brand-pink/60 hover:text-brand-pink transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-brand-light/80">
                                        <Calendar size={16} />
                                        <span>{new Date(event.startTime).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-brand-light/80">
                                        <MapPin size={16} />
                                        <span className="line-clamp-1">{event.venue}</span>
                                    </div>
                                </div>
                                
                                <p className="mt-4 text-brand-light/60 text-sm line-clamp-2">
                                    {event.description}
                                </p>
                                
                                {event.imageUrl && (
                                    <div className="mt-4">
                                        <img 
                                            src={event.imageUrl} 
                                            alt={event.title} 
                                            className="w-full h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventsManager;