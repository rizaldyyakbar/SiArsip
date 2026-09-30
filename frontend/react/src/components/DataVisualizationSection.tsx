import React, { useState } from 'react';
import { MoreVertical, TrendingUp } from 'lucide-react';
import { mockCategories, mockMonthlyTrends } from '../mockData';

export const DataVisualizationSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'bulanan' | 'semester'>('bulanan');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Calculate SVG Donut parameters
  const total = mockCategories.reduce((sum, c) => sum + c.count, 0);
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Visualisasi 1: Distribusi Kategori Dokumen (5 Kolom) */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-5">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#111c2d]">
                Distribusi Kategori Dokumen
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Komposisi 3.482 berkas terarsip aktif
              </p>
            </div>
            <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative my-6 flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 160 160" className="transform -rotate-90">
              {mockCategories.map((cat) => {
                const strokeDasharray = `${(cat.count / total) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (cat.count / total) * circumference;
                const isSelected = activeCategory === cat.name;

                return (
                  <circle
                    key={cat.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    onMouseEnter={() => setActiveCategory(cat.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-extrabold text-[#111c2d] leading-none">
                3.482
              </span>
              <span className="mt-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                BERKAS FISIK/PDF
              </span>
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-1">
          {mockCategories.map((cat) => {
            const isSelected = activeCategory === cat.name;
            return (
              <div
                key={cat.name}
                onMouseEnter={() => setActiveCategory(cat.name)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center justify-between rounded-xl p-2 text-xs transition-colors cursor-pointer ${
                  isSelected ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-[#111c2d] max-w-[150px]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#111c2d]">
                    {cat.count.toLocaleString('id-ID')}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 w-11 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualisasi 2: Tren Unggahan 12 Bulan Terakhir (7 Kolom) */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-7">
        <div>
          {/* Header & Toggle */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111c2d]">
                  Tren Unggahan 12 Bulan Terakhir
                </h2>
                <span className="rounded-md bg-[#cce5ff] px-2 py-0.5 text-[10px] font-bold text-[#001d31]">
                  LONJAKAN SIDANG
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Intensitas arsip masuk per periode akademik (Okt 2025 - Sep 2026)
              </p>
            </div>

            {/* Toggle buttons */}
            <div className="flex rounded-xl bg-[#f0f3ff] p-1 text-xs font-semibold">
              <button
                onClick={() => setViewMode('bulanan')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  viewMode === 'bulanan'
                    ? 'bg-white text-[#00236f] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setViewMode('semester')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  viewMode === 'semester'
                    ? 'bg-white text-[#00236f] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semester
              </button>
            </div>
          </div>

          {/* Highlight Banner Lonjakan */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f0f3ff] p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1e3a8a] text-white">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="text-slate-800 font-medium">
                <span className="font-bold text-[#00236f]">Puncak Periode Sidang & Yudisium RPL:</span> Terjadi pada Juli (412 berkas) & Agustus (520 berkas).
              </p>
            </div>
            <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#00236f] shadow-2xs">
              Rekor TA 2026
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="relative mt-7 h-52">
            {/* Horizontal Grid Guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400">
              {[500, 375, 250, 125, 0].map((val) => (
                <div key={val} className="flex items-center w-full">
                  <span className="w-7 text-right pr-2 shrink-0">{val}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-0 top-3 pl-8 pr-2 flex items-end justify-between gap-1.5 sm:gap-2">
              {mockMonthlyTrends.map((trend) => {
                const heightPercent = Math.min(100, Math.round((trend.value / 520) * 100));
                const isAugust = trend.shortLabel === 'Agu';
                const isSeptember = trend.shortLabel === 'Sep*';
                const isHovered = hoveredBar === trend.shortLabel;

                let barColor = 'bg-[#93ccff] hover:bg-[#72baff]';
                if (isAugust) barColor = 'bg-[#00236f] hover:bg-[#1e3a8a]';
                else if (isSeptember) barColor = 'bg-[#006398] hover:bg-[#5bb8fe]';

                return (
                  <div
                    key={trend.shortLabel}
                    className="relative flex flex-1 flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(trend.shortLabel)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on hover or special badge for Agu */}
                    {(isAugust || isHovered) && (
                      <div
                        className={`absolute -top-7 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-md transition-all z-20 ${
                          isAugust
                            ? 'bg-[#00236f] text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {trend.value}
                      </div>
                    )}

                    {/* Bar Pill */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${barColor} ${
                        isHovered ? 'ring-2 ring-[#00236f]' : ''
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* X-axis Label */}
                    <span
                      className={`mt-2 text-[10px] font-medium leading-none ${
                        isAugust
                          ? 'font-bold text-[#00236f]'
                          : isSeptember
                          ? 'font-bold text-[#006398]'
                          : 'text-slate-400'
                      }`}
                    >
                      {trend.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00236f]" />
              <span className="text-slate-600">Sidang Puncak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#93ccff]" />
              <span className="text-slate-600">Periode Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#006398]" />
              <span className="text-slate-600">Berjalan Saat Ini</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">
            Pembaruan otomatis per 1 jam
          </span>
        </div>
      </div>
    </div>
  );
};
