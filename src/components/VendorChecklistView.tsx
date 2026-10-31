import { useState } from 'react';
import { EventPlan, VendorTask, BudgetCategory, VendorBookingStatus, VendorTaskPriority } from '../types';
import { calculateVendorTaskProgress } from '../services/vendorTaskService';
import { BUDGET_CATEGORY_METADATA } from '../services/budgetService';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  X,
  Building2,
  Calendar
} from 'lucide-react';

interface VendorChecklistViewProps {
  activeEvent: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const VendorChecklistView: React.FC<VendorChecklistViewProps> = ({
  activeEvent,
  onUpdateEvent,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<BudgetCategory | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<VendorTask | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    category: BudgetCategory;
    vendorName: string;
    contactPerson: string;
    phone: string;
    email: string;
    notes: string;
    bookingStatus: VendorBookingStatus;
    estimatedCost: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    completed: boolean;
  }>({
    title: '',
    category: 'venue',
    vendorName: '',
    contactPerson: '',
    phone: '',
    email: '',
    notes: '',
    bookingStatus: 'inquiry',
    estimatedCost: '',
    dueDate: activeEvent.date,
    priority: 'medium',
    completed: false,
  });

  const [formErrors, setFormErrors] = useState<{ title?: string; dueDate?: string }>({});

  const taskMetrics = calculateVendorTaskProgress(activeEvent.vendorTasks);

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      category: 'venue',
      vendorName: '',
      contactPerson: '',
      phone: '',
      email: '',
      notes: '',
      bookingStatus: 'inquiry',
      estimatedCost: '',
      dueDate: activeEvent.date,
      priority: 'medium',
      completed: false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (task: VendorTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      vendorName: task.vendorName || '',
      contactPerson: task.contactPerson || '',
      phone: task.phone || '',
      email: task.email || '',
      notes: task.notes || '',
      bookingStatus: task.bookingStatus,
      estimatedCost: task.estimatedCost ? task.estimatedCost.toString() : '',
      dueDate: task.dueDate,
      priority: task.priority,
      completed: task.completed,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleToggleCompleted = (taskId: string) => {
    const task = activeEvent.vendorTasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    const updated = activeEvent.vendorTasks.map((t) =>
      t.id === taskId ? { ...t, completed: nextCompleted } : t
    );

    onUpdateEvent({
      ...activeEvent,
      vendorTasks: updated,
      updatedAt: new Date().toISOString(),
    });

    if (nextCompleted) {
      showToast(`Completed "${task.title}"`, 'success');
      // Check if all are completed to shoot confetti!
      const allDone = updated.every((t) => t.completed);
      if (allDone && updated.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1A73E8', '#EA4335', '#FBBC04', '#34A853'],
        });
        showToast('🎉 Bravo! All vendor and checklist tasks are 100% complete!', 'success');
      }
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; dueDate?: string } = {};

    if (!formData.title.trim()) {
      errors.title = 'Task / Vendor title is required.';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const estCost = formData.estimatedCost.trim() ? Number(formData.estimatedCost) : 0;

    let updatedTasks: VendorTask[];

    if (editingTask) {
      updatedTasks = activeEvent.vendorTasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: formData.title.trim(),
              category: formData.category,
              vendorName: formData.vendorName.trim() || undefined,
              contactPerson: formData.contactPerson.trim() || undefined,
              phone: formData.phone.trim() || undefined,
              email: formData.email.trim() || undefined,
              notes: formData.notes.trim() || undefined,
              bookingStatus: formData.bookingStatus,
              estimatedCost: estCost,
              dueDate: formData.dueDate,
              priority: formData.priority,
              completed: formData.completed,
            }
          : t
      );
      showToast(`Updated task "${formData.title}"`, 'success');
    } else {
      const newTask: VendorTask = {
        id: 'vt-' + Date.now(),
        title: formData.title.trim(),
        category: formData.category,
        vendorName: formData.vendorName.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        bookingStatus: formData.bookingStatus,
        estimatedCost: estCost,
        dueDate: formData.dueDate,
        priority: formData.priority,
        completed: formData.completed,
      };
      updatedTasks = [...activeEvent.vendorTasks, newTask];
      showToast(`Added task "${formData.title}"`, 'success');
    }

