import React from 'react';
import type { ErrorLevel } from '../types';
import { ERROR_LEVEL_LABELS } from '../hooks/useErrorAnalysis';

const BADGE_CLASSES: Record<ErrorLevel, string> = {
  perceptual: 'badge-error-perceptual',
  tool: 'badge-error-tool',
  abstraction: 'badge-error-abstraction',
  transmission: 'badge-error-transmission',
  cognitive: 'badge-error-cognitive',
};

interface ErrorBadgeProps {
  level: ErrorLevel;
  magnitude?: 'low' | 'medium' | 'high';
  showLabel?: boolean;
}

export function ErrorBadge({ level, magnitude, showLabel = true }: ErrorBadgeProps) {
  return (
    <span className={BADGE_CLASSES[level]}>
      {showLabel && ERROR_LEVEL_LABELS[level]}
      {magnitude && (
        <span className="ml-1 opacity-70">
          ({magnitude === 'low' ? '低' : magnitude === 'medium' ? '中' : '高'})
        </span>
      )}
    </span>
  );
}

interface ErrorLevelIconProps {
  level: ErrorLevel;
  size?: number;
}

export function ErrorLevelIcon({ level, size = 16 }: ErrorLevelIconProps) {
  const colors: Record<ErrorLevel, string> = {
    perceptual: '#f59e0b',
    tool: '#ef4444',
    abstraction: '#8b5cf6',
    transmission: '#06b6d4',
    cognitive: '#ec4899',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill={colors[level]} opacity={0.2} />
      <circle cx="8" cy="8" r="3" fill={colors[level]} />
    </svg>
  );
}
