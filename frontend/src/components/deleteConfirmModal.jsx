import React, { useState } from 'react';
import { Trash2, X, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, employeeName, loading }) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(password);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Header with Icon */}
                    <div className="p-8 text-center bg-gradient-to-b from-rose-500/10 to-transparent">
                        <div className="w-20 h-20 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Delete Employee</h2>
                        <p className="text-slate-400 font-medium px-2">
                           You are about to delete <span className="text-white font-bold">{employeeName}</span>. This action is permanent and cannot be undone.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-primary" />
                                Verify Password
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your admin password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-[0_10px_20px_-5px_rgba(244,63,94,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : "Confirm Delete"}
                            </button>
                        </div>
                    </form>

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
                    background: rgba(23, 17, 33, 0.9);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                }
            `}</style>
        </div>
    );
};

export default DeleteConfirmModal;
