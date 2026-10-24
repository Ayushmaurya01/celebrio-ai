import React, { useState } from 'react';
import { EventPlan } from '../types';
import { calculateBudgetSummary } from '../services/budgetService';
import { calculateVendorTaskProgress } from '../services/vendorTaskService';
import { isMilestoneOverdue } from '../services/timelineService';
import { BudgetAnalytics } from './BudgetAnalytics';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Sparkle,
  Utensils,
  Music,
  Receipt,
  Check
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface DashboardViewProps {
  activeEvent: EventPlan;
  onNavigate: (tab: NavigationTab) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleMilestoneStatus: (milestoneId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeEvent,
  onNavigate,
  onToggleTaskComplete,
  onToggleMilestoneStatus,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const budgetSummary = calculateBudgetSummary(activeEvent.totalBudget, activeEvent.budgetItems);
  const taskProgress = calculateVendorTaskProgress(activeEvent.vendorTasks);
  
  // Calculate days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(activeEvent.date + 'T00:00:00');
  const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Count overdue milestones
  const overdueMilestones = activeEvent.timeline.filter((m) => isMilestoneOverdue(m));

  // Next 4 upcoming milestones
  const upcomingMilestones = [...activeEvent.timeline]
    .filter((m) => m.status !== 'completed')
    .slice(0, 4);

  // Top pending tasks
  const pendingTasks = activeEvent.vendorTasks
    .filter((t) => !t.completed)
    .slice(0, 4);

  const costPerGuest = activeEvent.guestCount > 0 
    ? Math.round(budgetSummary.totalEstimated / activeEvent.guestCount) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hero Welcome Banner with Glassmorphism */}
      <section 
        className="glass-card"
        style={{
          padding: '2.25rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-labelledby="hero-title"
      >
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(26, 115, 232, 0.10) 0%, rgba(251, 188, 4, 0.08) 60%, transparent 80%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.75rem', position: 'relative' }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-coral">
                {activeEvent.type.replace('_', ' ')}
              </span>
              <span className="badge badge-gold">
                {activeEvent.themeKeywords ? activeEvent.themeKeywords : 'Celebration Blueprint'}
              </span>
              {daysDiff > 0 && (
                <span className="badge badge-neutral">
                  <Clock size={12} /> {daysDiff} days until event
                </span>
              )}
            </div>

            <h1 id="hero-title" style={{ fontSize: '2.2rem', marginBottom: '0.65rem', lineHeight: 1.2, wordBreak: 'break-word' }}>
              {activeEvent.name}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--primary-500)" />
                {activeEvent.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--gold-500)" />
                {new Date(activeEvent.date + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {activeEvent.time && ` at ${activeEvent.time}`}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={16} color="var(--text-muted)" />
                {activeEvent.guestCount.toLocaleString()} Invited Guests
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary"
                onClick={() => onNavigate('ai_planner')}
              >
                <Sparkles size={16} />
                <span>Open AI Assistant & Plan</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('budget')}
              >
                <Wallet size={16} />
                <span>Adjust Budget</span>
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onNavigate('timeline')}
              >
                <Calendar size={16} />
                <span>View Full Timeline</span>
              </button>
            </div>
          </div>

          {/* Quick Countdown Glass Box */}
          <div 
            className="glass-panel"
            style={{
              padding: '1.35rem 1.75rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              minWidth: '190px'
            }}
          >
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Countdown
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', fontWeight: 700, color: daysDiff < 0 ? 'var(--danger-text)' : 'var(--primary-500)', lineHeight: 1.1, margin: '0.25rem 0' }}>
              {daysDiff < 0 ? Math.abs(daysDiff) : daysDiff === 0 ? '0' : daysDiff}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {daysDiff < 0 ? 'Days Since Celebration' : daysDiff === 0 ? 'Celebrate Today!' : 'Days to Celebration'}
            </div>
          </div>
        </div>
      </section>

      {/* Over-budget Banner if needed */}
      {budgetSummary.isOverBudget && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Budget Exceeded Alert: </strong>
            Total estimated expenses (${budgetSummary.totalEstimated.toLocaleString()}) exceed your allocated budget (${budgetSummary.totalBudget.toLocaleString()}) by <strong>${budgetSummary.overBudgetAmount.toLocaleString()}</strong>.
            Review category breakdowns in the Budget Planner to trim costs.
          </div>
        </div>
      )}

      {/* B. Key Statistics Row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1.25rem'
      }} aria-label="Key Event Metrics">
        {/* Total Estimated Cost */}
        <div 
          className="glass-card" 
          style={{ padding: '1.25rem 1.4rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => onNavigate('budget')}
          title="Click to view detailed Budget Planner"
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estimated Total Cost</span>
            <span className="badge badge-estimate">[ESTIMATE]</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--text-primary)' }}>
            ${budgetSummary.totalEstimated.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Allocated: ${budgetSummary.totalBudget.toLocaleString()} ({budgetSummary.percentageUsed}% used)
          </div>
          <div className="progress-track" style={{ marginTop: '0.75rem', height: '6px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(100, budgetSummary.percentageUsed)}%`,
                background: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--primary-500)'
              }} 
            />
          </div>
        </div>

        {/* Remaining Budget / Deficit */}
        <div 
          className="glass-card" 
          style={{ padding: '1.25rem 1.4rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => onNavigate('budget')}
          title="Click to view detailed Budget Planner"
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {budgetSummary.isOverBudget ? 'Budget Deficit' : 'Remaining Budget'}
            </span>
            <TrendingUp size={16} color="var(--gold-500)" />
          </div>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: budgetSummary.remainingBudget < 0 ? 'var(--danger-text)' : 'var(--success-text)' 
          }}>
            ${budgetSummary.remainingBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Avg. ~${costPerGuest}/guest for {activeEvent.guestCount} guests
          </div>
        </div>

        {/* Confirmed Paid Actuals */}
        <div 
          className="glass-card" 
          style={{ padding: '1.25rem 1.4rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => onNavigate('vendors')}
          title="Click to view Vendor & Deliverables Checklist"
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Confirmed Actual Paid</span>
            <Receipt size={16} color="var(--sage-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--sage-700)' }}>
            ${budgetSummary.totalActual.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {taskProgress.completed} of {taskProgress.total} vendor tasks completed ({taskProgress.percentage}%)
          </div>
        </div>

        {/* Timeline Milestones Card */}
        <div 
          className="glass-card" 
          style={{ padding: '1.25rem 1.4rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onClick={() => onNavigate('timeline')}
          title="Click to view full Event Schedule & Timeline"
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Schedule Milestones</span>
            <Calendar size={16} color="var(--primary-500)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {activeEvent.timeline.length} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>milestones</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: overdueMilestones.length > 0 ? 'var(--danger-text)' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: overdueMilestones.length > 0 ? 600 : 400 }}>
            {overdueMilestones.length > 0 ? `⚠️ ${overdueMilestones.length} milestone(s) overdue` : 'All scheduled on track'}
          </div>
        </div>
      </section>

      {/* C. Spending Overview: Compact Budget Analytics Donut & Comparison */}
      <section aria-label="Visual Spending Overview">
        <BudgetAnalytics 
          summary={budgetSummary}
          onSelectCategory={() => onNavigate('budget')}
          compact={true}
        />
      </section>

      {/* Two Column Section: D. AI Styling Blueprint & E. Upcoming Milestones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* D. AI Styling & Concept Blueprint (Easy to scan) */}
        <div className="glass-card" style={{ padding: '1.5rem', borderColor: 'var(--gold-100)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="var(--gold-500)" />
              <span>AI Styling & Concept Blueprint</span>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('ai_planner')}
            >
              <span>Explore Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {activeEvent.aiPlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                  Aesthetic Concept
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-700)', margin: '0.2rem 0 0.4rem 0' }}>
                  {activeEvent.aiPlan.themeTitle}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {activeEvent.aiPlan.themeDescription}
                </p>
              </div>

              {/* Color Swatches */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Harmonious Color Palette</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>Click to copy hex</span>
                </div>
                <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                  {activeEvent.aiPlan.colorPalette.map((col, idx) => {
                    const isCopied = copiedHex === col.hex;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem', 
                          cursor: 'pointer',
                          padding: '0.2rem 0.45rem',
                          borderRadius: '6px',
                          background: isCopied ? 'var(--primary-50)' : 'transparent',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(col.hex);
                          setCopiedHex(col.hex);
                          setTimeout(() => setCopiedHex(null), 2000);
                        }}
                        title={`Click to copy ${col.name} (${col.hex})`}
                      >
                        <div 
                          style={{ 
                            width: '22px', 
                            height: '22px', 
                            borderRadius: '6px', 
                            backgroundColor: col.hex, 
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }} 
                        >
                          {isCopied && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: isCopied ? 'var(--primary-700)' : 'var(--text-secondary)', fontWeight: isCopied ? 700 : 500 }}>
                          {isCopied ? 'Copied!' : col.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scannable Concept Highlights */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}>
                <div 
                  className="glass-panel" 
                  style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                  onClick={() => onNavigate('ai_planner')}
                  title="Click to view full Decor recommendations in AI Planner"
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Sparkle size={13} />
                      <span>Decor Accent</span>
                    </div>
                    <ArrowRight size={12} color="var(--primary-500)" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {activeEvent.aiPlan.decorIdeas.items[0] || 'Lush botanical florals & ambient festoon lighting'}
                  </p>
                </div>

                <div 
                  className="glass-panel" 
                  style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                  onClick={() => onNavigate('ai_planner')}
                  title="Click to view full Catering recommendations in AI Planner"
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--sage-700)', fontSize: '0.8rem', fontWeight: 700 }}>
                      <Utensils size={13} />
                      <span>Culinary Note</span>
                    </div>
                    <ArrowRight size={12} color="var(--sage-600)" />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {activeEvent.aiPlan.cateringSuggestions.items[0] || 'Seasonal curated menu & welcome signature mocktails'}
                  </p>
                </div>
              </div>

              <div 
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gold-50)',
                  border: '1px solid var(--gold-100)',
                  fontSize: '0.84rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
                onClick={() => onNavigate('ai_planner')}
                title="Click to view full atmospheric and music blueprint in AI Planner"
                role="button"
                tabIndex={0}
              >
                <div>
                  <strong style={{ color: 'var(--gold-600)' }}>Sensory Atmosphere: </strong>
                  {activeEvent.aiPlan.atmosphereAndVibe}
                </div>
                <ArrowRight size={14} color="var(--gold-600)" style={{ flexShrink: 0 }} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <Sparkle size={32} color="var(--gold-500)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ marginBottom: '0.75rem' }}>No AI plan generated for this event yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('ai_planner')}>
                Generate AI Event Plan
              </button>
            </div>
          )}
        </div>

        {/* E. Upcoming Milestones & Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="card-header">
            <div className="card-title">
              <Calendar size={18} color="var(--gold-500)" />
              <span>Upcoming Milestones</span>
            </div>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('timeline')}
            >
              <span>Full Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {upcomingMilestones.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>All milestones are currently marked completed!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingMilestones.map((m) => {
                const overdue = isMilestoneOverdue(m);
                return (
                  <div 
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: 'var(--radius-md)',
                      background: overdue ? 'var(--danger-bg)' : 'var(--bg-surface-subtle)',
                      border: `1px solid ${overdue ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={m.status === 'completed'}
                      onChange={() => onToggleMilestoneStatus(m.id)}
                      style={{ marginTop: '0.25rem', cursor: 'pointer', accentColor: 'var(--primary-500)', width: '16px', height: '16px' }}
                      aria-label={`Toggle completion for ${m.title}`}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: overdue ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                          {m.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: overdue ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: overdue ? 700 : 500, flexShrink: 0 }}>
                          {overdue ? '⚠️ Overdue' : m.targetDate}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem', margin: 0 }}>
                        {m.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Tasks Quick Strip */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Top Vendor Deliverables
              </span>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => onNavigate('vendors')}
              >
                View All ({pendingTasks.length} pending)
              </button>
            </div>

            {pendingTasks.slice(0, 2).map((t) => (
              <div 
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '0.4rem',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <input 
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => onToggleTaskComplete(t.id)}
                    style={{ accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                    aria-label={`Mark ${t.title} complete`}
                  />
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </span>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                  Due {t.dueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
