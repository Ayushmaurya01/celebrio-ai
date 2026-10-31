import React from 'react';
import { AppSettings } from '../types';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { 
  X, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Zap
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  showToast,
}) => {
  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('Reset all events and restore default sample templates? Custom changes will be reset.')) {
      onResetData();
      showToast('Restored default celebration plans!', 'info');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-settings-title"
        style={{ maxWidth: '580px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--primary-500)" />
            <h2 id="modal-settings-title" style={{ fontSize: '1.25rem' }}>
              Celebrio AI Configuration
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Architecture & Guarantee Notice */}
          <div style={{
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-medium)',
            fontSize: '0.86rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.35rem' }}>
              <ShieldCheck size={18} />
              <span>100% Deterministic Offline Architecture</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Celebrio AI operates entirely in deterministic offline mode with zero external network dependencies. It provides complete, bespoke event blueprints, menus, and conversational refinement without requiring client-side API keys.
            </p>
          </div>

          {/* Engine Highlights Card */}
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-50)',
            border: '1.5px solid var(--primary-100)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--primary-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="var(--primary-600)" />
                Deterministic Planning Engine
              </strong>
              <span className="badge badge-coral" style={{ fontSize: '0.72rem' }}>
                Active & Offline
              </span>
            </div>
            
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.2rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <li>Immediate algorithmic generation for theme titles, color swatches, culinary menus, and decor.</li>
              <li>Interactive concierge chat providing contextual replies and actionable 1-click event modifications.</li>
              <li>Strict mathematical accuracy for itemized budgets, estimate calculations, and deficit alerts.</li>
            </ul>
          </div>

          {/* Privacy & Security Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}>
            <Lock size={16} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                Client-Side Privacy Guarantee
              </strong>
              All event plans, budgets, vendor contracts, and personal guest notes are stored exclusively in your local browser storage (<code style={{ fontSize: '0.75rem' }}>localStorage</code>). No data or credentials are ever transmitted over external networks.
            </div>
          </div>

          {/* Reset Sample Data */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Reset Sample Events</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Restore pre-loaded Wedding, Birthday & Gala templates
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
