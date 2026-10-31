import { useState } from 'react';
import { BudgetCategory, BudgetSummary } from '../types';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface BudgetAnalyticsProps {
  summary: BudgetSummary;
  selectedCategory?: BudgetCategory | 'all';
  onSelectCategory?: (category: BudgetCategory | 'all') => void;
  compact?: boolean;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({
  summary,
  selectedCategory = 'all',
  onSelectCategory,
  compact = false,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<BudgetCategory | null>(null);

  const categories = Object.values(summary.categories);
  const activeSpendCategories = categories.filter((c) => c.totalEstimated > 0 || c.allocatedAmount > 0);
  
  // Calculate Donut Segments
  const totalForDonut = summary.totalEstimated > 0 ? summary.totalEstimated : summary.totalBudget;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;
  const donutSlices = activeSpendCategories.map((cat) => {
    const value = summary.totalEstimated > 0 ? cat.totalEstimated : cat.allocatedAmount;
    const percent = totalForDonut > 0 ? (value / totalForDonut) : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    return {
      category: cat.category,
      label: cat.label,
      color: cat.color,
      value,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeHoveredData = hoveredCategory ? summary.categories[hoveredCategory] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Visual Analytics Grid: Donut Chart on Left, Estimated vs Actual on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Panel A: Allocation Donut Chart */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChartIcon size={18} color="var(--primary-500)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
                {summary.totalEstimated > 0 ? 'Estimated Spending Share' : 'Target Budget Allocation'}
              </h3>
            </div>
            <span className="badge badge-estimate" style={{ fontSize: '0.7rem' }}>
              {summary.totalEstimated > 0 ? 'By Estimates' : 'By Target'}
            </span>
          </div>

          {/* SVG Donut Visualizer */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: '210px', height: '210px', flexShrink: 0 }}>
              <svg 
                viewBox="0 0 220 220" 
                style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                role="img"
                aria-label="Budget allocation donut chart"
              >
                {/* Background track */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="transparent"
                  stroke="var(--bg-surface-subtle)"
                  strokeWidth="24"
                />

                {donutSlices.map((slice) => {
                  const isHovered = hoveredCategory === slice.category;
                  const isSelected = selectedCategory === slice.category;
                  return (
                    <circle
                      key={slice.category}
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered || isSelected ? 30 : 24}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                        opacity: hoveredCategory && !isHovered ? 0.6 : 1,
                      }}
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => onSelectCategory && onSelectCategory(slice.category)}
                    />
                  );
                })}
              </svg>

              {/* Donut Center Display */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  padding: '10px',
                }}
              >
                {activeHoveredData ? (
                  <>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {activeHoveredData.label.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: activeHoveredData.color, lineHeight: 1.1 }}>
                      ${activeHoveredData.totalEstimated.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Target: ${activeHoveredData.allocatedAmount.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Total Budget
                    </span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15 }}>
                      ${summary.totalBudget.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: summary.isOverBudget ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
                      {summary.percentageUsed}% Allocated
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Accessible Legend */}
            <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {activeSpendCategories.slice(0, 6).map((cat) => {
                const isHovered = hoveredCategory === cat.category;
                const isSelected = selectedCategory === cat.category;
                const pct = totalForDonut > 0 
                  ? Math.round(((summary.totalEstimated > 0 ? cat.totalEstimated : cat.allocatedAmount) / totalForDonut) * 100) 
                  : cat.allocatedPercentage;

                return (
                  <div
                    key={cat.category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      padding: '0.35rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--primary-50)' : isHovered ? 'var(--bg-surface-subtle)' : 'transparent',
                      cursor: onSelectCategory ? 'pointer' : 'default',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={() => setHoveredCategory(cat.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onSelectCategory && onSelectCategory(cat.category)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                      <span 
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          flexShrink: 0,
                        }} 
                      />
                      <span style={{ fontWeight: isSelected ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
                      ${(summary.totalEstimated > 0 ? cat.totalEstimated : cat.allocatedAmount).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel B: Estimated vs. Actual Spending Comparison */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--sage-600)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Estimated vs. Actual Confirmed</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary-500)' }} />
                  Estimated
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--sage-500)' }} />
                  Actual Paid
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.1rem' }}>
              Compare planned estimates against paid deposits or contracts. Categories without actual expenses are clearly marked.
            </p>

            {/* Horizontal Dual Bar Grouping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categories.slice(0, compact ? 4 : 6).map((cat) => {
                const maxVal = Math.max(cat.allocatedAmount, cat.totalEstimated, cat.totalActual, 1);
                const estWidth = Math.min(100, Math.round((cat.totalEstimated / maxVal) * 100));
                const actWidth = Math.min(100, Math.round((cat.totalActual / maxVal) * 100));
                const hasActual = cat.actualItemCount > 0;

                return (
                  <div 
                    key={cat.category} 
                    style={{ 
                      fontSize: '0.82rem',
                      padding: '0.35rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedCategory === cat.category ? 'var(--primary-50)' : 'transparent',
                      cursor: onSelectCategory ? 'pointer' : 'default',
                      transition: 'background 0.15s ease',
                    }}
                    onClick={() => onSelectCategory && onSelectCategory(cat.category)}
                    title={onSelectCategory ? `Filter expenses by ${cat.label}` : undefined}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: selectedCategory === cat.category ? 700 : 600 }}>{cat.label}</span>
                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <span style={{ color: cat.isOverAllocated ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
                          Est: ${cat.totalEstimated.toLocaleString()}
                        </span>
                        {hasActual ? (
                          <span style={{ color: 'var(--sage-700)', fontWeight: 600 }}>
                            Act: ${cat.totalActual.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                            No actual recorded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dual Track Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {/* Estimated Bar */}
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${estWidth}%`, 
                            background: cat.isOverAllocated ? 'var(--danger-text)' : 'var(--primary-500)' 
                          }} 
                        />
                      </div>

                      {/* Actual Bar or Placeholder */}
                      <div className="progress-track" style={{ height: '6px', background: 'rgba(0,0,0,0.03)' }}>
                        {hasActual ? (
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${actWidth}%`, 
                              background: 'var(--sage-500)' 
                            }} 
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', opacity: 0.15, background: 'repeating-linear-gradient(45deg, #CCC, #CCC 4px, transparent 4px, transparent 8px)' }} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Confirmed Actuals Reconciled: <strong>${summary.totalActual.toLocaleString()}</strong>
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Target: ${summary.totalBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Insights Row */}
      {!compact && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {/* Top Driver Insight */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '1rem 1.25rem', 
              borderRadius: 'var(--radius-md)',
              cursor: (onSelectCategory && summary.insights.highestCategory) ? 'pointer' : 'default',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onClick={() => {
              if (onSelectCategory && summary.insights.highestCategory) {
                onSelectCategory(summary.insights.highestCategory.category);
              }
            }}
            title={summary.insights.highestCategory ? `Click to filter expenses by ${summary.insights.highestCategory.label}` : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.84rem' }}>
                <ArrowUpRight size={15} />
                <span>Top Expense Driver</span>
              </div>
              {onSelectCategory && summary.insights.highestCategory && (
                <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Filter View</span>
              )}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {summary.insights.highestCategory ? summary.insights.highestCategory.label : 'None'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              ${summary.insights.highestCategory?.totalEstimated.toLocaleString()} estimated spend
            </div>
          </div>

          {/* Variance Tracker */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '1rem 1.25rem', 
              borderRadius: 'var(--radius-md)',
              cursor: (onSelectCategory && summary.insights.overBudgetCategories.length > 0) ? 'pointer' : 'default',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onClick={() => {
              if (onSelectCategory && summary.insights.overBudgetCategories.length > 0) {
                onSelectCategory(summary.insights.overBudgetCategories[0].category);
              }
            }}
            title={summary.insights.overBudgetCategories.length > 0 ? `Click to inspect over-budget category` : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: summary.isOverBudget ? 'var(--danger-text)' : 'var(--sage-700)', fontWeight: 600, fontSize: '0.84rem' }}>
                {summary.isOverBudget ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                <span>Target Alignment</span>
              </div>
              {onSelectCategory && summary.insights.overBudgetCategories.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Inspect Over-Budget</span>
              )}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {summary.insights.overBudgetCategories.length === 0 
                ? 'All Categories on Track' 
                : `${summary.insights.overBudgetCategories.length} Over Allocation`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {summary.insights.underBudgetCategories.length} categories within baseline
            </div>
          </div>

          {/* Actuals Reconciled */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-600)', fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={15} />
              <span>Confirmed Actuals</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${summary.totalActual.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {summary.insights.hasActualsRecorded ? 'Deposits & verified payments' : 'Awaiting deposit receipts'}
            </div>
          </div>

          {/* Strategic Tip */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.25rem' }}>
              <Sparkles size={15} />
              <span>Strategic Recommendation</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4, marginTop: '0.25rem' }}>
              {summary.insights.savingsTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
