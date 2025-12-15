'use client'

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="flex flex-col sm:flex-row gap-8 w-full max-w-4xl">
        <Link 
          href='/onlineLandingPage' 
          className="flex-1 border-4 border-cyan-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 group"
        >
          <div className="text-center">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🌐</div>
            <h2 className="text-4xl font-bold text-cyan-300 mb-4">Online</h2>
            <p className="text-gray-300 text-lg">Play with friends across the internet</p>
          </div>
        </Link>

        <Link 
          href='/offlineLobby' 
          className="flex-1 border-4 border-purple-400 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-12 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 group"
        >
          <div className="text-center">
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🏠</div>
            <h2 className="text-4xl font-bold text-purple-300 mb-4">Local</h2>
            <p className="text-gray-300 text-lg">Play together on the same device</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
