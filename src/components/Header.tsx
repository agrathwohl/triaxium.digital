'use client';

import { Search, Menu, BookOpen, GitBranch, Network, Edit3 } from 'lucide-react';
import { ViewMode } from '@/types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ 
  viewMode, 
  setViewMode, 
  searchQuery, 
  setSearchQuery 
}: HeaderProps) {
  return (
    <header className="bg-braxton-dark text-white border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center font-bold text-lg">
            TAW
          </div>
          <div>
            <h1 className="font-bold text-xl">Tri-Axium Digital</h1>
            <p className="text-xs text-gray-400">The Braxtonian Knowledge System</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search terms, schematics, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              viewMode === 'tree' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Tree
          </button>
          <button
            onClick={() => setViewMode('network')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              viewMode === 'network' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            Network
          </button>
          <button
            onClick={() => setViewMode('workspace')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              viewMode === 'workspace' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Workspace
          </button>
        </div>
      </div>
    </header>
  );
}
