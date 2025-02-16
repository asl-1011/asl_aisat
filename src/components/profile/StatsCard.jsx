import React from 'react';

export function StatsCard({ icon: Icon, iconColor, label, value, subtitle }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <Icon className={iconColor} size={20} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-700">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}