    onUpdateEvent({
      ...activeEvent,
      vendorTasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    if (window.confirm(`Delete task "${title}"?`)) {
      const updated = activeEvent.vendorTasks.filter((t) => t.id !== taskId);
      onUpdateEvent({
        ...activeEvent,
        vendorTasks: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Deleted task "${title}"`, 'info');
    }
  };

  // Filtering
  const filteredTasks = activeEvent.vendorTasks.filter((t) => {
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchVendor = t.vendorName?.toLowerCase().includes(query);
      const matchNotes = t.notes?.toLowerCase().includes(query);
      return matchTitle || matchVendor || matchNotes;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Overview */}
      <div 
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-gold">Vendor Directory & Run-List</span>
              <span className="badge badge-success">{taskMetrics.percentage}% Complete</span>
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>Vendor & Task Checklist</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Track contracts, contact details, payment quotes, and day-to-day deliverables.
            </p>
          </div>

          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Vendor / Task</span>
          </button>
        </div>

        {/* Progress Bar & Key Numbers */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <span>
              <strong>{taskMetrics.completed}</strong> of <strong>{taskMetrics.total}</strong> tasks completed ({taskMetrics.pendingCount} pending)
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              Committed vendor spend: <strong>${taskMetrics.totalCommittedSpend.toLocaleString()}</strong>
            </span>
          </div>
          <div className="progress-track" style={{ height: '9px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${taskMetrics.percentage}%`, background: 'var(--success-text)' }} 
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search vendors, contacts, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', fontSize: '0.86rem' }}
            />
          </div>

          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as BudgetCategory | 'all')}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', width: 'auto' }}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {Object.entries(BUDGET_CATEGORY_METADATA).map(([catKey, meta]) => (
                <option key={catKey} value={catKey}>{meta.label}</option>
              ))}
            </select>

            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
              <button
                className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, border: 'none' }}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, border: 'none' }}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 0, border: 'none' }}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Cards Grid / List */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckSquare size={40} color="var(--border-medium)" style={{ margin: '0 auto 0.75rem' }} />
            <p>No vendor tasks match the active filters.</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }} onClick={openAddModal}>
              Add New Task
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {filteredTasks.map((t) => {
              const isOverdue = !t.completed && new Date(t.dueDate + 'T00:00:00') < new Date();

              return (
                <div 
                  key={t.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    opacity: t.completed ? 0.8 : 1,
                    background: t.completed ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                    borderColor: isOverdue ? 'var(--danger-border)' : 'var(--border-subtle)',
                  }}
                >
                  <div>
                    {/* Top line: Category and Priority badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {BUDGET_CATEGORY_METADATA[t.category]?.label || t.category}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span className={`badge ${
                          t.priority === 'high' ? 'badge-danger' : 
                          t.priority === 'medium' ? 'badge-warning' : 'badge-neutral'
                        }`} style={{ fontSize: '0.68rem' }}>
                          {t.priority}
                        </span>

                        <span className={`badge ${
                          t.bookingStatus === 'booked' || t.bookingStatus === 'deposit_paid' ? 'badge-success' :
                          t.bookingStatus === 'quote_received' ? 'badge-gold' : 'badge-neutral'
                        }`} style={{ fontSize: '0.68rem' }}>
                          {t.bookingStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Task Title & Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleCompleted(t.id)}
                        className="btn-icon"
                        style={{ padding: 0, marginTop: '2px' }}
                        aria-label={`Toggle completion for ${t.title}`}
                      >
                        {t.completed ? (
                          <CheckCircle2 size={20} color="var(--success-text)" />
                        ) : (
                          <Circle size={20} color="var(--text-muted)" />
                        )}
                      </button>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        textDecoration: t.completed ? 'line-through' : 'none',
                        color: isOverdue ? 'var(--danger-text)' : 'var(--text-primary)',
                      }}>
                        {t.title}
                      </h3>
                    </div>

                    {/* Vendor Info Box */}
                    {t.vendorName && (
                      <div style={{
                        margin: '0.65rem 0',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                      }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-700)' }}>
                          <Building2 size={14} />
                          <span>{t.vendorName}</span>
                          {t.contactPerson && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({t.contactPerson})</span>}
                        </div>

                        {(t.phone || t.email) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                            {t.phone && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Phone size={12} /> {t.phone}
                              </span>
                            )}
                            {t.email && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Mail size={12} /> {t.email}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {t.notes && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>
                        {t.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom: Due Date, Estimated Cost, Actions */}
                  <div style={{
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: '0.78rem', color: isOverdue ? 'var(--danger-text)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: isOverdue ? 600 : 400 }}>
                      <Calendar size={13} />
                      <span>Due {t.dueDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {t.estimatedCost > 0 && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${t.estimatedCost.toLocaleString()}
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditModal(t)}
                          title="Edit task"
                          aria-label={`Edit ${t.title}`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteTask(t.id, t.title)}
                          title="Delete task"
                          aria-label={`Delete ${t.title}`}
                          style={{ color: 'var(--danger-text)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-task-title">
            <div className="modal-header">
              <h2 id="modal-task-title" style={{ fontSize: '1.25rem' }}>
                {editingTask ? 'Edit Vendor / Task' : 'Add New Vendor Deliverable'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">Task / Action Title *</label>
                  <input
                    id="task-title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Contract Sound & DJ Equipment, Confirm Cake Delivery"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {formErrors.title && <div className="form-error">{formErrors.title}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-cat">Category *</label>
                    <select
                      id="task-cat"
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
                    >
                      {Object.entries(BUDGET_CATEGORY_METADATA).map(([catKey, meta]) => (
                        <option key={catKey} value={catKey}>{meta.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-priority">Priority</label>
                    <select
                      id="task-priority"
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as VendorTaskPriority })}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Vendor Details Fieldset */}
                <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', marginBottom: '1.15rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-700)', marginBottom: '0.65rem' }}>
                    Vendor Details & Contacts (Optional)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" htmlFor="v-name" style={{ fontSize: '0.8rem' }}>Company / Business Name</label>
                      <input
                        id="v-name"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Lumiere Photography Studios"
                        value={formData.vendorName}
                        onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="v-contact" style={{ fontSize: '0.8rem' }}>Contact Person</label>
                      <input
                        id="v-contact"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Marcus Vance"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" htmlFor="v-phone" style={{ fontSize: '0.8rem' }}>Phone Number</label>
                      <input
                        id="v-phone"
                        type="text"
                        className="form-input"
                        placeholder="e.g. +1 555-0192"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="v-email" style={{ fontSize: '0.8rem' }}>Email Address</label>
                      <input
                        id="v-email"
                        type="email"
                        className="form-input"
                        placeholder="e.g. marcus@lumiere.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-due">Due Date *</label>
                    <input
                      id="task-due"
                      type="date"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                    {formErrors.dueDate && <div className="form-error">{formErrors.dueDate}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-booking">Booking Status</label>
                    <select
                      id="task-booking"
                      className="form-select"
                      value={formData.bookingStatus}
                      onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value as VendorBookingStatus })}
                    >
                      <option value="inquiry">Inquiry</option>
                      <option value="quote_received">Quote Received</option>
                      <option value="booked">Booked</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="task-cost">Estimated Cost ($)</label>
                    <input
                      id="task-cost"
                      type="number"
                      step="1"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 1200"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-notes">Notes & Deliverables</label>
                  <textarea
                    id="task-notes"
                    className="form-textarea"
                    rows={2}
                    placeholder="Provide special instructions, package inclusions, or contract terms..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
