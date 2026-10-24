import React, { useState } from 'react';
import { EventPlan, TimelineMilestone, MilestoneStatus } from '../types';
import { 
  isMilestoneOverdue, 
  sortMilestonesChronologically, 
  checkDateSequenceIssues 
} from '../services/timelineService';
import { 
  validateTimelineMilestone 
} from '../services/validationService';
import { 
  CalendarClock, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  Edit3, 
  Trash2, 
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface TimelineViewProps {
  activeEvent: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  activeEvent,
  onUpdateEvent,
  showToast,
}) => {
  const [filterView, setFilterView] = useState<'all' | 'prep' | 'day_of'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: TimelineMilestone['category'];
    targetDate: string;
    time: string;
    status: MilestoneStatus;
    isDayOfAgenda: boolean;
  }>({
    title: '',
    description: '',
    category: 'general',
    targetDate: activeEvent.date,
    time: '',
    status: 'pending',
    isDayOfAgenda: false,
  });

  const [formErrors, setFormErrors] = useState<{ title?: string; targetDate?: string }>({});
  const [formWarnings, setFormWarnings] = useState<string[]>([]);

  const sequenceIssues = checkDateSequenceIssues(activeEvent.timeline, activeEvent.date);
  const sortedMilestones = sortMilestonesChronologically(activeEvent.timeline);

  const displayedMilestones = sortedMilestones.filter((m) => {
    if (filterView === 'prep') return !m.isDayOfAgenda;
    if (filterView === 'day_of') return Boolean(m.isDayOfAgenda);
    return true;
  });

  const overdueCount = activeEvent.timeline.filter((m) => isMilestoneOverdue(m)).length;
  const completedCount = activeEvent.timeline.filter((m) => m.status === 'completed').length;

  const openAddModal = (isDayOf: boolean = false) => {
    setEditingMilestone(null);
    setFormData({
      title: '',
      description: '',
      category: isDayOf ? 'day_of' : 'general',
      targetDate: isDayOf ? activeEvent.date : activeEvent.date,
      time: isDayOf ? '14:00' : '',
      status: 'pending',
      isDayOfAgenda: isDayOf,
    });
    setFormErrors({});
    setFormWarnings([]);
    setIsModalOpen(true);
  };

  const openEditModal = (m: TimelineMilestone) => {
    setEditingMilestone(m);
    setFormData({
      title: m.title,
      description: m.description,
      category: m.category,
      targetDate: m.targetDate,
      time: m.time || '',
      status: m.status,
      isDayOfAgenda: Boolean(m.isDayOfAgenda),
    });
    setFormErrors({});
    setFormWarnings([]);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (milestoneId: string) => {
    const nextStatus: Record<MilestoneStatus, MilestoneStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
    };

    const updated = activeEvent.timeline.map((m) =>
      m.id === milestoneId ? { ...m, status: nextStatus[m.status] } : m
    );

    onUpdateEvent({
      ...activeEvent,
      timeline: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTimelineMilestone(
      {
        title: formData.title,
        targetDate: formData.targetDate,
        isDayOfAgenda: formData.isDayOfAgenda,
      },
      activeEvent.date
    );

    if (!validation.isValid) {
      const errMap: { title?: string; targetDate?: string } = {};
      validation.errors.forEach((err) => {
        if (err.field === 'title') errMap.title = err.message;
        if (err.field === 'targetDate') errMap.targetDate = err.message;
      });
      setFormErrors(errMap);
      setFormWarnings(validation.warnings);
      return;
    }

    let updatedMilestones: TimelineMilestone[];

    if (editingMilestone) {
      updatedMilestones = activeEvent.timeline.map((m) =>
        m.id === editingMilestone.id
          ? {
              ...m,
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category,
              targetDate: formData.targetDate,
              time: formData.time ? formData.time : undefined,
              status: formData.status,
              isDayOfAgenda: formData.isDayOfAgenda,
            }
          : m
      );
      showToast(`Updated milestone "${formData.title}"`, 'success');
    } else {
      const newM: TimelineMilestone = {
        id: 'm-' + Date.now(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        targetDate: formData.targetDate,
        time: formData.time ? formData.time : undefined,
        status: formData.status,
        isDayOfAgenda: formData.isDayOfAgenda,
      };
      updatedMilestones = [...activeEvent.timeline, newM];
      showToast(`Added milestone "${formData.title}"`, 'success');
    }

    onUpdateEvent({
      ...activeEvent,
      timeline: updatedMilestones,
      updatedAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleDeleteMilestone = (milestoneId: string, title: string) => {
    if (window.confirm(`Delete milestone "${title}"?`)) {
      const updated = activeEvent.timeline.filter((m) => m.id !== milestoneId);
      onUpdateEvent({
        ...activeEvent,
        timeline: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Deleted milestone "${title}"`, 'info');
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-gold">Chronological Flow</span>
              {overdueCount > 0 && (
                <span className="badge badge-danger">
                  ⚠️ {overdueCount} Overdue
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>Event Timeline & Day-of Schedule</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Track preparation countdown milestones and hour-by-hour event day agenda.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => openAddModal(true)}>
              <Clock size={16} />
              <span>Add Day-of Agenda Item</span>
            </button>
            <button className="btn btn-primary" onClick={() => openAddModal(false)}>
              <Plus size={16} />
              <span>Add Preparation Milestone</span>
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <span>
            Total: <strong>{activeEvent.timeline.length}</strong> milestones
          </span>
          <span>
            Completed: <strong style={{ color: 'var(--success-text)' }}>{completedCount}</strong>
          </span>
          <span>
            Pending: <strong>{activeEvent.timeline.length - completedCount}</strong>
          </span>
          <span>
            Event Date: <strong>{activeEvent.date}</strong>
          </span>
        </div>
      </div>

      {/* Sequence warning banner */}
      {sequenceIssues.length > 0 && (
        <div className="alert-box alert-warning" role="alert">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Date Sequence Warnings Detected: </strong>
            {sequenceIssues.length} preparation milestone(s) are set to target dates after your celebration date ({activeEvent.date}).
            Review these milestones to ensure vendors and arrangements are finalized before the event starts.
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${filterView === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterView('all')}
        >
          <span>All Milestones ({sortedMilestones.length})</span>
        </button>
        <button
          className={`btn ${filterView === 'prep' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterView('prep')}
        >
          <Calendar size={14} />
          <span>Preparation Countdown ({sortedMilestones.filter((m) => !m.isDayOfAgenda).length})</span>
        </button>
        <button
          className={`btn ${filterView === 'day_of' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setFilterView('day_of')}
        >
          <Clock size={14} />
          <span>Day-of Agenda ({sortedMilestones.filter((m) => m.isDayOfAgenda).length})</span>
        </button>
      </div>

      {/* Milestones Timeline List */}
      <div className="card">
        {displayedMilestones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CalendarClock size={40} color="var(--border-medium)" style={{ margin: '0 auto 0.75rem' }} />
            <p>No milestones found for this view.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => openAddModal()}>
              Add First Milestone
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {displayedMilestones.map((m, index) => {
              const overdue = isMilestoneOverdue(m);
              const hasSequenceIssue = sequenceIssues.some((issue) => issue.milestoneId === m.id);

              return (
                <div 
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    padding: '1.15rem 1.4rem',
                    borderRadius: 'var(--radius-lg)',
                    background: overdue ? 'var(--danger-bg)' : m.status === 'completed' ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                    border: `1px solid ${overdue ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    opacity: m.status === 'completed' ? 0.75 : 1,
                  }}
                >
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(m.id)}
                    className="btn-icon"
                    title={`Click to cycle status (Current: ${m.status})`}
                    style={{ padding: 0, marginTop: '3px' }}
                    aria-label={`Cycle status for milestone ${m.title}`}
                  >
                    {m.status === 'completed' ? (
                      <CheckCircle size={22} color="var(--success-text)" />
                    ) : m.status === 'in_progress' ? (
                      <PlayCircle size={22} color="var(--primary-500)" />
                    ) : (
                      <Circle size={22} color="var(--text-muted)" />
                    )}
                  </button>

                  {/* Main Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          textDecoration: m.status === 'completed' ? 'line-through' : 'none',
                          color: overdue ? 'var(--danger-text)' : 'var(--text-primary)',
                        }}>
                          {m.title}
                        </span>

                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {m.category.replace('_', ' ')}
                        </span>

                        {m.isDayOfAgenda && (
                          <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                            Day-of Run Sheet
                          </span>
                        )}

                        {overdue && (
                          <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>
                            ⚠️ Overdue
                          </span>
                        )}

                        {hasSequenceIssue && (
                          <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                            ⚠️ After Event Date
                          </span>
                        )}
                      </div>

                      {/* Date & Time Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: overdue ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span style={{ fontWeight: 600 }}>{m.targetDate}</span>
                        {m.time && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--primary-50)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--primary-700)', fontWeight: 600 }}>
                            <Clock size={12} />
                            {m.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                      {m.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => openEditModal(m)} 
                      title="Edit milestone"
                      aria-label={`Edit ${m.title}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDeleteMilestone(m.id, m.title)} 
                      title="Delete milestone"
                      aria-label={`Delete ${m.title}`}
                      style={{ color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-milestone-title">
            <div className="modal-header">
              <h2 id="modal-milestone-title" style={{ fontSize: '1.25rem' }}>
                {editingMilestone ? 'Edit Schedule Milestone' : 'Add Schedule Milestone'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone}>
              <div className="modal-body">
                {formWarnings.length > 0 && (
                  <div className="alert-box alert-warning">
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <div>{formWarnings.join(' ')}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="m-title">Milestone Title *</label>
                  <input
                    id="m-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Menu Tasting, Send Invitations, Ceremony Begins"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {formErrors.title && <div className="form-error">{formErrors.title}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-date">Target Date *</label>
                    <input
                      id="m-date"
                      type="date"
                      className="form-input"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    />
                    {formErrors.targetDate && <div className="form-error">{formErrors.targetDate}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="m-time">Specific Time (for day-of agenda)</label>
                    <input
                      id="m-time"
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="m-cat">Category</label>
                    <select
                      id="m-cat"
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="venue">Venue</option>
                      <option value="vendors">Vendors</option>
                      <option value="invitations">Invitations</option>
                      <option value="decor">Decor & Styling</option>
                      <option value="logistics">Logistics & Safety</option>
                      <option value="day_of">Day-of Run Sheet</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="m-status">Current Status</label>
                    <select
                      id="m-status"
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isDayOfAgenda}
                      onChange={(e) => setFormData({ ...formData, isDayOfAgenda: e.target.checked })}
                      style={{ accentColor: 'var(--primary-500)', width: '16px', height: '16px' }}
                    />
                    <span>Classify as Day-of Event Hourly Run-Sheet Item</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="m-desc">Description & Instructions</label>
                  <textarea
                    id="m-desc"
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide coordinator notes, vendor contact or checklist instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMilestone ? 'Save Milestone' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
