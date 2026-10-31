import React from 'react';
import { BudgetCategory } from '../types';
import { BUDGET_CATEGORY_METADATA } from '../services/budgetService';

export interface CategorySelectProps {
  id?: string;
  value: BudgetCategory | 'all';
  onChange: (value: BudgetCategory | 'all') => void;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  id,
  value,
  onChange,
  includeAllOption = false,
  allOptionLabel = 'All Categories',
  className = 'form-select',
  style,
  'aria-label': ariaLabel,
}) => {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as BudgetCategory | 'all')}
      style={style}
      aria-label={ariaLabel}
    >
      {includeAllOption && <option value="all">{allOptionLabel}</option>}
      {Object.entries(BUDGET_CATEGORY_METADATA).map(([catKey, meta]) => (
        <option key={catKey} value={catKey}>
          {meta.label}
        </option>
      ))}
    </select>
  );
};
