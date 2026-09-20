import React from 'react';
import { SourceType } from '../../data/types/event';
import { Music, Home, CreditCard } from 'lucide-react';

interface SourceTagProps {
  source: SourceType;
  size?: 'sm' | 'md';
}

export const SourceTag: React.FC<SourceTagProps> = ({ source, size = 'sm' }) => {
  const configs = {
    spotify: {
      label: 'SPOTIFY',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      icon: Music,
    },
    household: {
      label: 'HOUSEHOLD',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      icon: Home,
    },
    transactions: {
      label: 'TRANSACTIONS',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      icon: CreditCard,
    },
  };

  const cfg = configs[source];
  const Icon = cfg.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 space-x-1' 
    : 'text-xs px-2.5 py-1 space-x-1.5';

  return (
    <span
      className={`inline-flex items-center font-mono tracking-wider font-medium uppercase rounded border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{cfg.label}</span>
    </span>
  );
};
