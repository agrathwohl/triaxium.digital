'use client';

import { Schematic } from '@/types';
import { getVolumeColor } from '@/lib/utils';
import { BookOpen, ArrowRight } from 'lucide-react';

interface SchematicCardProps {
  schematic: Schematic;
  isSelected: boolean;
  onClick: () => void;
}

export default function SchematicCard({ 
  schematic, 
  isSelected, 
  onClick 
}: SchematicCardProps) {
  const volumeColor = getVolumeColor(schematic.volume);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-900/30 border-blue-500'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white text-sm">
          {schematic.title}
        </h4>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: volumeColor }}
        />
      </div>
      
      {schematic.description && (
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
          {schematic.description}
        </p>
      )}
      
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Vol {schematic.volume}
        </span>
        <span>{schematic.section}</span>
        <span>p.{schematic.page}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
          {schematic.subject}
        </span>
        {schematic.terms.length > 1 && (
          <span className="text-xs text-gray-500">
            +{schematic.terms.length - 1} terms
          </span>
        )}
      </div>
    </div>
  );
}
