import React from 'react';

export interface MetricCardProps {
  label: string;
  badge?: React.ReactNode;
  value: React.ReactNode;
  subtext: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  title?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  badge,
  value,
  subtext,
  footer,
  onClick,
  title,
}) => {
  return (
    <div
      className="glass-card"
      style={{ padding: '1.25rem 1.4rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={title}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        {badge}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        {subtext}
      </div>
      {footer}
    </div>
  );
};
