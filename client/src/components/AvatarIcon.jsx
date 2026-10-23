import React from 'react';
import { Sparkles, Smile, Heart, Star, Compass, BookOpen } from './Icons';

const AVATAR_MAP = {
  fox: { emoji: '🦊', label: 'Fox', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  bear: { emoji: '🐻', label: 'Bear', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
  rabbit: { emoji: '🐰', label: 'Rabbit', bg: 'bg-pink-100 text-pink-800 border-pink-300' },
  lion: { emoji: '🦁', label: 'Lion', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  owl: { emoji: '🦉', label: 'Owl', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  cat: { emoji: '🐱', label: 'Cat', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

export const AvatarIcon = ({ avatar = 'fox', size = 'md', className = '' }) => {
  const item = AVATAR_MAP[avatar] || AVATAR_MAP.fox;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold border-2 shadow-sm ${item.bg} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title={item.label}
    >
      <span>{item.emoji}</span>
    </div>
  );
};

export default AvatarIcon;
