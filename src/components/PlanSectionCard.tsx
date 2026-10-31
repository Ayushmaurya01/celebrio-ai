import React from 'react';
import { LucideIcon, Check, PlusCircle } from 'lucide-react';
import { AIPlanSection, BudgetCategory } from '../types';

export interface PlanSectionCardProps {
  section: AIPlanSection;
  category: BudgetCategory;
  itemPrefix: string;
  Icon: LucideIcon;
  iconColor: string;
  tipLabel: string;
  tipStyle: {
    background: string;
    border: string;
    color: string;
  };
  adoptedItems: Record<string, boolean>;
  onAdoptItem: (item: string, category: BudgetCategory, itemKey: string) => void;
}

export const PlanSectionCard: React.FC<PlanSectionCardProps> = ({
  section,
  category,
  itemPrefix,
  Icon,
  iconColor,
  tipLabel,
  tipStyle,
  adoptedItems,
  onAdoptItem,
}) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div className="card-header">
        <div className="card-title">
          <Icon size={18} color={iconColor} />
          <span>{section.title}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {section.summary}
      </p>
      <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
        {section.items.map((item, i) => {
          const itemKey = `${itemPrefix}-${i}`;
          const isAdopted = adoptedItems[itemKey];
          return (
            <li
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--bg-surface-subtle)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <span style={{ lineHeight: 1.4 }}>• {item}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => !isAdopted && onAdoptItem(item, category, itemKey)}
                disabled={isAdopted}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.74rem',
                  flexShrink: 0,
                  background: isAdopted ? 'var(--sage-50)' : '#FFF',
                  borderColor: isAdopted ? 'var(--sage-500)' : 'var(--border-medium)',
                  color: isAdopted ? 'var(--sage-700)' : 'var(--text-primary)',
                  cursor: isAdopted ? 'default' : 'pointer',
                }}
                title={isAdopted ? 'Added to Checklist' : 'Add to Vendor Checklist'}
              >
                {isAdopted ? <Check size={12} color="var(--sage-600)" /> : <PlusCircle size={12} />}
                <span>{isAdopted ? 'Added' : 'Add Task'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {section.tips && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: tipStyle.background,
            border: tipStyle.border,
            fontSize: '0.8rem',
            color: tipStyle.color,
          }}
        >
          <strong>{tipLabel}</strong>
          {section.tips.join(' ')}
        </div>
      )}
    </div>
  );
};
