import React, { useState } from 'react';
import { Compass, Sparkles, Network, PieChart, Activity, Search, Menu, X } from 'lucide-react';

export type TabType = 'story' | 'explore' | 'connect' | 'insights' | 'visualization';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSearch?: () => void;
  totalEventsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  totalEventsCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
    { id: 'story', label: 'STORY', icon: Sparkles },
    { id: 'explore', label: 'EXPLORE', icon: Compass },
    { id: 'connect', label: 'CONNECT', icon: Network },
    { id: 'insights', label: 'INSIGHTS', icon: PieChart },
    { id: 'visualization', label: 'VISUALIZATION', icon: Activity },
  ];

  const handleTabClick = (id: TabType) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07070a]/90 backdrop-blur-md border-b border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('story')}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-400 p-[1px]">
              <div className="w-full h-full bg-[#07070a] rounded flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                LT
              </div>
            </div>
            <div>
              <div className="font-mono text-sm tracking-widest font-bold text-gray-100 flex items-center space-x-2">
                <span>LIFE TRACE</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-normal">
                  v2.0
                </span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono tracking-tight hidden sm:block">
                Unified Personal Data Archive
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Persistent Search & Stats Badge */}
          <div className="flex items-center space-x-3">
            {totalEventsCount !== undefined && (
              <div className="hidden lg:flex items-center space-x-1.5 text-[11px] font-mono text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded border border-gray-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{totalEventsCount.toLocaleString()} EVENTS</span>
              </div>
            )}

            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else onSelectTab('explore');
              }}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono text-gray-400 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-md transition-all"
              aria-label="Search dataset"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">SEARCH</span>
              <kbd className="hidden sm:inline-block text-[10px] text-gray-500 bg-gray-800 px-1 py-0.5 rounded">⌘K</kbd>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-gray-800 bg-[#0c0d14] px-4 pt-2 pb-4 space-y-1 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-gray-400 hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
