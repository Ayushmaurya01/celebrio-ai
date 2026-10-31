import { useState } from 'react';
import { EventPlan, BudgetItem, BudgetCategory, PaidStatus } from '../types';
import { 
  calculateBudgetSummary, 
  BUDGET_CATEGORY_METADATA 
} from '../services/budgetService';
import { BudgetAnalytics } from './BudgetAnalytics';
import { 
  Wallet, 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  DollarSign, 
  X,
  Search,
  Receipt
} from 'lucide-react';

interface BudgetPlannerViewProps {
  activeEvent: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  activeEvent,
  onUpdateEvent,
  showToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    category: BudgetCategory;
    estimatedCost: string;
    actualCost: string;
    notes: string;
    paidStatus: 'unpaid' | 'deposit_paid' | 'paid_in_full';
  }>({
    name: '',
    category: 'venue',
    estimatedCost: '',
    actualCost: '',
    notes: '',
    paidStatus: 'unpaid',
  });

  const [formErrors, setFormErrors] = useState<{ name?: string; estimatedCost?: string }>({});

  const budgetSummary = calculateBudgetSummary(activeEvent.totalBudget, activeEvent.budgetItems);

  const openAddModal = (categoryPref?: BudgetCategory) => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: categoryPref || 'venue',
      estimatedCost: '',
      actualCost: '',
      notes: '',
      paidStatus: 'unpaid',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      estimatedCost: item.estimatedCost.toString(),
      actualCost: item.actualCost !== undefined ? item.actualCost.toString() : '',
      notes: item.notes || '',
      paidStatus: item.paidStatus,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; estimatedCost?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Expense item name is required.';
    }

    const estCost = Number(formData.estimatedCost);
    if (isNaN(estCost) || estCost < 0) {
      errors.estimatedCost = 'Estimated cost must be 0 or greater.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const actCost = formData.actualCost.trim() !== '' ? Number(formData.actualCost) : undefined;

    let updatedBudgetItems: BudgetItem[];

    if (editingItem) {
      updatedBudgetItems = activeEvent.budgetItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name.trim(),
              category: formData.category,
              estimatedCost: estCost,
              actualCost: actCost,
              notes: formData.notes.trim(),
              paidStatus: formData.paidStatus,
            }
          : item
      );
      showToast(`Updated expense "${formData.name}"`, 'success');
    } else {
      const newItem: BudgetItem = {
        id: 'b-' + Date.now(),
        name: formData.name.trim(),
        category: formData.category,
        estimatedCost: estCost,
        actualCost: actCost,
        isEstimate: true,
        notes: formData.notes.trim(),
        paidStatus: formData.paidStatus,
      };
      updatedBudgetItems = [...activeEvent.budgetItems, newItem];
      showToast(`Added expense "${formData.name}"`, 'success');
    }

    onUpdateEvent({
      ...activeEvent,
      budgetItems: updatedBudgetItems,
      updatedAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (window.confirm(`Delete expense item "${itemName}"?`)) {
      const updated = activeEvent.budgetItems.filter((i) => i.id !== itemId);
      onUpdateEvent({
        ...activeEvent,
        budgetItems: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Removed "${itemName}" from budget.`, 'info');
    }
  };

  const filteredItems = activeEvent.budgetItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchNotes = item.notes?.toLowerCase().includes(query);
      return matchName || matchNotes;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Overview with Glass Styling */}
      <div 
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">Deterministic Financial Engine</span>
              <span className="badge badge-estimate">[ALL AI FIGURES ARE ESTIMATES]</span>
              {budgetSummary.isOverBudget && (
                <span className="badge badge-danger">
                  ⚠️ Deficit: ${budgetSummary.overBudgetAmount.toLocaleString()}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.85rem' }}>Budget & Expense Architect</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Real-time balance tracking, category allocations, and dynamic over-budget alerts.
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => openAddModal()}>
            <Plus size={16} />
            <span>Add Expense Item</span>
          </button>
        </div>

        {/* 4 Key Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
        }}>
          {/* Total Budget Target */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Allocated Target</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              ${budgetSummary.totalBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Configured target ceiling
            </div>
          </div>

          {/* Total Estimated Cost */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Estimated Spend</span>
              <span className="badge badge-estimate" style={{ padding: '0.1rem 0.35rem' }}>Est</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--primary-600)', marginTop: '0.2rem' }}>
              ${budgetSummary.totalEstimated.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {budgetSummary.percentageUsed}% of allocated budget
            </div>
          </div>

          {/* Confirmed Actual Spend */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confirmed Actual Paid</span>
              <Receipt size={14} color="var(--sage-600)" />
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--sage-700)', marginTop: '0.2rem' }}>
              ${budgetSummary.totalActual.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {budgetSummary.insights.hasActualsRecorded ? 'Reconciled paid deposits' : 'No actuals entered yet'}
            </div>
          </div>

          {/* Remaining Balance / Deficit */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {budgetSummary.isOverBudget ? 'Budget Deficit' : 'Remaining Allowance'}
            </div>
            <div style={{ 
              fontSize: '1.65rem', 
              fontWeight: 700, 
              color: budgetSummary.remainingBudget < 0 ? 'var(--danger-text)' : 'var(--success-text)', 
              marginTop: '0.2rem' 
            }}>
              ${budgetSummary.remainingBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {budgetSummary.remainingBudget < 0 ? 'Deficit - review red categories' : 'Available for allocation'}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div style={{ marginTop: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            <span>Overall Budget Consumption ({budgetSummary.totalEstimated.toLocaleString()} / ${budgetSummary.totalBudget.toLocaleString()})</span>
            <span style={{ fontWeight: 600, color: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--text-primary)' }}>
              {budgetSummary.percentageUsed}% {budgetSummary.isOverBudget && '⚠️ EXCEEDED ALLOCATION'}
            </span>
          </div>
          <div className="progress-track" style={{ height: '10px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(100, budgetSummary.percentageUsed)}%`,
                background: budgetSummary.isOverBudget ? 'var(--danger-text)' : 'var(--primary-500)' 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Over Budget Alert Banner */}
      {budgetSummary.isOverBudget && (
        <div className="alert-box alert-danger" role="alert">
          <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
              Warning: Estimated Expenses Exceed Allocated Budget by ${budgetSummary.overBudgetAmount.toLocaleString()}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.45 }}>
              Your current estimated line items sum to <strong>${budgetSummary.totalEstimated.toLocaleString()}</strong>, which surpasses the allocated budget target of <strong>${budgetSummary.totalBudget.toLocaleString()}</strong>. 
              Review categories highlighted below to trim secondary rentals, adjust guest counts, or reallocate funds.
            </p>
          </div>
        </div>
      )}

      {/* Dedicated Budget Visualizations & Analytics Section */}
      <section aria-label="Budget Analytics & Visualizations">
        <BudgetAnalytics 
          summary={budgetSummary}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </section>

      {/* Category Breakdown Cards */}
      <section aria-label="Category Targets & Distribution">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Category Distribution & Targets</h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Click any category to filter the expense table below
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {Object.values(budgetSummary.categories).map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <div 
                key={cat.category}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
                className="card"
                style={{
                  padding: '1.15rem 1.25rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary-500)' : cat.isOverAllocated ? 'var(--danger-border)' : 'var(--border-subtle)',
                  background: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                  boxShadow: isSelected ? '0 0 0 2px var(--primary-500)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: cat.color }} />
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{cat.label}</span>
                  </div>
                  {cat.isOverAllocated && (
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                      +${cat.varianceAmount.toLocaleString()} Over
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: cat.isOverAllocated ? 'var(--danger-text)' : 'var(--text-primary)' }}>
                    ${cat.totalEstimated.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Target: ${cat.allocatedAmount.toLocaleString()} ({cat.allocatedPercentage}%)
                  </span>
                </div>

                <div className="progress-track" style={{ height: '6px' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(100, cat.allocatedAmount > 0 ? (cat.totalEstimated / cat.allocatedAmount) * 100 : 0)}%`,
                      background: cat.isOverAllocated ? 'var(--danger-text)' : cat.color 
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{cat.itemCount} line item{cat.itemCount === 1 ? '' : 's'}</span>
                  <span style={{ color: isSelected ? 'var(--primary-700)' : 'var(--primary-600)', fontWeight: 600 }}>
                    {isSelected ? '✓ Filtered' : 'Click to filter'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Itemized Expenses Table */}
      <section className="card" aria-label="Itemized Line Items">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="card-title">
            <DollarSign size={18} color="var(--primary-500)" />
            <span>Itemized Line Items ({filteredItems.length})</span>
            {selectedCategory !== 'all' && (
              <span className="badge badge-coral">
                Filtered: {BUDGET_CATEGORY_METADATA[selectedCategory]?.label}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search expense items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2rem', paddingRight: '0.75rem', fontSize: '0.82rem', height: '34px' }}
              />
            </div>

            {selectedCategory !== 'all' && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCategory('all')}
              >
                <span>Reset Category</span>
              </button>
            )}

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => openAddModal(selectedCategory !== 'all' ? selectedCategory : undefined)}
            >
              <Plus size={15} />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Wallet size={36} color="var(--border-medium)" style={{ margin: '0 auto 0.5rem' }} />
            <p>No expense items match the current filters.</p>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ marginTop: '0.75rem' }}
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name & Description</th>
                  <th>Category</th>
                  <th>Estimated Cost</th>
                  <th>Actual Paid</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      {item.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {BUDGET_CATEGORY_METADATA[item.category]?.label || item.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 600 }}>${item.estimatedCost.toLocaleString()}</span>
                        {item.isEstimate && (
                          <span className="badge badge-estimate">[EST]</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.actualCost !== undefined ? (
                        <span style={{ fontWeight: 600, color: 'var(--sage-700)' }}>
                          ${item.actualCost.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          — (No actual)
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        item.paidStatus === 'paid_in_full' ? 'badge-success' : 
                        item.paidStatus === 'deposit_paid' ? 'badge-warning' : 'badge-neutral'
                      }`} style={{ fontSize: '0.72rem' }}>
                        {item.paidStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditModal(item)}
                          title="Edit line item"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          title="Delete line item"
                          aria-label={`Delete ${item.name}`}
                          style={{ color: 'var(--danger-text)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-expense-title">
            <div className="modal-header">
              <h2 id="modal-expense-title" style={{ fontSize: '1.25rem' }}>
                {editingItem ? 'Edit Expense Item' : 'Add New Expense Item'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="expense-name">Expense Item Name *</label>
                  <input
                    id="expense-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Venue deposit, Wedding cake, String trio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="expense-category">Category *</label>
                    <select
                      id="expense-category"
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
                    <label className="form-label" htmlFor="expense-status">Payment Status</label>
                    <select
                      id="expense-status"
                      className="form-select"
                      value={formData.paidStatus}
                      onChange={(e) => setFormData({ ...formData, paidStatus: e.target.value as PaidStatus })}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="paid_in_full">Paid in Full</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="expense-est">Estimated Cost ($) *</label>
                    <input
                      id="expense-est"
                      type="number"
                      step="1"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 1500"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    />
                    {formErrors.estimatedCost && <div className="form-error">{formErrors.estimatedCost}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="expense-act">Confirmed Actual Cost ($) (optional)</label>
                    <input
                      id="expense-act"
                      type="number"
                      step="1"
                      min="0"
                      className="form-input"
                      placeholder="Leave blank if no actuals paid"
                      value={formData.actualCost}
                      onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="expense-notes">Notes / Vendor Inclusions</label>
                  <textarea
                    id="expense-notes"
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Includes setup, teardown, and 2 service staff"
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
                  {editingItem ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
