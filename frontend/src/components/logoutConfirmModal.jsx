import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Header with Icon */}
                    <div className="p-8 text-center bg-gradient-to-b from-rose-500/10 to-transparent">
                        <div className="w-20 h-20 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse">
                            <LogOut className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Confirm Logout</h2>
                        <p className="text-slate-400 font-medium">Are you sure you want to end your session?</p>
                    </div>

                    {/* Actions */}
                    <div className="p-8 pt-0 grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-[0_10px_20px_-5px_rgba(244,63,94,0.4)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <style>{`
                .glass-card {
                    background: rgba(23, 17, 33, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
};

export default LogoutConfirmModal;
