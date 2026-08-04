'use client';

import React from 'react';

interface MemoizedCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MemoizedCard = React.memo(({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  trend 
}: MemoizedCardProps) => {
  return (
    <div className={`bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden`}>
      <div className={`absolute top-2 right-2 text-${color}-500 opacity-20`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
        {title}
      </span>
      <div className="text-2xl font-black text-white mt-1">{value}</div>
      {subtitle && (
        <p className="text-[10px] text-slate-400 mt-2">{subtitle}</p>
      )}
      {trend && (
        <p className={`text-[10px] mt-2 flex items-center gap-1 ${
          trend.isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          <span className="font-bold">{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-slate-500">vs previous period</span>
        </p>
      )}
    </div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

export default MemoizedCard;