import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Wallet, 
  CalendarClock, 
  CheckSquare, 
  FolderHeart, 
  X,
  HeartHandshake
} from 'lucide-react';

import { NavigationTab } from '../types';
export type { NavigationTab };

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai_planner' as NavigationTab, label: 'AI Planning & Chat', icon: Sparkles },
    { id: 'budget' as NavigationTab, label: 'Budget Planner', icon: Wallet },
    { id: 'timeline' as NavigationTab, label: 'Timeline & Schedule', icon: CalendarClock },
    { id: 'vendors' as NavigationTab, label: 'Vendors & Tasks', icon: CheckSquare },
    { id: 'saved_plans' as NavigationTab, label: 'Saved Event Plans', icon: FolderHeart },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      
      <aside 
        className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} 
        role="navigation" 
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 2px 10px rgba(26, 115, 232, 0.35)'
            }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.1 }}>
                Celebrio<span style={{ color: 'var(--primary-500)', fontStyle: 'italic' }}> AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Celebration Planner
              </div>
            </div>
          </div>

          <button 
            className="btn-icon sidebar-close-btn" 
            onClick={onClose} 
            title="Collapse sidebar"
            aria-label="Close sidebar"
            style={{ cursor: 'pointer', display: 'inline-flex' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.5rem', flex: 1 }}>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            padding: '0 1rem 0.5rem 1rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em' 
          }}>
            Planning Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
                    onClose();
                  }
                }}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ width: 'calc(100% - 1.5rem)', textAlign: 'left' }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Challenge Footer Badge */}
        <div style={{ 
          padding: '1.25rem', 
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)' 
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            marginBottom: '0.25rem' 
          }}>
            <Sparkles size={14} color="var(--gold-500)" />
            <strong>PromptWars C5 Edition</strong>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Google GenAI Event Architect
          </div>
        </div>
      </aside>
    </>
  );
};
