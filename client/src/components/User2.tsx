'use client'
import { User } from '@prisma/client'
import React from 'react'

interface Props {
    user : User
}

function User2({user}: Props ) {
  return (
    <div className="relative group max-w-sm overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-md p-6 shadow-2xl transition-all hover:border-cyan-500/50">
      
      {/* Decoratieve hoekjes (Vision UI style) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/20" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500" />

      {/* Header met status indicator */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-500/70">
          Identity_Module
        </span>
        <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-transparent" />
      </div>

      <div className="space-y-4">
        {/* Email / ID */}
        <div>
          <label className="block font-mono text-[9px] uppercase text-white/40">Access_Key</label>
          <h1 className="truncate font-mono text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
            {user.email}
          </h1>
        </div>

        {/* Name / Alias */}
        <div className="relative border-l border-white/10 pl-4">
          <label className="block font-mono text-[9px] uppercase text-white/40">Subject_Name</label>
          <h2 className="text-md font-semibold text-white/90">
            {user.name || "UNKNOWN_ENTITY"}
          </h2>
        </div>

        {/* Created At / Timestamp */}
        <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
          <div className="flex flex-col">
            <label className="font-mono text-[9px] uppercase text-white/40">Registry_Date</label>
            <span className="font-mono text-[11px] text-cyan-500/80">
              {new Date(user.createdAt).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>          
        </div>
      </div>
    </div>
  )
}

export default User2