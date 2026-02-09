// LUMINEX Next.js - Stat Card Component
// Dashboard istatistik kartları

'use client';

import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, color = 'blue', href, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    orange: 'stat-card-orange',
    purple: 'stat-card-purple',
    red: 'stat-card-red',
  };

  const content = (
    <>
      <div className={`stat-card ${colorClasses[color]}`}>
        <div className="stat-card-icon">{icon}</div>
        <div className="stat-card-content">
          <h3 className="stat-card-title">{title}</h3>
          <p className="stat-card-value">{value}</p>
          {trend && (
            <div className={`stat-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
