"use client";

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const typeConfig = {
          success: {
            bg: 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50',
            icon: CheckCircle2,
            iconColor: 'text-emerald-400'
          },
          warning: {
            bg: 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50',
            icon: AlertTriangle,
            iconColor: 'text-amber-400'
          },
          error: {
            bg: 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50',
            icon: AlertCircle,
            iconColor: 'text-rose-400'
          },
          info: {
            bg: 'bg-slate-900/95 text-slate-200 border-slate-700/80 shadow-black/40',
            icon: Info,
            iconColor: 'text-orange-400'
          }
        };

        const config = typeConfig[toast.type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md animate-fadeIn transition-all ${config.bg}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-bold leading-tight mb-0.5 text-white">
                  {toast.title}
                </div>
              )}
              <div className="text-xs leading-relaxed opacity-95">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
              aria-label="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}