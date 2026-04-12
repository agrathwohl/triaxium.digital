'use client';

import { termFamilies } from '@/data/schematics';
import { Filter, BookOpen, Info, Layers } from 'lucide-react';

interface SidebarProps {
  selectedFamilies: string[];
  toggleFamily: (family: string) => void;
}

export default function Sidebar({ selectedFamilies, toggleFamily }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 text-gray-300 overflow-y-auto">
      <div className="p-4">
        {/* Filter Section */}
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <Filter className="w-4 h-4" />
            Term Families
          </h3>
          <div className="space-y-2">
            {termFamilies.map((family) => (
              <button
                key={family.id}
                onClick={() => toggleFamily(family.id)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedFamilies.includes(family.id)
                    ? 'bg-gray-800 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: family.color }}
                />
                {family.label}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Filter */}
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <BookOpen className="w-4 h-4" />
            Volumes
          </h3>
          <div className="space-y-2">
            {[
              { id: 1, label: 'Volume 1: Foundations', color: '#3b82f6' },
              { id: 2, label: 'Volume 2: Critique', color: '#ef4444' },
              { id: 3, label: 'Volume 3: Synthesis', color: '#eab308' },
            ].map((vol) => (
              <button
                key={vol.id}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: vol.color }}
                />
                {vol.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-800 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
            <Info className="w-4 h-4" />
            Database
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Terms</span>
              <span className="text-white font-mono">200+</span>
            </div>
            <div className="flex justify-between">
              <span>Schematics</span>
              <span className="text-white font-mono">106+</span>
            </div>
            <div className="flex justify-between">
              <span>Volumes</span>
              <span className="text-white font-mono">3</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
