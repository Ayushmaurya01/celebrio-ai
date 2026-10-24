import React, { useRef } from 'react';
import { EventPlan } from '../types';
import { calculateBudgetSummary } from '../services/budgetService';
import { calculateVendorTaskProgress } from '../services/vendorTaskService';
import { exportPlanAsJSON } from '../services/storageService';
import { 
  FolderHeart, 
  Plus, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';

interface SavedPlansViewProps {
  allEvents: EventPlan[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenNewEventModal: () => void;
  onOpenEditEventModal: (event: EventPlan) => void;
  onDuplicateEvent: (event: EventPlan) => void;
  onDeleteEvent: (eventId: string, name: string) => void;
  onImportEvent: (event: EventPlan) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  allEvents,
  activeEventId,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenEditEventModal,
  onDuplicateEvent,
  onDeleteEvent,
  onImportEvent,
  showToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.name || !parsed.type || !parsed.date) {
          showToast('Invalid plan JSON: Missing required fields (name, type, date).', 'warning');
          return;
        }

        const imported: EventPlan = {
          ...parsed,
          id: 'event-imp-' + Date.now(),
          name: `${parsed.name} (Imported)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onImportEvent(imported);
        showToast(`Successfully imported "${imported.name}"!`, 'success');
      } catch (err) {
        showToast('Failed to parse JSON file.', 'warning');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner */}
      <div 
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-gold">Plan Portfolio</span>
              <span className="badge badge-neutral">{allEvents.length} Saved Event{allEvents.length === 1 ? '' : 's'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>Saved Celebrations & Plans</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Reopen active events, duplicate templates, or export full JSON portfolios.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleFileUpload} 
            />
            <button 
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              title="Import plan from exported JSON file"
            >
              <Upload size={16} />
              <span>Import Plan</span>
            </button>

            <button className="btn btn-primary" onClick={onOpenNewEventModal}>
              <Plus size={16} />
              <span>Create New Celebration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Event Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '1.5rem',
      }}>
        {allEvents.map((event) => {
          const isActive = event.id === activeEventId;
          const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
          const taskProgress = calculateVendorTaskProgress(event.vendorTasks);

          return (
            <div 
              key={event.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: isActive ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                boxShadow: isActive ? '0 8px 24px rgba(26, 115, 232, 0.18)' : 'var(--glass-shadow)',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                }}>
                  <span className="badge badge-coral" style={{ fontSize: '0.7rem' }}>
                    Active Workspace
                  </span>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                    {event.type.replace('_', ' ')}
                  </span>
                  {event.themeKeywords && (
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.themeKeywords}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.4rem', lineHeight: 1.25, color: 'var(--text-primary)' }}>
                  {event.name}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.85rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} color="var(--gold-500)" />
                    <span>{new Date(event.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} {event.time && `• ${event.time}`}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="var(--primary-500)" />
                    <span>{event.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} color="var(--text-muted)" />
                    <span>{event.guestCount} Attendees</span>
                  </div>
                </div>

                {/* Quick Budget & Task Snapshot */}
                <div style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Budget Allocated:</span>
                    <strong style={{ color: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                      ${budgetSummary.totalEstimated.toLocaleString()} / ${event.totalBudget.toLocaleString()}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tasks Completed:</span>
                    <strong style={{ color: 'var(--success-text)' }}>
                      {taskProgress.completed} of {taskProgress.total} ({taskProgress.percentage}%)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {!isActive ? (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectEvent(event.id)}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectEvent(event.id)}
                      title="Navigate to active event dashboard"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenEditEventModal(event)}
                    title="Edit event name, date, budget"
                  >
                    Edit
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => onDuplicateEvent(event)}
                    title="Duplicate plan"
                    aria-label={`Duplicate ${event.name}`}
                  >
                    <Copy size={15} />
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => exportPlanAsJSON(event)}
                    title="Export JSON backup"
                    aria-label={`Export ${event.name} as JSON`}
                  >
                    <Download size={15} />
                  </button>
                  {allEvents.length > 1 && (
                    <button 
                      className="btn-icon" 
                      onClick={() => onDeleteEvent(event.id, event.name)}
                      title="Delete event"
                      aria-label={`Delete ${event.name}`}
                      style={{ color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
