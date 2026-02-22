'use client'
import React, { useState, useEffect } from 'react';
import InputZoekGebruiker from "@/components/ZoekUser";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Zorg dat de component pas rendert op de client om Hydration errors te voorkomen
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Een lege zwarte pagina tijdens het laden om geflikker te voorkomen
    return <main className="min-h-screen w-full bg-[#020617]" />;
  }

  return (
    <main className="relative min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* 1. Achtergrond Matrix/Grid Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
      </div>

      {/* 2. HUD Decoratie - Bovenhoeken */}
      <div className="pointer-events-none absolute top-10 left-10 right-10 flex justify-between font-mono text-[10px] text-cyan-500/40 tracking-[0.2em] uppercase hidden md:flex">
        <div className="flex flex-col gap-1 border-l border-cyan-500/30 pl-3">
          <span>System_Status: <span className="text-cyan-400">Optimal</span></span>
          <span>Neural_Link: <span className="text-cyan-400">Established</span></span>
        </div>
        <div className="text-right flex flex-col gap-1 border-r border-cyan-500/30 pr-3">
          <span>Sector: 7-G</span>
          <span>Encryption: AES-256</span>
        </div>
      </div>

      {/* 3. Central Console Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Logo / Title Area */}
        <div className="mb-12 text-center space-y-2">
          <div className="inline-block relative">
             <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
               Vision<span className="text-cyan-500">Scan</span>
             </h1>
             <div className="absolute -inset-1 bg-cyan-500/20 blur-xl -z-10 animate-pulse" />
          </div>
          <p className="font-mono text-[10px] md:text-xs text-cyan-400/60 tracking-[0.3em] uppercase">
            Deep_Learning_Entity_Recognition_System
          </p>
        </div>

        {/* De Zoekcomponent */}
        <div className="w-full flex justify-center relative group mb-16">
          <div className="absolute -left-8 top-0 bottom-0 w-4 border-l-2 border-t-2 border-b-2 border-cyan-500/30 group-focus-within:border-cyan-500 transition-all duration-500 hidden sm:block" />
          
          <div className="w-full relative">
             <InputZoekGebruiker />
          </div>

          <div className="absolute -right-8 top-0 bottom-0 w-4 border-r-2 border-t-2 border-b-2 border-cyan-500/30 group-focus-within:border-cyan-500 transition-all duration-500 hidden sm:block" />
        </div>

        {/* 4. Action Selection - De Knoppen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-12">
          
          <Link href="/yolo" className="group relative px-6 py-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg overflow-hidden transition-all hover:bg-cyan-500/10 hover:border-cyan-500/50 text-center">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
            <span className="font-mono text-xs text-cyan-500 uppercase tracking-widest block mb-1 opacity-70">Detection Mode</span>
            <span className="text-white font-bold tracking-tight uppercase group-hover:text-cyan-400 transition-colors">Gebruik YOLO v8</span>
            <div className="mt-2 h-[1px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-500 mx-auto" />
          </Link>

          <Link href="/vision" className="group relative px-6 py-4 bg-purple-500/5 border border-purple-500/20 rounded-lg overflow-hidden transition-all hover:bg-purple-500/10 hover:border-purple-500/50 text-center">
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-400" />
            <span className="font-mono text-xs text-purple-500 uppercase tracking-widest block mb-1 opacity-70">Interface Mode</span>
            <span className="text-white font-bold tracking-tight uppercase group-hover:text-purple-400 transition-colors">Computer Vision</span>
            <div className="mt-2 h-[1px] w-0 bg-purple-500 group-hover:w-full transition-all duration-500 mx-auto" />
          </Link>

        </div>

        {/* 5. Bottom Terminal Data Stream */}
        <div className="w-full max-w-md border-t border-white/5 pt-4 opacity-40">
          <div className="flex justify-between font-mono text-[9px] text-cyan-500/70 uppercase">
            <span className="animate-pulse">{'>>'} Analyzing_Network_Packets...</span>
            <span>v4.0.2_stable</span>
          </div>
          <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] w-1/3 animate-loading-bar" />
          </div>
        </div>
      </div>

      {/* Custom CSS voor de animatie zonder Styled JSX te gebruiken (voorkomt class mismatch) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar {
          animation: loading-slide 2s infinite linear;
        }
      `}} />

      {/* Optical Flairs */}
      <div className="absolute bottom-10 left-10 w-32 h-32 border-l border-b border-cyan-500/10 rounded-bl-3xl hidden lg:block" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
    </main>
  );
}