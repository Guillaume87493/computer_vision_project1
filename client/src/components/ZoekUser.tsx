'use client'
import React, { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Search, User as UserIcon, Loader2 } from 'lucide-react'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { searchUsersByLetter } from '@/actions/userActions'

function InputZoekGebruiker() {
    const [searchText, setSearchText] = useState("")
    const [results, setResults] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const route = useRouter()

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchText.length > 0) {
                setIsSearching(true)
                const data = await searchUsersByLetter(searchText)
                setResults(data)
                setIsSearching(false)
            } else {
                setResults([])
            }
        }, 300) // Debounce om de database te sparen

        return () => clearTimeout(delayDebounceFn)
    }, [searchText])

    return (
        <div className="w-full max-w-md font-mono">
            <div className="relative group">
                {/* AI Scanner Icon */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {isSearching ? (
                        <Loader2 size={18} className="text-cyan-500 animate-spin" />
                    ) : (
                        <UserIcon size={18} className="text-white/40 group-focus-within:text-cyan-500 transition-colors" />
                    )}
                </div>

                <div className="flex gap-2">
                    <Input 
                        type='text' 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder='INITIATE_USER_SCAN...' 
                        className="pl-12 h-12 rounded-none border-white/10 bg-black/40 text-white backdrop-blur-md focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all uppercase text-[10px] tracking-widest"
                    />
                </div>
            </div>

            {/* AI Results Overlay */}
            {searchText && (
                <div className="mt-2 border border-white/10 bg-black/80 backdrop-blur-xl rounded-none p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <div className="px-3 py-1 border-b border-white/5 mb-1">
                        <span className="text-[8px] text-cyan-500/50 uppercase tracking-tighter">Matches_Found: {results.length}</span>
                    </div>
                    
                    {results.length > 0 ? (
                        results.map((user) => (
                            <div 
                                key={user.id} 
                                className="flex justify-between items-center p-3 hover:bg-cyan-500/10 transition-all group cursor-pointer border border-transparent hover:border-cyan-500/30"
                                onClick={() => route.push(`/user?userId=${user.id}`)}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{user.name}</span>
                                    <span className="text-[9px] text-white/40">UUID: {user.id.slice(0,18)}...</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <span className="text-[9px] text-cyan-400 font-bold border border-cyan-400/50 px-2 py-0.5">OPEN_PROFILE</span>
                                </div>
                            </div>
                        ))
                    ) : !isSearching && (
                        <p className="text-[10px] text-red-500/70 p-3 italic uppercase tracking-widest animate-pulse">No_Entities_Detected</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default InputZoekGebruiker