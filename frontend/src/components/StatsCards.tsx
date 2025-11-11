'use client';

import React from 'react';
import { TrendingUp, Send, Wallet, Activity } from 'lucide-react';

export default function StatsCards() {
  const stats = [
    {
      label: 'Total Sent',
      icon: <Send className="w-8 h-8" />,
      color: 'blue',
    },
    {
      label: 'Payments',
      icon: <Activity className="w-8 h-8" />,
      color: 'green',
    },
    {
      label: 'Fees Saved',
      icon: <Wallet className="w-8 h-8" />,
      color: 'purple',
    },
    {
      label: 'Average Speed',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className={`card border ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
          <div className={`inline-flex p-3 rounded-lg mb-4 ${stat.color === 'blue' ? 'bg-blue-100' : stat.color === 'green' ? 'bg-green-100' : stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'}`}>
            <div className={stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'}>
              {stat.icon}
            </div>
          </div>
          <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-neutral-900 mb-2">-</p>
          <p className="text-xs text-neutral-500">No data yet</p>
        </div>
      ))}
    </div>
  );
}
