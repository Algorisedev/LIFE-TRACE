import React from 'react';
import { ListeningMetrics } from '../../data/types/insight';
import { Music, Smartphone, FastForward, PlayCircle } from 'lucide-react';

interface MusicInsightSectionProps {
  listening: ListeningMetrics;
}

export const MusicInsightSection: React.FC<MusicInsightSectionProps> = ({ listening }) => {
  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
        <Music className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-white font-sans">MUSIC STREAMING METRICS</h3>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>TOTAL PLAYTIME</span>
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{listening.totalHoursPlayed} hrs</div>
          <div className="text-[10px] text-gray-500">{listening.totalStreams.toLocaleString()} Streams</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>SKIP RATE</span>
            <FastForward className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-xl font-bold text-yellow-400 mt-1">{listening.skipRate}%</div>
          <div className="text-[10px] text-gray-500">{listening.skipCount.toLocaleString()} Skipped Tracks</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase">UNIQUE ARTISTS</div>
          <div className="text-xl font-bold text-white mt-1">{listening.topArtists.length}+</div>
          <div className="text-[10px] text-gray-500">Tracked in Dataset</div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/80">
          <div className="text-[10px] text-gray-400 uppercase flex items-center justify-between">
            <span>CLIENT PLATFORMS</span>
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-400 mt-1">
            {Object.keys(listening.platformBreakdown).length} Platforms
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            Top: {Object.keys(listening.platformBreakdown)[0] || 'Web'}
          </div>
        </div>
      </div>

      {/* Top Artists & Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Top 5 Artists */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top 5 Artists by Duration</h4>
          <div className="space-y-2">
            {listening.topArtists.slice(0, 5).map((a, i) => {
              const hrs = (a.durationMs / (3600 * 1000)).toFixed(1);
              return (
                <div key={i} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/60 text-xs">
                  <span className="truncate pr-2 text-gray-200">
                    <strong className="text-emerald-400 mr-2">#{i + 1}</strong>
                    {a.artist}
                  </span>
                  <span className="text-gray-400 shrink-0">{hrs} hrs ({a.count} streams)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Tracks */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top 5 Played Tracks</h4>
          <div className="space-y-2">
            {listening.topTracks.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/60 text-xs">
                <span className="truncate pr-2 text-gray-200">
                  <strong className="text-blue-400 mr-2">#{i + 1}</strong>
                  {t.track} <span className="text-gray-500">by {t.artist}</span>
                </span>
                <span className="text-gray-400 shrink-0">{t.count} plays</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
