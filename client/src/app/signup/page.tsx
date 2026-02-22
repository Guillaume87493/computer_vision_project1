import AuthForm from '@/components/Authform'
import React from 'react'

function page() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Achtergrond decoratie (gekleurde bollen voor het blur effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      
      {/* Container voor het formulier met een subtiele animatie */}
      <div className="relative z-10 w-full px-4 animate-in fade-in zoom-in duration-500">
        <AuthForm type='signup' />
      </div>
    </main>
  )
}

export default page