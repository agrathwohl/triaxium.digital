import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getVolumeColor(volume: number): string {
  switch (volume) {
    case 1:
      return '#3b82f6'; // Blue
    case 2:
      return '#ef4444'; // Red
    case 3:
      return '#eab308'; // Gold
    default:
      return '#6b7280';
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    affinity: '#ef4444',
    information: '#3b82f6',
    vibrational: '#8b5cf6',
    reality: '#10b981',
    composite: '#f59e0b',
    transformation: '#ec4899',
    isolated: '#6b7280',
    meta: '#06b6d4',
    other: '#71717a',
  };
  return colors[category] || '#71717a';
}
