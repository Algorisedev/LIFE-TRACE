import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EventIndex } from '../../utils/indexing/eventIndex';
import { SourceType } from '../../data/types/event';
import { Activity, Info } from 'lucide-react';

interface ActivityHeatmapCanvasProps {
  index: EventIndex;
  onSelectPeriod?: (monthKey: string) => void;
}

export const ActivityHeatmapCanvas: React.FC<ActivityHeatmapCanvasProps> = ({
  index,
  onSelectPeriod,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSource, setSelectedSource] = useState<'all' | SourceType>('all');
  const [hoveredCell, setHoveredCell] = useState<{ monthKey: string; count: number; x: number; y: number } | null>(null);

  // Get chronological months available in dataset (e.g. 2013-07 to 2024-12)
  const availableMonths = useMemo(() => index.getAvailableMonths(), [index]);

  // Pre-calculate monthly counts grouped by source
  const monthlyData = useMemo(() => {
    const data: Array<{ monthKey: string; spotifyCount: number; householdCount: number; txCount: number; totalCount: number }> = [];

    for (const m of availableMonths) {
      const monthEvents = index.queryByMonth(m);
      let spot = 0;
      let hh = 0;
      let tx = 0;

      for (const ev of monthEvents) {
        if (ev.source === 'spotify') spot++;
        else if (ev.source === 'household') hh++;
        else if (ev.source === 'transactions') tx++;
      }

      data.push({
        monthKey: m,
        spotifyCount: spot,
        householdCount: hh,
        txCount: tx,
        totalCount: monthEvents.length,
      });
    }

    return data;
  }, [index, availableMonths]);

  // Draw Heatmap Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, width, height);

    if (monthlyData.length === 0) return;

    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const numCols = monthlyData.length;
    const colWidth = chartWidth / numCols;

    // Find max value for normalization
    let maxVal = 1;
    for (const d of monthlyData) {
      const val =
        selectedSource === 'all'
          ? d.totalCount
          : selectedSource === 'spotify'
          ? d.spotifyCount
          : selectedSource === 'household'
          ? d.householdCount
          : d.txCount;

      if (val > maxVal) maxVal = val;
    }

    // Draw monthly bars / density heatmap
    for (let i = 0; i < numCols; i++) {
      const d = monthlyData[i];
      const count =
        selectedSource === 'all'
          ? d.totalCount
          : selectedSource === 'spotify'
          ? d.spotifyCount
          : selectedSource === 'household'
          ? d.householdCount
          : d.txCount;

      if (count === 0) continue;

      const normHeight = (count / maxVal) * chartHeight;
      const x = paddingLeft + i * colWidth;
      const y = height - paddingBottom - normHeight;

      // Color coding based on source composition
      if (selectedSource === 'spotify') {
        ctx.fillStyle = 'rgba(29, 185, 84, 0.8)';
      } else if (selectedSource === 'household') {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      } else if (selectedSource === 'transactions') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      } else {
        // Gradient color based on primary contributor
        if (d.spotifyCount > d.householdCount && d.spotifyCount > d.txCount) {
          ctx.fillStyle = 'rgba(29, 185, 84, 0.75)';
        } else if (d.householdCount > d.txCount) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
        } else {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
        }
      }

      ctx.fillRect(x, y, Math.max(1, colWidth - 1), normHeight);
    }

    // Draw X-axis year labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px monospace';

    let lastYear = '';
    for (let i = 0; i < numCols; i++) {
      const year = monthlyData[i].monthKey.substring(0, 4);
      if (year !== lastYear && i % 6 === 0) {
        const x = paddingLeft + i * colWidth;
        ctx.fillText(year, x, height - 10);
        lastYear = year;
      }
    }
  }, [monthlyData, selectedSource]);

  // Handle Mouse Hover / Click over canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    const paddingLeft = 40;
    const paddingRight = 20;
    const chartWidth = canvas.width - paddingLeft - paddingRight;
    const numCols = monthlyData.length;
    const colWidth = chartWidth / numCols;

    const colIndex = Math.floor((x - paddingLeft) / colWidth);

    if (colIndex >= 0 && colIndex < numCols) {
      const d = monthlyData[colIndex];
      const count =
        selectedSource === 'all'
          ? d.totalCount
          : selectedSource === 'spotify'
          ? d.spotifyCount
          : selectedSource === 'household'
          ? d.householdCount
          : d.txCount;

      setHoveredCell({
        monthKey: d.monthKey,
        count,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleClick = () => {
    if (hoveredCell && onSelectPeriod) {
      onSelectPeriod(hoveredCell.monthKey);
    }
  };

  return (
    <div className="bg-[#0c0d15] border border-gray-800 rounded-2xl p-6 space-y-6 shadow-xl font-mono">
      {/* Controls & Source Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-lg font-bold text-white font-sans">LIFETIME ACTIVITY DENSITY CANVAS</h3>
            <p className="text-xs text-gray-400">162,588 events aggregated into monthly telemetry buckets</p>
          </div>
        </div>

        {/* Source selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">LAYER:</span>
          <div className="flex bg-black/50 p-1 rounded-lg border border-gray-800 space-x-1">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedSource === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedSource('spotify')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedSource === 'spotify' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              SPOTIFY
            </button>
            <button
              onClick={() => setSelectedSource('household')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedSource === 'household' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              HOUSEHOLD
            </button>
            <button
              onClick={() => setSelectedSource('transactions')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedSource === 'transactions' ? 'bg-amber-600 text-white font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              TRANSACTIONS
            </button>
          </div>
        </div>
      </div>

      {/* HTML5 Canvas Container */}
      <div className="relative bg-[#07070a] rounded-xl border border-gray-800 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1000}
          height={260}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          onClick={handleClick}
          className="w-full h-64 cursor-pointer"
        />

        {/* Tooltip Overlay */}
        {hoveredCell && (
          <div
            style={{ left: `${hoveredCell.x + 10}px`, top: `${hoveredCell.y - 40}px` }}
            className="absolute pointer-events-none bg-black/90 border border-gray-700 px-3 py-1.5 rounded text-xs text-white shadow-xl z-20"
          >
            <div className="font-bold text-blue-400">{hoveredCell.monthKey}</div>
            <div className="text-[11px] text-gray-300">{hoveredCell.count.toLocaleString()} Recorded Events</div>
            <div className="text-[9px] text-gray-500">Click to filter in Explore view</div>
          </div>
        )}
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-1">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>Spotify Streams</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>Household Receipts</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
            <span>Multi-Facet Txs</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Click any month column to inspect that timeframe in Explore view</span>
        </div>
      </div>
    </div>
  );
};
