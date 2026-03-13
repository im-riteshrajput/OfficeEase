import React from 'react';
import { Link } from 'react-router-dom';

export default function WaitingPage() {
    return (
        <div className="font-display bg-background-dark text-slate-100 min-h-screen flex flex-col relative overflow-hidden selection:bg-primary/30">
            {/* Background Orbs */}
            <div className="liquid-orb w-[800px] h-[800px] bg-primary top-[-20%] left-[-10%]"></div>
            <div className="liquid-orb w-[800px] h-[800px] bg-accent-teal bottom-[-20%] right-[-10%]"></div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">layers</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white neon-glow-purple">OREON</span>
                </div>
                <button className="w-12 h-12 rounded-full glass-input flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined">person</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="glass-card max-w-3xl w-full p-10 md:p-16 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">

                    {/* Icon */}
                    <div className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(124,59,237,0.4)]">
                            <span className="material-symbols-outlined text-4xl">more_horiz</span>
                        </div>
                    </div>

                    {/* Text Content */}
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight uppercase">
                        Account Under Review
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-xl">
                        Welcome to <strong className="text-white">OREON</strong>! Your profile is currently being reviewed by our Admin or HR team. You'll receive an email notification once your access is approved.
                    </p>

                    {/* Progress Section */}
                    <div className="w-full max-w-md mb-12">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-4">
                            <span className="text-primary">Verification Stage</span>
                            <span className="text-slate-500">Step 2 of 3</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent-teal rounded-full shadow-[0_0_15px_rgba(124,59,237,0.6)]"
                                style={{ width: '66%' }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-accent-teal text-base animate-spin">sync</span>
                            Processing profile data...
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-8">
                        <button className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all">
                            <span className="material-symbols-outlined text-lg">mail</span>
                            Contact Support
                        </button>
                        <Link to="/" className="text-slate-400 hover:text-white font-bold text-sm transition-colors">
                            Logout and Exit
                        </Link>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-8 text-center">
                <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">
                    © 2024 OREON ENTERPRISE. ALL SYSTEMS SECURE.
                </p>
            </footer>
        </div>
    );
}
