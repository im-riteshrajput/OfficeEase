import React from 'react';
import { useState, useEffect } from "react";
import { ArrowRight, BarChart3, Users, Shield, Rocket, Globe, AtSign, MessageCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    // Automatically redirect to dashboard if token exists
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen relative overflow-x-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="orb-purple absolute top-[-10%] left-[-5%] w-[500px] h-[500px]"></div>
                <div className="orb-teal absolute bottom-[10%] right-[-5%] w-[400px] h-[400px]"></div>
                <div className="orb-blue absolute top-[40%] left-[60%] w-[350px] h-[350px]"></div>
            </div>
            <div className="relative z-10 layout-container flex flex-col min-h-screen">
                <header className="sticky top-4 mx-auto w-full max-w-7xl px-4 z-50">
                    <nav className="glass-panel rounded-xl px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                                <Rocket className="text-white w-6 h-6" />
                            </div>
                            <h2 className="text-slate-100 text-xl font-extrabold tracking-tighter font-offify">OFFIFY</h2>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Home</a>
                            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Features</a>
                            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">About</a>
                            <a className="text-slate-300 hover:text-primary transition-colors text-sm font-medium" href="#">Contact</a>
                        </div>
                        <Link to="/login" className="glass-panel hover:bg-white/10 px-5 py-2 rounded-lg text-white text-sm font-bold transition-all">
                            Sign In
                        </Link>
                    </nav>
                </header>
                <main className="flex-1 max-w-7xl mx-auto w-full px-4">
                    <section className="flex flex-col items-center justify-center pt-24 pb-16 text-center relative">
                        <div className="hero-gradient absolute inset-0 -z-10"></div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8">
                            <Sparkles className="text-primary w-5 h-5" />
                            NEXT GENERATION WORKFORCE
                        </div>
                        <h1 className="text-slate-100 text-5xl md:text-7xl font-black leading-[1.1] tracking-tight mb-6 max-w-4xl font-OFFIFY">
                            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Employee Management</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-light">
                            Revolutionize your workflow with OFFIFY's advanced AI-driven tools. Seamlessly manage global teams with our liquid glass interface.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/dashboard" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(124,59,237,0.5)] transition-all flex items-center justify-center gap-2">
                                Get Started <ArrowRight className="w-6 h-6" />
                            </Link>
                            <button className="glass-panel hover:bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/10">
                                Learn More
                            </button>
                        </div>
                        <div className="mt-20 w-full max-w-5xl mx-auto p-4 glass-panel rounded-2xl relative">
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900/50">
                                <img className="w-full h-full object-cover opacity-80" data-alt="Modern dashboard interface with AI analytics charts and team overview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6EzvMnE3FuKlpg3CT6WzVTWjYMIqe5QJloAO4dp-_Wv938zOJKNDw4-VDTDZ3gmQlQS2S6mjsZtMzHZbSxNmsXhnJjsXApqlJ5mU_k36jp28_vJavQ1SodNd_FD_FTnMC2Z1vpOSBrow-zUS4IIDOe4vIIVGuKE498o5cX3C4tvfkdc_eUGQ82OoGhMrXG5EU3inHsYMgzQPyBCPVqszc1FkV_X_1H1BIOBB-B_sc3zT9EHIsUJzs6HJCohy1JJ2rwlTesmRH06A" />
                            </div>
                        </div>
                    </section>
                    <section className="py-12">
                        <div className="glass-panel rounded-2xl p-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                            {/* <div className="text-center">
                                <p className="text-primary text-3xl font-black mb-1 font-OFFIFY">500+</p>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Companies</p>
                            </div> */}
                            <div className="text-center border-l border-white/5">
                                <p className="text-primary text-3xl font-black mb-1 font-OFFIFY">10K+</p>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Employees</p>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <p className="text-primary text-3xl font-black mb-1 font-OFFIFY">99.9%</p>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Uptime</p>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <p className="text-primary text-3xl font-black mb-1 font-OFFIFY">4.9★</p>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Rating</p>
                            </div>
                        </div>
                    </section>
                    <section className="py-20">
                        <div className="text-center mb-16">
                            <h2 className="text-slate-100 text-3xl md:text-4xl font-bold mb-4 font-OFFIFY">Smart Solutions for Modern Teams</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">Experience the liquid glass design language with powerful AI integration for every aspect of your business.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-transform duration-300">
                                <div className="bg-primary/20 w-14 h-14 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="text-primary w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-slate-100 text-xl font-bold mb-3">Smart Analytics</h3>
                                    <p className="text-slate-400 leading-relaxed">Deep insights driven by AI algorithms. Track performance, productivity, and growth metrics in real-time.</p>
                                </div>
                            </div>
                            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-transform duration-300">
                                <div className="bg-cyan-500/20 w-14 h-14 rounded-xl flex items-center justify-center">
                                    <Users className="text-cyan-400 w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-slate-100 text-xl font-bold mb-3">Team Management</h3>
                                    <p className="text-slate-400 leading-relaxed">Effortless coordination for global teams. Automated scheduling, task allocation, and seamless communication.</p>
                                </div>
                            </div>
                            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-transform duration-300">
                                <div className="bg-blue-500/20 w-14 h-14 rounded-xl flex items-center justify-center">
                                    <Shield className="text-blue-400 w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-slate-100 text-xl font-bold mb-3">Secure & Fast</h3>
                                    <p className="text-slate-400 leading-relaxed">Enterprise-grade security with lightning speed. Your data is protected by biometric-level encryption standards.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="py-24">
                        <div className="glass-panel rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                            <div className="orb-purple absolute top-[-50%] right-[-10%] w-[400px] h-[400px]"></div>
                            <div className="relative z-10">
                                <h2 className="text-slate-100 text-4xl md:text-5xl font-black mb-6 max-w-2xl mx-auto font-OFFIFY">Ready to transform your employee management?</h2>
                                <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Join the future of work with OFFIFY's glassmorphic interface. Sign up for a 14-day free trial.</p>
                                <Link to="/login" className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(124,59,237,0.5)] transition-all inline-flex items-center gap-2">
                                    Get Started Now <Rocket className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="border-t border-white/5 py-12 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                <Rocket className="text-primary w-5 h-5" />
                            </div>
                            <h2 className="text-slate-100 text-lg font-extrabold font-OFFIFY tracking-tighter">OFFIFY</h2>
                        </div>
                        <p className="text-slate-500 text-sm">© 2024 OFFIFY Technologies. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-slate-500 hover:text-primary transition-colors" href="#"><Globe className="w-5 h-5" /></a>
                            <a className="text-slate-500 hover:text-primary transition-colors" href="#"><AtSign className="w-5 h-5" /></a>
                            <a className="text-slate-500 hover:text-primary transition-colors" href="#"><MessageCircle className="w-5 h-5" /></a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
