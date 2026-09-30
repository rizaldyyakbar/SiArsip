import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { mockAuditLogs } from '../mockData';

interface AuditActivityPanelProps {
  onOpenAuditTrail: () => void;
}

export const AuditActivityPanel: React.FC<AuditActivityPanelProps> = ({
  onOpenAuditTrail
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs lg:col-span-4">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111c2d]">
              Aktivitas Audit Terbaru
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Rekam jejak akses & modifikasi berkas
            </p>
          </div>
          <button
            onClick={onOpenAuditTrail}
            className="rounded-lg p-1.5 text-[#00236f] hover:bg-slate-100 transition-colors"
            title="Lihat semua jejak audit"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline List */}
        <div className="relative mt-5 space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[#dee8ff]">
          {mockAuditLogs.map((log) => {
            return (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className="absolute -left-[19px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white"
                  style={{ backgroundColor: log.accentColor }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#111c2d]">
                      {log.title}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {log.timeAgo}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {log.description}
                  </p>

                  {/* Badges / Meta */}
                  {log.badge && (
                    <div className="mt-2 flex items-center gap-2">
                      {log.badge.type === 'system' ? (
                        <span className="rounded-md bg-[#e8f5e9] px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#004a32]">
                          {log.badge.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#e7eeff] px-2 py-0.5 text-[10px] font-mono text-[#00236f]">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          {log.badge.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          onClick={onOpenAuditTrail}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0f3ff] py-2.5 text-xs font-semibold text-[#00236f] hover:bg-[#dee8ff] transition-all"
        >
          <span>Buka Panel Audit Trail</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
