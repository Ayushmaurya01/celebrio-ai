import React from 'react';
import { EventPlan, AppSettings } from '../types';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  Settings as SettingsIcon, 
  Menu,
  Printer,
  ChevronDown
} from 'lucide-react';

import { NavigationTab } from './Sidebar';

interface TopBarProps {
  activeEvent: EventPlan | null;
  allEvents: EventPlan[];
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleSidebar: () => void;
  onNavigate?: (tab: NavigationTab) => void;
  settings: AppSettings;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeEvent,
  allEvents,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenSettingsModal,
  onToggleSidebar,
  onNavigate,
  settings,
}) => {
  // Calculate countdown days
  const getDaysUntilEvent = (dateStr: string) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    if (isNaN(target.getTime())) return null;
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntil = activeEvent ? getDaysUntilEvent(activeEvent.date) : null;
  const isLiveAI = Boolean(settings.geminiApiKey && !settings.preferOfflineDemo);

  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button 
          className="btn-icon" 
          onClick={onToggleSidebar} 
          title="Toggle navigation sidebar"
          aria-label="Toggle navigation menu"
          style={{ display: 'inline-flex', cursor: 'pointer' }}
        >
          <Menu size={20} />
        </button>

        {/* Active Event Selector */}
        {activeEvent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                aria-label="Select active event plan"
                value={activeEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                style={{
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  paddingRight: '2rem',
                  maxWidth: '280px',
                  background: 'var(--bg-surface-subtle)',
                  borderColor: 'var(--border-medium)',
                  cursor: 'pointer',
                }}
              >
                {allEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({new Date(ev.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={14} 
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  pointerEvents: 'none',
                  color: 'var(--text-secondary)'
                }} 
              />
            </div>

            {/* Countdown Chip */}
            {daysUntil !== null && (
              <button 
                type="button"
                onClick={() => onNavigate && onNavigate('timeline')}
                className={`badge hide-mobile ${daysUntil < 0 ? 'badge-danger' : daysUntil <= 7 ? 'badge-warning' : 'badge-gold'}`}
                title={`Event date: ${activeEvent.date}. Click to view Event Timeline & Day-of Schedule.`}
                style={{ 
                  cursor: onNavigate ? 'pointer' : 'default', 
                  border: 'none',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <Calendar size={12} />
                {daysUntil < 0 ? `${Math.abs(daysUntil)}d ago` : daysUntil === 0 ? 'Today!' : `${daysUntil}d to go`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right-hand side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* AI Mode Indicator Badge */}
        <div 
          onClick={onOpenSettingsModal}
          style={{ 
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            fontSize: '0.78rem',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: isLiveAI ? 'var(--gold-100)' : 'var(--primary-50)',
            color: isLiveAI ? 'var(--gold-600)' : 'var(--primary-700)',
            border: `1px solid ${isLiveAI ? 'var(--gold-500)' : 'var(--primary-100)'}`,
            fontWeight: 600,
          }}
          title="Click to configure Gemini API or switch modes"
        >
          <Sparkles size={13} />
          <span>{isLiveAI ? 'Live Gemini AI' : 'Deterministic Demo Mode'}</span>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => window.print()}
          title="Print or Save PDF of current plan"
          aria-label="Print event summary"
        >
          <Printer size={15} />
          <span className="hide-mobile">Print / PDF</span>
        </button>

        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenNewEventModal}
          aria-label="Create new event plan"
        >
          <Plus size={16} />
          <span>New Event</span>
        </button>

        <button 
          className="btn-icon" 
          onClick={onOpenSettingsModal}
          title="Settings & AI configuration"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};
