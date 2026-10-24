import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  X, 
  Key, 
  Cpu, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Info
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
  settings,
  onSaveSettings,
  onResetData,
  showToast,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-2.5-flash');
  const [preferOfflineDemo, setPreferOfflineDemo] = useState(settings.preferOfflineDemo);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: apiKey.trim(),
      model,
      preferOfflineDemo,
    });
    showToast('Settings saved successfully!', 'success');
    onClose();
  };

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

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Mode Explanation Notice */}
            <div style={{
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.84rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                <ShieldCheck size={16} />
                <span>Google PromptWars Transparency Guarantee</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Celebrio AI supports two authentic modes: <strong>Deterministic Offline Mode</strong> (complete, personalized event plans without requiring an API key) and <strong>Live Gemini AI</strong>. It never pretends offline responses came from a live model.
              </p>
            </div>

            {/* Offline vs Live Mode Selection */}
            <div className="form-group">
              <label className="form-label">Planning AI Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div 
                  onClick={() => setPreferOfflineDemo(true)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${preferOfflineDemo ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                    background: preferOfflineDemo ? 'var(--primary-50)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: preferOfflineDemo ? 'var(--primary-700)' : 'var(--text-primary)' }}>
                      Deterministic Demo
                    </strong>
                    {preferOfflineDemo && <Check size={14} color="var(--primary-500)" />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Immediate offline execution. Zero API key setup required.
                  </div>
                </div>

                <div 
                  onClick={() => setPreferOfflineDemo(false)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${!preferOfflineDemo ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
                    background: !preferOfflineDemo ? 'var(--gold-50)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: !preferOfflineDemo ? 'var(--gold-600)' : 'var(--text-primary)' }}>
                      Live Gemini AI
                    </strong>
                    {!preferOfflineDemo && <Check size={14} color="var(--gold-500)" />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Requires your Google Gemini API key below.
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini API Key */}
            <div className="form-group">
              <label className="form-label" htmlFor="api-key" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Key size={14} />
                <span>Google Gemini API Key</span>
              </label>
              <input
                id="api-key"
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={12} color="var(--success-text)" />
                <span>Stored securely in local browser storage only. Never sent to third-party servers.</span>
              </div>
            </div>

            {/* Model Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="model-select" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cpu size={14} />
                <span>Gemini Model</span>
              </label>
              <select
                id="model-select"
                className="form-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Ultra Fast)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              </select>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
