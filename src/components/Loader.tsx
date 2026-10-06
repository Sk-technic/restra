'use client';

import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  text?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text,
  subtitle,
  className = '',
  compact = false,
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-xl',
      icon: 'w-4 h-4',
      text: 'text-xs',
      ripple: 'w-8 h-8 rounded-xl',
    },
    md: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      text: 'text-sm',
      ripple: 'w-12 h-12 rounded-2xl',
    },
    lg: {
      box: 'w-16 h-16 rounded-3xl',
      icon: 'w-8 h-8',
      text: 'text-base',
      ripple: 'w-16 h-16 rounded-3xl',
    },
    full: {
      box: 'w-20 h-20 rounded-3xl',
      icon: 'w-10 h-10',
      text: 'text-lg',
      ripple: 'w-20 h-20 rounded-3xl',
    },
  }[size];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-500/30 rounded-xl animate-ping" />
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-primary-600/30 relative z-10 animate-restra-float">
            <UtensilsCrossed className="w-3.5 h-3.5 animate-restra-utensils" />
          </div>
        </div>
        {text && <span className="text-xs font-bold text-slate-400 dark:text-slate-300">{text}</span>}
      </div>
    );
  }

  const isFull = size === 'full';

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        isFull ? 'min-h-[50vh] py-16' : size === 'lg' ? 'py-14' : size === 'md' ? 'py-10' : 'py-6'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Concentric Ambient Ripples */}
        <div className={`absolute ${sizeMap.ripple} bg-primary-500/20 animate-restra-ripple pointer-events-none`} />
        <div className={`absolute ${sizeMap.ripple} bg-amber-500/15 animate-restra-ripple pointer-events-none [animation-delay:0.8s]`} />

        {/* Brand Squircle Box with Floating Motion */}
        <div
          className={`${sizeMap.box} bg-gradient-to-tr from-primary-600 via-primary-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-primary-600/35 border border-amber-300/30 relative z-10 animate-restra-float`}
        >
          {/* Animated Tilting Utensils Icon */}
          <UtensilsCrossed className={`${sizeMap.icon} animate-restra-utensils drop-shadow-md`} />

          {/* Glossy Top Sheen */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Loading Text & Animated Dots */}
      {(text || isFull) && (
        <div className="mt-4 text-center space-y-1">
          <div className={`font-black text-slate-800 dark:text-white tracking-tight ${sizeMap.text} flex items-center justify-center gap-1.5`}>
            <span>{text || 'Restra Suite'}</span>
            <span className="inline-flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" />
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Loader;
