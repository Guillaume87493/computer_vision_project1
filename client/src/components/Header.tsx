import { logoutAction } from '@/actions/userActions'
import { getUser } from '@/supabase/server'
import React from 'react'
import Link from 'next/link'

async function Header() {
  const user = await getUser()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* AI / Vision Logo Placeholder */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 border-2 border-cyan-500 rounded-sm flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/20 animate-pulse" />
            <div className="w-1 h-full bg-cyan-500/40 absolute left-1/2 -translate-x-1/2 animate-[scan_2s_linear_infinite]" />
            <span className="text-[10px] font-mono text-cyan-400 font-bold z-10">CV</span>
          </div>
          <span className="text-white font-mono tracking-tighter text-sm uppercase hidden sm:block">
            <Link href={'/'}>
            Vision<span className="text-cyan-500">_Core</span>
            </Link>
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">Authorized</span>
              </div>

              <form action={logoutAction}>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-mono font-bold text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-md transition-all duration-300 hover:bg-red-500/5"
                >
                  TERMINATE_SESSION
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="px-4 py-1.5 text-xs font-mono font-bold text-white/80 hover:text-white transition-colors">
                  IDENTIFY
                </button>
              </Link>
              
              <Link href="/signup">
                <button className="px-4 py-1.5 text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                  NEW_USER
                </button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header