import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

import { ToastItem, ToastType } from '../types';
export type { ToastItem, ToastType };

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'warning' ? AlertCircle : Info;
        const iconColor = toast.type === 'success' ? 'var(--sage-500)' : toast.type === 'warning' ? 'var(--gold-500)' : 'var(--primary-500)';

        return (
          <div key={toast.id} className="toast">
            <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button 
              onClick={() => onDismiss(toast.id)} 
              className="btn-icon" 
              style={{ padding: '2px', color: '#FFF' }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
