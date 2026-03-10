import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#110f18] flex flex-col items-center justify-center relative overflow-hidden font-display selection:bg-purple-500/30">
            <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#2DD4BF]/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[400px] p-12 bg-[#1a1625]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-2xl flex flex-col items-center">

                {/* Animated Icon */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-[#8B5CF6]/30 blur-xl rounded-full animate-pulse"></div>
                    <div className="w-16 h-16 relative animate-[bounce_3s_ease-in-out_infinite]">
                        <svg
                            width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                        >
                            <g transform="rotate(-30 32 32)">
                                <path d="M16 28 C16 36.8366 23.1634 44 32 44 C40.8366 44 48 36.8366 48 28 L48 36 C48 44.8366 40.8366 52 32 52 C23.1634 52 16 44.8366 16 36 Z" fill="#7C3AED" />
                                <ellipse cx="32" cy="28" rx="16" ry="8" fill="#A78BFA" />
                                <ellipse cx="32" cy="28" rx="10" ry="5" fill="#4C1D95" />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Logo Text */}
                <h1 className="text-4xl font-black text-white tracking-[0.25em] mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    OFFIFY
                </h1>

                {/* Progress Bar Container */}
                <div className="w-full space-y-4">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-[#8B5CF6] to-[#2DD4BF] rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                            style={{ animation: 'slide 1.5s infinite ease-in-out' }}
                        >
                            {/* Shine effect on progress bar */}
                            <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]"></div>
                        </div>
                    </div>

                    {/* Progress Text */}
                    <div className="flex justify-center items-center text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                        <span>Loading...</span>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-12 text-center space-y-2 z-10">
                <p className="text-xs font-medium text-slate-500 tracking-wide">OFFIFY Management System v2.4.0</p>
                <p className="text-[10px] text-slate-600 tracking-wider">Establishing secure connection to workspace...</p>
            </div>
        </div>
    );
}
