import React, { useState, useMemo } from 'react';
import { MoreVertical, TrendingUp } from 'lucide-react';
import type { DocumentItem } from '../types';

interface DataVisualizationSectionProps {
  documents?: DocumentItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Tugas Akhir': '#c8102e',
  'Laporan PKL': '#006398',
  'Kurikulum & RPS': '#006c4c',
  'Akreditasi': '#ba1a1a',
  'SK & Surat': '#581c87',
  'Sertifikat & Prestasi': '#0284c7',
  'Lainnya': '#475569'
};

export const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({
  documents = []
}) => {
  const [viewMode, setViewMode] = useState<'bulanan' | 'semester'>('bulanan');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const total = documents.length;

  // Distribusi kategori dihitung dinamis dari documents
  const dynamicCategories = useMemo(() => {
    if (total === 0) return [];
    const counts: Record<string, number> = {};
    documents.forEach((d) => {
      const cat = d.category || 'Lainnya';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[name] || '#64748b'
    }));
  }, [documents, total]);

  // Tren bulanan dihitung dinamis dari tanggal dokumen
  const monthlyTrends = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const currentMonthIdx = now.getMonth();

    const result = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = targetDate.getMonth();
      const mYear = targetDate.getFullYear();
      const shortLabel = monthNames[mIdx];

      const count = documents.filter((d) => {
        const rawDate = d.documentDate || d.uploadDate;
        if (!rawDate) return false;
        const parsed = new Date(rawDate);
        if (isNaN(parsed.getTime())) return false;
        return parsed.getMonth() === mIdx && parsed.getFullYear() === mYear;
      }).length;

      result.push({
        shortLabel,
        value: count,
        isCurrent: mIdx === currentMonthIdx
      });
    }
    return result;
  }, [documents]);

  const maxTrendVal = Math.max(5, ...monthlyTrends.map((t) => t.value));

  // SVG Donut parameters
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
                Komposisi {total} berkas terarsip aktif di repositori
              </p>
            </div>
            <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative my-6 flex items-center justify-center">
            {total === 0 ? (
              <div className="relative flex items-center justify-center h-48 w-48">
                <svg width="180" height="180" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                  />
                </svg>
                <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-2xl font-extrabold text-slate-400 leading-none">
                    0
                  </span>
                  <span className="mt-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                    BERKAS TERSIMPAN
                  </span>
                </div>
              </div>
            ) : (
              <>
                <svg width="200" height="200" viewBox="0 0 160 160" className="transform -rotate-90">
                  {dynamicCategories.map((cat) => {
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
                    {total}
                  </span>
                  <span className="mt-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                    BERKAS FISIK/PDF
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 sm:grid-cols-2 lg:grid-cols-1">
          {dynamicCategories.length === 0 ? (
            <p className="text-center py-4 text-xs text-slate-400">
              Belum ada kategori dokumen.
            </p>
          ) : (
            dynamicCategories.map((cat) => {
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
            })
          )}
        </div>
      </div>

      {/* Visualisasi 2: Tren Unggahan Bulanan (7 Kolom) */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-7">
        <div>
          {/* Header & Toggle */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111c2d]">
                  Tren Unggahan 6 Bulan Terakhir
                </h2>
                <span className="rounded-md bg-[#cce5ff] px-2 py-0.5 text-[10px] font-bold text-[#001d31]">
                  DATA LIVE
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Aktivitas dokumen masuk ke repositori sistem
              </p>
            </div>

            {/* Toggle buttons */}
            <div className="flex rounded-xl bg-[#f0f3ff] p-1 text-xs font-semibold">
              <button
                onClick={() => setViewMode('bulanan')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  viewMode === 'bulanan'
                    ? 'bg-white text-[#c8102e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setViewMode('semester')}
                className={`rounded-lg px-3 py-1 transition-all ${
                  viewMode === 'semester'
                    ? 'bg-white text-[#c8102e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semester
              </button>
            </div>
          </div>

          {/* Highlight Banner */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f0f3ff] p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#c8102e] text-white">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="text-slate-800 font-medium">
                <span className="font-bold text-[#c8102e]">Total Arsip:</span> Terdata {total} berkas aktif dalam sistem.
              </p>
            </div>
            <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-[#c8102e] shadow-2xs">
              Live Database
            </span>
          </div>

          {/* Bar Chart Area */}
          <div className="relative mt-7 h-52">
            {/* Horizontal Grid Guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400">
              {[maxTrendVal, Math.round(maxTrendVal * 0.75), Math.round(maxTrendVal * 0.5), Math.round(maxTrendVal * 0.25), 0].map((val) => (
                <div key={val} className="flex items-center w-full">
                  <span className="w-7 text-right pr-2 shrink-0">{val}</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-x-0 bottom-0 top-3 pl-8 pr-2 flex items-end justify-between gap-2 sm:gap-4">
              {monthlyTrends.map((trend) => {
                const heightPercent = maxTrendVal > 0 ? Math.min(100, Math.round((trend.value / maxTrendVal) * 100)) : 0;
                const isHovered = hoveredBar === trend.shortLabel;

                let barColor = trend.isCurrent
                  ? 'bg-[#c8102e] hover:bg-[#9e1025]'
                  : 'bg-[#93ccff] hover:bg-[#72baff]';

                return (
                  <div
                    key={trend.shortLabel}
                    className="relative flex flex-1 flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(trend.shortLabel)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-7 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-md transition-all z-20 bg-slate-800 text-white">
                        {trend.value} berkas
                      </div>
                    )}

                    {/* Bar Pill */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 min-h-[4px] ${barColor} ${
                        isHovered ? 'ring-2 ring-[#c8102e]' : ''
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />

                    {/* X-axis Label */}
                    <span
                      className={`mt-2 text-[10px] font-medium leading-none ${
                        trend.isCurrent ? 'font-bold text-[#c8102e]' : 'text-slate-400'
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
              <span className="h-2.5 w-2.5 rounded-full bg-[#c8102e]" />
              <span className="text-slate-600">Bulan Berjalan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#93ccff]" />
              <span className="text-slate-600">Bulan Lampau</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">
            Sinkronisasi otomatis dengan PostgreSQL
          </span>
        </div>
      </div>
    </div>
  );
};
