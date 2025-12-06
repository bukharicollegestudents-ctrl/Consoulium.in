import React, { useState, useEffect, useRef } from 'react';
import { TeamResult, NewsItem } from '../types';

import {
    ArrowRight, Calendar, MapPin, Clock, School, ChevronDown, Menu,
    ArrowUpRight, X, Bot, Mic, MessageSquare, Ticket, Medal,
    Instagram, Youtube, Facebook, Twitter, Mail, LogIn, LayoutList
} from 'lucide-react';

interface PublicSiteProps {
    teams: TeamResult[];
    consouliumTeams: TeamResult[];
    news: NewsItem[];
    onLoginClick: () => void;
    onViewLeaderboard?: () => void;
}

const PublicSite: React.FC<PublicSiteProps> = ({ teams, consouliumTeams, news, onLoginClick, onViewLeaderboard }) => {
    // --- STATE MANAGEMENT ---
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState<NewsItem | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null); // New state for News Modal
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [heroVideoIndex, setHeroVideoIndex] = useState(0);

    // Canvas Refs
    const atomicCanvasRef = useRef<HTMLCanvasElement>(null);
    const dnaCanvasRef = useRef<HTMLCanvasElement>(null);

    // --- DATA FILTERING ---
    const eventsData = news.filter(n => n.category === 'Events');
    const newsUpdates = news.filter(n => n.category !== 'Events'); // Show all news, logic handled in map for slice if needed, but here we likely want list

    // Top Consoulium Results (From separate backend)
    const consouliumTop = [...consouliumTeams].sort((a, b) => b.points - a.points).slice(0, 3);

    // Top Junior Results (Category based)
    // Updated to show top 'Junior' teams instead of 'Campus 2' filter
    const juniorTop = teams.filter(t => t.category === 'Junior').sort((a, b) => b.points - a.points).slice(0, 3);

    const heroVideos = [
        "/dist/video/highlites 1.mp4",
        "/dist/video/highlites_2.mp4",
        "/dist/video/highlites_3.mp4"
    ];

    // --- EFFECTS & ANIMATIONS ---

    // 1. Hero Video Rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroVideoIndex(prev => (prev + 1) % heroVideos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // 2. Events Carousel Rotation
    useEffect(() => {
        if (eventsData.length === 0) return;
        const interval = setInterval(() => {
            setCurrentEventIndex(prev => (prev + 1) % eventsData.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [eventsData.length]);

    // 3. Scroll Parallax Effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const factsShape = document.getElementById('facts-shape');
            if (factsShape) factsShape.style.transform = `translateY(${scrollY * 0.03}px) rotate(${scrollY * 0.01}deg)`;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 4. ATOMIC ANIMATION
    useEffect(() => {
        const canvas = atomicCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0;
        let animationFrameId: number;

        // Theme Colors
        const colors = { teal: '#2A9D8F', orange: '#F4A261', yellow: '#E9C46A', centerDark: '#264653' };

        // Params
        let particleSize = 6;
        let ringRadiusX = 140;
        let ringRadiusY = 50;
        let gearRadius = 30;

        const resize = () => {
            const container = canvas.parentElement;
            if (container) {
                width = container.clientWidth;
                height = container.clientHeight;
                canvas.width = width;
                canvas.height = height;
                const scaleFactor = width / 500;
                ringRadiusX = 140 * scaleFactor;
                ringRadiusY = 50 * scaleFactor;
                particleSize = 6 * scaleFactor;
                gearRadius = 30 * scaleFactor;
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const drawCircle = (x: number, y: number, radius: number, color: string) => {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        };

        const drawCenter = (angle: number) => {
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(-angle);
            ctx.beginPath();
            const teeth = 8;
            for (let i = 0; i < teeth * 2; i++) {
                const r = (i % 2 === 0) ? gearRadius : gearRadius - (8 * (width / 500));
                const a = (Math.PI * 2 * i) / (teeth * 2);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.fillStyle = colors.centerDark;
            ctx.fill();
            ctx.closePath();
            drawCircle(0, 0, 12 * (width / 500), colors.yellow);
            ctx.restore();
        };

        class Ring {
            rotationAngle: number;
            color: string;
            speed: number;
            numDots: number = 40;
            animationOffset: number = 0;

            constructor(rotationAngle: number, color: string, speed: number) {
                this.rotationAngle = rotationAngle;
                this.color = color;
                this.speed = speed;
            }

            update() { this.animationOffset += this.speed; }

            draw() {
                ctx!.save();
                ctx!.translate(width / 2, height / 2);
                ctx!.rotate(this.rotationAngle);
                for (let i = 0; i < this.numDots; i++) {
                    const angle = (Math.PI * 2 * i) / this.numDots + this.animationOffset;
                    const x = Math.cos(angle) * ringRadiusX;
                    const y = Math.sin(angle) * ringRadiusY;
                    const scale = (Math.sin(angle) + 2) / 3;
                    ctx!.beginPath();
                    ctx!.arc(x, y, particleSize * scale, 0, Math.PI * 2);
                    ctx!.fillStyle = this.color;
                    ctx!.fill();
                }
                ctx!.restore();
            }
        }

        const rings = [
            new Ring(0, colors.yellow, 0.01),
            new Ring(Math.PI / 3, colors.orange, 0.01),
            new Ring((Math.PI * 2) / 3, colors.teal, 0.01)
        ];

        let globalRotation = 0;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            globalRotation += 0.005;
            drawCenter(globalRotation);
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(globalRotation);
            ctx.translate(-width / 2, -height / 2);
            rings.forEach(ring => { ring.update(); ring.draw(); });
            ctx.restore();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 5. DNA ANIMATION
    useEffect(() => {
        const canvas = dnaCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0;
        let animationFrameId: number;
        let particles: any[] = [];
        let time = 0;

        const colors = {
            backbone: '#2A9D8F',
            rungs: ['#E9C46A', '#F4A261', '#F7B9B1', '#F8FAF3']
        };

        const resize = () => {
            const container = canvas.parentElement;
            if (container) {
                width = container.clientWidth;
                height = container.clientHeight;
                canvas.width = width;
                canvas.height = height;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        const project = (x: number, y: number, z: number) => {
            const perspective = width;
            const scale = perspective / (perspective + z);
            return { x: x * scale + width / 2, y: y * scale + height / 2, scale };
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles = [];
            const strandCount = 25;
            const spacing = height / 18;
            const radius = width / 5;
            const speed = 0.02;
            const startY = -(strandCount * spacing) / 2;

            time += speed;

            for (let i = 0; i < strandCount; i++) {
                const y = startY + i * spacing;
                const angle = (i * 0.5) + time;
                const x1 = Math.cos(angle) * radius;
                const z1 = Math.sin(angle) * radius;
                const x2 = Math.cos(angle + Math.PI) * radius;
                const z2 = Math.sin(angle + Math.PI) * radius;
                const rungColor = colors.rungs[i % colors.rungs.length];

                for (let j = 0; j <= 12; j++) {
                    const t = j / 12;
                    particles.push({
                        x: x1 + (x2 - x1) * t, y, z: z1 + (z2 - z1) * t,
                        radius: 3 * (width / 500), color: rungColor, type: 'rung'
                    });
                }
                particles.push({ x: x1, y, z: z1, radius: 10 * (width / 500), color: colors.backbone, type: 'backbone' });
                particles.push({ x: x2, y, z: z2, radius: 10 * (width / 500), color: colors.backbone, type: 'backbone' });
            }

            particles.sort((a, b) => b.z - a.z);
            particles.forEach(p => {
                const pos = project(p.x, p.y, p.z);
                ctx.globalAlpha = p.type === 'rung' ? 0.7 : 1;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, Math.max(0, p.radius * pos.scale), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --- RENDER HELPERS ---
    const nextEventSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (eventsData.length === 0) return;
        setCurrentEventIndex((prev) => (prev + 1) % eventsData.length);
    };

    const prevEventSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (eventsData.length === 0) return;
        setCurrentEventIndex((prev) => (prev - 1 + eventsData.length) % eventsData.length);
    };

    return (
        <div id="main-site" className="min-h-screen bg-brand-dark text-brand-light font-sans selection:bg-brand-pink/50">

            {/* Header */}
            <header className="sticky top-0 z-50 w-full bg-brand-dark/90 backdrop-blur-md border-b border-brand-teal/20">
                <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 relative flex items-center justify-center bg-brand-light/10 rounded-lg overflow-hidden border border-brand-teal/30 group-hover:border-brand-yellow/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_15px_rgba(233,196,106,0.4)]">
                            <img src="/dist/image/logo/conso_lofgo[1].png" alt="Consoulium Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-sans text-2xl font-bold tracking-tighter text-brand-light group-hover:text-brand-yellow transition-colors duration-300">Consoulium</span>
                    </a>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-light/80">
                        <a href="#" className="text-brand-light font-bold hover:text-brand-yellow transition-colors">Home</a>
                       {/* <a href="#about" className="hover:text-brand-yellow transition-colors">About</a>*/}
                        <div className="relative group">
                            <button className="flex items-center gap-1 hover:text-brand-yellow transition-colors focus:outline-none py-2">
                                Explore <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                            </button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-brand-charcoal border border-brand-teal/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                                <div className="p-1 flex flex-col">
                                    <a href="#results" className="block px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-brand-light/80 hover:text-brand-yellow">RESULTS</a>
                                    <a href="#news" className="block px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-brand-light/80 hover:text-brand-yellow">NEWS</a>
                                    <a href="#events" className="block px-4 py-2 hover:bg-white/5 rounded-lg text-sm text-brand-light/80 hover:text-brand-yellow">EVENTS</a>
                                </div>
                            </div>
                        </div>
                        
                    </nav>

                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-brand-dark border-b border-brand-teal/20 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto z-40 animate-in slide-in-from-top-5">
                        <div className="p-6 flex flex-col gap-6">
                            <a href="#" className="text-xl font-medium text-brand-light" onClick={() => setMobileMenuOpen(false)}>Home</a>
                            <a href="#about" className="text-xl font-medium text-brand-light/80" onClick={() => setMobileMenuOpen(false)}>About</a>
                            
                            {/* Mobile Explore Dropdown */}
                            <div className="flex flex-col gap-2">
                                <a href="#results" className="text-xl font-medium text-brand-light/80" onClick={() => setMobileMenuOpen(false)}>Results</a>
                                <a href="#news" className="text-xl font-medium text-brand-light/80" onClick={() => setMobileMenuOpen(false)}>News</a>
                                <a href="#events" className="text-xl font-medium text-brand-light/80" onClick={() => setMobileMenuOpen(false)}>Events</a>
                            </div>
                            
                            
                            
                            
                        </div>
                    </div>
                )}
            </header>
            {/* Hero Section */}
            <section className="relative px-4 md:px-6 py-6 md:py-8">
                <div id="hero-container" className="relative w-full h-[650px] md:h-[85vh] min-h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden group border-4 border-brand-teal/20 bg-brand-charcoal shadow-2xl">
                    {/* Videos */}
                    <div className="absolute inset-0 w-full h-full">
                        {heroVideos.map((vid, idx) => (
                            <video
                                key={idx}
                                src={vid}
                                autoPlay muted loop playsInline
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === heroVideoIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                        <div className="absolute inset-0 bg-brand-dark/50 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-brand-gradient opacity-60 mix-blend-overlay"></div>
                    </div>

                    <div className="absolute inset-0 bg-brand-gradient opacity-40 mix-blend-overlay z-[2]"></div>

                    {/* Logo Slot */}
                    <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-brand-charcoal/60 backdrop-blur-md border border-brand-light/20 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                            <img
                                className="w-full h-full object-contain p-4"
                                src="/dist/image/logo/logo[1].png"
                                alt="Company Logo"
                            />
                        </div>
                    </div>

                    <div className="absolute inset-0 z-10 p-6 md:p-16 flex flex-col justify-end">
                        <div className="flex flex-col md:flex-row items-end justify-between gap-12 w-full">
                            <div className="max-w-4xl w-full">
                                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-brand-light/20 bg-brand-charcoal/30 backdrop-blur-md mb-8">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow"></span>
                                    </span>
                                    <span className="text-brand-light font-mono text-xs md:text-sm font-bold tracking-widest uppercase">Consoulium 31 Edition '</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-brand-light leading-[1] mb-8 tracking-tight drop-shadow-2xl">
                                    <div className="overflow-hidden">
                                        <span className="block animate-in slide-in-from-bottom-full duration-1000">Everlasting</span>
                                    </div>
                                    <div className="overflow-hidden flex flex-wrap gap-x-4 items-baseline">
                                        <span className="block animate-in slide-in-from-bottom-full duration-1000 delay-100">
                                            <span className="font-pixel text-brand-yellow font-bold hover:scale-110 hover:text-brand-orange transition-all duration-300 inline-block cursor-default drop-shadow-lg">Littles</span>
                                        </span>
                                    </div>
                                </h1>
                                <div className="flex flex-col gap-8 items-start">
                                    <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 text-lg md:text-xl text-brand-light/90 leading-relaxed max-w-lg drop-shadow-md">
                                        Consoulium'25 is the eagerly anticipated annual literary and cultural festival,
                                        meticulously crafted under the auspices of the Students’ Association of Bukhari
                                        Islamic Da'wa College (SABIC).
                                    </p>
                            
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Canvas Animations) */}
            <section className="py-20 md:py-32 px-4 md:px-6 container mx-auto overflow-hidden">
                {/* Block 1: Atomic */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32 relative">
                    <div className="md:w-1/2 relative z-10">
                        <div className="bg-brand-charcoal border border-brand-teal/30 p-12 rounded-[2.5rem] relative text-brand-light shadow-2xl hover:border-brand-yellow/50 transition-colors duration-500">
                            <div className="absolute -top-12 left-12 w-16 h-16 text-brand-yellow">
                                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-full h-full transform -rotate-12">
                                    <path d="M20,10 Q50,0 80,40" />
                                    <path d="M80,40 L70,30 M80,40 L90,30" />
                                </svg>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-medium leading-tight mb-8">THEME <br /> <span className="font-pixel text-brand-pink">PHILOSOPHY</span></h2>
                            <p className="text-lg text-brand-light/80 leading-relaxed">Our philosophy challenges the obsession with "bigness" by shifting the lens to the microscopic foundations of existence. We assert that the "Little" is not a reduction of power, but the very source of it.</p>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center relative">
                        <div id="atomic-container" className="relative w-full max-w-[500px] lg:max-w-[700px] aspect-square flex items-center justify-center">
                            <canvas ref={atomicCanvasRef} className="w-full h-full"></canvas>
                        </div>
                    </div>
                </div>
                {/* Block 2: DNA */}
                <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-24 relative">
                    <div className="md:w-1/2 flex justify-center relative">
                        <div id="dna-container" className="relative w-full max-w-[500px] lg:max-w-[700px] aspect-square flex items-center justify-center">
                            <canvas ref={dnaCanvasRef} className="w-full h-full"></canvas>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative z-10">
                        <div className="bg-brand-charcoal border border-brand-teal/30 p-12 rounded-[2.5rem] relative text-right text-brand-light shadow-2xl hover:border-brand-pink/50 transition-colors duration-500">
                            <h2 className="text-4xl md:text-6xl font-medium leading-tight mb-8">Spirituality   <br /> <span className="font-pixel text-brand-yellow">Iin the Small:</span></h2>
                            <p className="text-lg text-brand-light/80 leading-relaxed">Just as a single atom holds immense energy, our small charities (sadaqah), kind words, and gentle smiles carry profound spiritual and worldly weight.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Result Preview Section */}
            <section id="results" className="py-24 bg-brand-dark relative overflow-hidden text-brand-light border-t border-brand-light/5">
                <div className="absolute inset-0 bg-brand-gradient opacity-10 z-0 pointer-events-none"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-7xl font-medium mb-4 leading-tight text-brand-light">Live <span className="font-pixel text-brand-teal">Result</span> <br /> Preview</h2>
                        <p className="text-brand-light/60 text-lg">Real-time updates from our campuses.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Iframe Preview of Consoulium Candidate Form */}
                        <div className="bg-brand-charcoal border border-brand-teal/30 p-8 md:p-10 rounded-[2.5rem] shadow-2xl hover:border-brand-yellow/50 transition-all duration-300 group md:col-span-2">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal border border-brand-teal/30">
                                        <School size={24} />
                                    </div>
                                    <h3 className="text-3xl font-bold text-brand-light">Student <span className="font-pixel text-brand-yellow">Portal</span></h3>
                                </div>
                                <span className="px-4 py-1 rounded-full bg-brand-teal/20 text-brand-teal text-sm font-bold border border-brand-teal/30 animate-pulse">LIVE PREVIEW</span>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-brand-light/80 mb-4">
                                    Preview of the student candidate portal where participants can register and view results.
                                </p>
                            </div>
                            
                            <div className="rounded-xl overflow-hidden border border-brand-light/10 shadow-lg h-[500px]">
                                <iframe 
                                    src="https://consouium.festie.app/candidate" 
                                    title="Consoulium Candidate Portal"
                                    className="w-full h-full"
                                    sandbox="allow-scripts allow-same-origin allow-forms"
                                    loading="lazy"
                                ></iframe>
                            </div>
                            
                            <a 
                                href="https://consouium.festie.app/candidate" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full mt-8 py-4 rounded-xl bg-brand-teal/10 hover:bg-brand-teal text-brand-teal hover:text-white border border-brand-teal/30 transition-all font-bold flex items-center justify-center gap-2"
                            >
                                Open Full Portal <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Facts */}
            <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-brand-light/5">
                <div id="facts-shape" className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-brand-teal rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0 pointer-events-none"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-brand-light/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-light/10 transition-all duration-300 shadow-sm text-brand-yellow">
                                <Calendar size={32} />
                            </div>
                            <div className="text-5xl md:text-6xl font-medium mb-3 text-brand-light"><span className="font-pixel">40</span></div>
                            <div className="text-brand-light/50 font-bold uppercase tracking-widest text-sm">Days</div>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-brand-light/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-light/10 transition-all duration-300 shadow-sm text-brand-orange">
                                <School size={32} />
                            </div>
                            <div className="text-5xl md:text-6xl font-medium mb-3 text-brand-light"><span className="font-pixel">12</span></div>
                            <div className="text-brand-light/50 font-bold uppercase tracking-widest text-sm">Campuses</div>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-brand-light/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-light/10 transition-all duration-300 shadow-sm text-brand-teal">
                                <Ticket size={32} />
                            </div>
                            <div className="text-5xl md:text-6xl font-medium mb-3 text-brand-light"><span className="font-pixel">300</span></div>
                            <div className="text-brand-light/50 font-bold uppercase tracking-widest text-sm">Events</div>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-brand-light/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-light/10 transition-all duration-300 shadow-sm text-brand-pink">
                                <Medal size={32} />
                            </div>
                            <div className="text-5xl md:text-6xl font-medium mb-3 text-brand-light"><span className="font-pixel">600</span></div>
                            <div className="text-brand-light/50 font-bold uppercase tracking-widest text-sm">Competitives</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section id="news" className="py-24 bg-brand-charcoal relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-brand-teal/5"></div>
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-20 relative z-10 gap-12">
                        <div className="max-w-xl">
                            <h2 className="text-5xl md:text-7xl font-medium mb-8 leading-tight text-brand-light">News And <br />
                                <span className="font-pixel text-brand-orange">Updates</span>
                            </h2>
                            <p className="text-brand-light/70 text-lg mb-12 leading-relaxed font-medium">Stay in the loop with the latest happenings.</p>
                            <button className="group px-8 h-14 text-base font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 bg-brand-teal text-white rounded-full border border-brand-teal hover:bg-brand-teal/90">
                                View All News <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {newsUpdates.length > 0 ? newsUpdates.slice(0, 6).map(item => (
                            <div key={item.id} onClick={() => setSelectedNews(item)} className="group cursor-pointer flex flex-col h-full hover:scale-[1.02] transition-transform duration-300">
                                <div className="overflow-hidden rounded-[2rem] mb-6 h-64 border-2 border-brand-light/5 group-hover:border-brand-yellow/50 transition-all relative">
                                    <div className="absolute top-4 left-4 bg-brand-charcoal/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 shadow-sm text-brand-yellow border border-brand-light/10">
                                        {item.category}
                                    </div>
                                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                                </div>
                                <h3 className="text-2xl font-medium mb-3 text-brand-light group-hover:text-brand-yellow transition-colors">{item.title}</h3>
                                <div className="text-brand-light/60 leading-relaxed text-sm mb-6 flex-grow line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                                <div className="mt-auto text-brand-teal text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-3 text-center text-brand-light/30">No updates yet.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Events Gallery */}
            <section id="events" className="py-24 bg-brand-dark overflow-hidden relative">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                        <div className="max-w-2xl relative z-10">
                            <h2 className="text-5xl md:text-7xl font-medium leading-tight mb-6 text-brand-light">Checkout our
                                <br /> <span className="font-pixel text-brand-orange">Conso</span><br /> Events
                            </h2>
                        </div>
                    </div>
                    {/* Carousel */}
                    <div className="relative rounded-[2rem] overflow-hidden h-[500px] md:h-[700px] group cursor-pointer shadow-2xl transition-all hover:shadow-3xl border-4 border-brand-teal/20">
                        <div id="carousel-slides" className="w-full h-full relative">
                            {eventsData.length > 0 ? eventsData.map((event, index) => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentEventIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                >
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/20 to-transparent opacity-90"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-brand-light">
                                        <div className="max-w-3xl">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="bg-brand-yellow text-brand-charcoal px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Event</span>
                                                <span className="text-sm font-medium flex items-center gap-2 bg-brand-charcoal/40 px-3 py-1 rounded-full backdrop-blur-sm border border-brand-light/10">
                                                    <Calendar size={12} /> {event.date}
                                                </span>
                                            </div>
                                            <h3 className="text-4xl md:text-6xl font-medium mb-4 leading-tight drop-shadow-lg">{event.title}</h3>
                                            <p className="text-brand-light/80 md:text-lg line-clamp-2 mb-6 max-w-2xl">{event.description}</p>
                                            <div className="flex items-center gap-2 text-brand-yellow font-bold text-sm uppercase tracking-widest">View Details <ArrowRight size={16} /></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex items-center justify-center h-full text-brand-light/30">No events posted.</div>
                            )}
                        </div>
                        <div className="absolute top-8 right-8 flex gap-4 z-20">
                            <button onClick={prevEventSlide} className="w-14 h-14 rounded-full bg-brand-charcoal/40 backdrop-blur-md text-brand-light flex items-center justify-center hover:bg-brand-light hover:text-brand-charcoal transition-all shadow-lg border border-brand-light/20"><ArrowRight size={24} className="rotate-180" /></button>
                            <button onClick={nextEventSlide} className="w-14 h-14 rounded-full bg-brand-charcoal/40 backdrop-blur-md text-brand-light flex items-center justify-center hover:bg-brand-light hover:text-brand-charcoal transition-all shadow-lg border border-brand-light/20"><ArrowRight size={24} /></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-brand-dark overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-20 relative">
                        <h2 className="text-4xl md:text-6xl font-medium mb-6 relative inline-block text-brand-light">What Our
                            <span className="font-pixel text-brand-yellow">Members</span> <br /> Are Saying...
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {/* 1 */}
                        <div className="bg-brand-charcoal border border-brand-light/10 p-8 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px] hover:-translate-y-2 transition-transform duration-300 hover:border-brand-pink/30">
                            <p className="text-lg leading-relaxed mb-8 font-medium text-brand-light/80">"Consoulium has become an integral part of our institution's vision for holistic education, bridging tradition and modernity."</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-brand-light/20 overflow-hidden"><img src="/dist/image/profiles/THENNALA USTHAD.jpg" alt="Principal" className="w-full h-full object-cover" /></div>
                                <div><h4 className="font-bold text-base text-brand-light">Aboohaneefal Faizy Thennala</h4><span className="text-xs text-brand-light/50 uppercase tracking-wide">Principal</span></div>
                            </div>
                        </div>
                        {/* 2 */}
                        <div className="bg-brand-charcoal border border-brand-light/10 p-8 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px] hover:-translate-y-2 transition-transform duration-300 hover:border-brand-pink/30">
                            <p className="text-lg leading-relaxed mb-8 font-medium text-brand-light/80">"This festival has enhanced student development, especially in public speaking and critical thinking."</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-brand-light/20 overflow-hidden"><img src="/dist/image/profiles/Dr. V Abdul Latheef.jpeg" alt="Head" className="w-full h-full object-cover" /></div>
                                <div><h4 className="font-bold text-base text-brand-light">Dr. V Abdul Latheef</h4><span className="text-xs text-brand-light/50 uppercase tracking-wide">Academic Head</span></div>
                            </div>
                        </div>
                        {/* 3 */}
                        <div className="bg-brand-charcoal border border-brand-light/10 p-8 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px] hover:-translate-y-2 transition-transform duration-300 hover:border-brand-pink/30">
                            <p className="text-lg leading-relaxed mb-8 font-medium text-brand-light/80">"I am impressed by how Consoulium has created a platform for students to express themselves."</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-brand-light/20 overflow-hidden"><img src="/dist/image/profiles/farooq ust.jpg" alt="Alumni" className="w-full h-full object-cover" /></div>
                                <div><h4 className="font-bold text-base text-brand-light">Dr. PA Muhammed Farooq</h4><span className="text-xs text-brand-light/50 uppercase tracking-wide">Alumni</span></div>
                            </div>
                        </div>
                        {/* 4 */}
                        <div className="bg-brand-charcoal border border-brand-light/10 p-8 rounded-[2rem] flex flex-col justify-between h-full min-h-[300px] hover:-translate-y-2 transition-transform duration-300 hover:border-brand-pink/30">
                            <p className="text-lg leading-relaxed mb-8 font-medium text-brand-light/80">"The program has not only honed our students' academic abilities but also cultivated their ethical reasoning."</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-brand-light/20 overflow-hidden"><img src="/dist/image/profiles/OLAVATTUR USTHAD.jpg" alt="Vice" className="w-full h-full object-cover" /></div>
                                <div><h4 className="font-bold text-base text-brand-light">Abdul Naswir Ahsani</h4><span className="text-xs text-brand-light/50 uppercase tracking-wide">Vice Principal</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-10 pb-10 bg-brand-charcoal text-brand-light border-t border-brand-teal/20 font-sans">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center gap-6 md:hidden mb-8">
                        <div className="text-center">
                            <a href="#" className="flex flex-col gap-1 group items-center">
                                <span className="font-sans text-3xl font-bold tracking-tighter text-brand-light">Consoulium</span>
                                <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-medium">Cultural Festival '25</span>
                            </a>
                        </div>
                        <div className="flex gap-6">
                            <a href="https://share.google/p2RIQwUeOsp7n0TAT" className="hover:text-brand-yellow transition-colors"><Instagram size={24} /></a>
                            <a href="https://share.google/B7wsnO6tdckiT4BrB" className="hover:text-brand-yellow transition-colors"><Youtube size={24} /></a>
                            <a href="https://share.google/xb6t25ic91X6UBaGk" className="hover:text-brand-yellow transition-colors"><Facebook size={24} /></a>
                        </div>
                    </div>

                    <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <a href="#" className="flex flex-col gap-1 group">
                                <span className="font-sans text-3xl font-bold tracking-tighter text-brand-light">Consoulium</span>
                                <span className="text-[10px] uppercase tracking-widest text-brand-yellow font-medium">Cultural Festival '25</span>
                            </a>
                            <p className="text-brand-light/60 text-sm leading-relaxed max-w-xs mt-6">Celebrating heritage, arts, and creativity.</p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="text-brand-light/60 hover:text-brand-yellow transition-colors"><Instagram size={20} /></a>
                                <a href="#" className="text-brand-light/60 hover:text-brand-yellow transition-colors"><Youtube size={20} /></a>
                                <a href="#" className="text-brand-light/60 hover:text-brand-yellow transition-colors"><Facebook size={20} /></a>
                                <a href="#" className="text-brand-light/60 hover:text-brand-yellow transition-colors"><Twitter size={20} /></a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-6 text-brand-yellow">Contact Info</h3>
                            <div className="space-y-5 text-brand-light/60 text-sm">
                                <div className="flex items-start gap-3"><MapPin size={16} className="text-brand-teal" /><p>Malappuram, Kerala, India</p></div>
                                <div className="flex items-center gap-3"><Mail size={16} className="text-brand-teal" /><a href="mailto:bukharikdy@gmail.com">bukharikdy@gmail.com</a></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-6 text-brand-yellow">Quick Links</h3>
                            <ul className="space-y-3 text-brand-light/60 text-sm font-medium">
                                <li><a href="#" className="hover:text-brand-yellow transition-colors">Home</a></li>
                                <li><a href="#events" className="hover:text-brand-yellow transition-colors">Events</a></li>
                                <li><a href="#contact" className="hover:text-brand-yellow transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-6 text-brand-yellow">Admin</h3>
                            <button onClick={onLoginClick} className="flex items-center gap-2 text-brand-light/60 hover:text-brand-yellow transition-colors text-sm font-medium">
                                <LogIn size={16} /> Admin Login
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-brand-light/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-light/40">
                        <p>&copy; 2025 Consoulium Festival.</p>
                    </div>
                </div>
            </footer>

            {/* AI Floating Button */}
            <button onClick={() => setAiModalOpen(true)} className="fixed bottom-8 right-8 z-40 bg-brand-teal text-white p-4 rounded-full shadow-[0_0_20px_rgba(42,157,143,0.5)] hover:scale-110 transition-transform duration-300 group border-2 border-brand-yellow flex items-center justify-center">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-yellow rounded-full animate-bounce"></div>
                <Bot size={28} />
                <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-brand-charcoal text-brand-yellow px-3 py-1.5 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-brand-teal/30 pointer-events-none">Ask AI</span>
            </button>

            {/* AI Modal */}
            {aiModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-brand-dark border border-brand-teal/30 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative transform scale-100 transition-transform duration-300 m-4">
                        <button onClick={() => setAiModalOpen(false)} className="absolute top-6 right-6 p-2 bg-brand-light/5 rounded-full hover:bg-brand-light/10 transition-colors text-brand-light/60 hover:text-brand-light">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-teal to-brand-dark mb-8 flex items-center justify-center shadow-lg shadow-brand-teal/20 animate-pulse border border-brand-teal/50 text-brand-light">
                                <Mic size={40} />
                            </div>
                            <h3 className="text-3xl font-bold mb-3 tracking-tight text-brand-light">Consoulium AI</h3>
                            <p className="text-brand-light/60 mb-10 text-base">Your intelligent guide to the festival experience.</p>
                            <div className="grid grid-cols-1 gap-4 w-full">
                                <button className="flex items-center gap-4 p-4 rounded-2xl bg-brand-light/5 hover:bg-brand-teal hover:text-white transition-all group w-full text-left border border-brand-light/5 hover:border-brand-teal">
                                    <div className="w-12 h-12 bg-brand-light/10 group-hover:bg-brand-light/20 rounded-full flex items-center justify-center shadow-sm shrink-0 transition-colors text-brand-light group-hover:text-white">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="text-brand-light group-hover:text-white">
                                        <span className="font-bold block text-lg">Start Conversation</span>
                                        <span className="text-xs opacity-60 group-hover:opacity-80 uppercase tracking-wider font-bold">Ask about events</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* News Modal (Reader View) */}
            {selectedNews && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-md transition-opacity" onClick={() => setSelectedNews(null)}></div>
                    <div className="bg-brand-charcoal border border-brand-teal/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] relative z-10 shadow-2xl flex flex-col animate-scale-in custom-scrollbar">
                        <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-all hover:rotate-90">
                            <X size={24} />
                        </button>

                        {/* News Header Image */}
                        <div className="h-64 md:h-80 w-full relative shrink-0">
                            <img src={selectedNews.imageUrl} className="w-full h-full object-cover" alt={selectedNews.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 md:left-10 text-brand-light">
                                <span className="inline-block bg-brand-teal text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider shadow-lg">{selectedNews.category}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-10 bg-brand-charcoal">
                            <div className="flex items-center gap-3 text-brand-light/50 text-sm mb-4">
                                <Calendar size={14} />
                                <span>{selectedNews.date}</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold leading-tight text-brand-light mb-8">{selectedNews.title}</h3>

                            <div className="prose prose-lg prose-invert max-w-none">
                                <div className="text-brand-light/80 leading-relaxed whitespace-pre-wrap text-lg" dangerouslySetInnerHTML={{ __html: selectedNews.description }} />
                            </div>

                            <div className="mt-12 pt-8 border-t border-brand-light/10 flex justify-between items-center">
                                <span className="text-brand-light/40 text-sm italic">Consoulium News Desk</span>
                                <button onClick={() => setSelectedNews(null)} className="px-6 py-3 rounded-xl border border-brand-light/20 hover:bg-brand-light/10 transition-colors font-bold text-brand-light text-sm">Close Article</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}></div>
                    <div className="bg-brand-dark border border-brand-teal/30 text-brand-light rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col custom-scrollbar">
                        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center bg-brand-charcoal/60 backdrop-blur rounded-full hover:bg-brand-light/20 transition-colors z-20 shadow-md text-brand-light">
                            <X size={20} />
                        </button>
                        <div className="h-64 md:h-80 w-full relative shrink-0">
                            <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" alt={selectedEvent.title} />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal to-transparent"></div>
                            <div className="absolute bottom-6 left-6 md:left-10 text-brand-light">
                                <span className="inline-block bg-brand-yellow text-brand-charcoal text-xs font-bold px-2 py-1 rounded mb-2 uppercase">Event Details</span>
                                <h3 className="text-3xl md:text-5xl font-medium leading-none drop-shadow-lg">{selectedEvent.title}</h3>
                            </div>
                        </div>
                        <div className="p-8 md:p-12">
                            <div className="flex flex-wrap gap-4 md:gap-6 mb-8 text-sm md:text-base border-b border-brand-light/10 pb-8">
                                <div className="flex items-center gap-3 text-brand-light bg-brand-light/5 px-5 py-3 rounded-xl border border-brand-light/10 hover:bg-brand-light/10 hover:scale-105 transition-all duration-300">
                                    <Calendar className="text-brand-teal" size={20} />
                                    <div><p className="text-xs text-brand-light/50 uppercase font-bold">Date</p><span className="font-medium">{selectedEvent.date}</span></div>
                                </div>
                                <div className="flex items-center gap-3 text-brand-light bg-brand-light/5 px-5 py-3 rounded-xl border border-brand-light/10 hover:bg-brand-light/10 hover:scale-105 transition-all duration-300">
                                    <Clock className="text-brand-yellow" size={20} />
                                    <div><p className="text-xs text-brand-light/50 uppercase font-bold">Time</p><span className="font-medium">10:00 AM</span></div>
                                </div>
                            </div>
                            <div className="prose prose-lg text-brand-light/80 max-w-none">
                                <h4 className="text-xl font-bold text-brand-light mb-4">About This Event</h4>
                                <p className="leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                            </div>
                            <div className="mt-12 flex flex-col md:flex-row gap-4">
                                <button className="flex-1 justify-center text-lg h-14 bg-brand-yellow text-brand-charcoal hover:bg-brand-orange rounded-full font-medium shadow-lg transition-colors font-bold">Register Now</button>
                                <button onClick={() => setSelectedEvent(null)} className="flex-1 md:flex-none justify-center h-14 border border-brand-light/20 rounded-full font-medium px-8 hover:bg-brand-light/10 text-brand-light transition-colors">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicSite;
