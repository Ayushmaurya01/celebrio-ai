import { useState, useEffect } from 'react';
import { EventPlan, AppSettings, BudgetItem, VendorTask, TimelineMilestone, MilestoneStatus } from './types';
import { 
  loadAllEvents, 
  saveAllEvents, 
  loadActiveEventId, 
  saveActiveEventId, 
  loadSettings, 
  saveSettings, 
  resetToSampleEvents 
} from './services/storageService';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { AIPlannerView } from './components/AIPlannerView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { TimelineView } from './components/TimelineView';
import { VendorChecklistView } from './components/VendorChecklistView';
import { SavedPlansView } from './components/SavedPlansView';
import { EventCreationModal } from './components/EventCreationModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast, ToastItem } from './components/Toast';

export function App() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 900;
    }
    return true;
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventForModal, setEditingEventForModal] = useState<EventPlan | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    const loadedEvents = loadAllEvents();
    setEvents(loadedEvents);

    const savedActiveId = loadActiveEventId();
    if (savedActiveId && loadedEvents.some((e) => e.id === savedActiveId)) {
      setActiveEventId(savedActiveId);
    } else if (loadedEvents.length > 0) {
      setActiveEventId(loadedEvents[0].id);
      saveActiveEventId(loadedEvents[0].id);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  // Event handlers
  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    saveActiveEventId(id);
    setCurrentTab('dashboard');
  };

  const handleUpdateActiveEvent = (updated: EventPlan) => {
    const updatedEvents = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(updatedEvents);
    saveAllEvents(updatedEvents);
  };

  const handleSaveEvent = (savedEvent: EventPlan) => {
    const exists = events.some((e) => e.id === savedEvent.id);
    let newEvents: EventPlan[];

    if (exists) {
      newEvents = events.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      showToast(`Updated "${savedEvent.name}"`, 'success');
    } else {
      newEvents = [savedEvent, ...events];
      showToast(`Created new plan "${savedEvent.name}"!`, 'success');
    }

    setEvents(newEvents);
    saveAllEvents(newEvents);
    setActiveEventId(savedEvent.id);
    saveActiveEventId(savedEvent.id);
    setCurrentTab('dashboard');
  };

  const handleDuplicateEvent = (eventToDup: EventPlan) => {
    const duplicated: EventPlan = {
      ...eventToDup,
      id: 'event-' + Date.now(),
      name: `${eventToDup.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newEvents = [duplicated, ...events];
    setEvents(newEvents);
    saveAllEvents(newEvents);
    setActiveEventId(duplicated.id);
    saveActiveEventId(duplicated.id);
    showToast(`Duplicated "${eventToDup.name}"!`, 'success');
  };

  const handleDeleteEvent = (id: string, name: string) => {
    if (events.length <= 1) {
      showToast('Cannot delete the only remaining plan.', 'warning');
      return;
    }

    if (window.confirm(`Delete celebration plan "${name}"?`)) {
      const remaining = events.filter((e) => e.id !== id);
      setEvents(remaining);
      saveAllEvents(remaining);

      if (activeEventId === id) {
        const nextActive = remaining[0].id;
        setActiveEventId(nextActive);
        saveActiveEventId(nextActive);
      }
      showToast(`Deleted "${name}".`, 'info');
    }
  };

  const handleImportEvent = (imported: EventPlan) => {
    const newEvents = [imported, ...events];
    setEvents(newEvents);
    saveAllEvents(newEvents);
    setActiveEventId(imported.id);
    saveActiveEventId(imported.id);
    setCurrentTab('dashboard');
  };

  const handleResetSampleData = () => {
    const restored = resetToSampleEvents();
    setEvents(restored);
    setActiveEventId(restored[0].id);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Quick Action Injections
  const handleAddBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    if (!activeEvent) return;
    const newItem: BudgetItem = {
      ...item,
      id: 'b-' + Date.now(),
    };
    handleUpdateActiveEvent({
      ...activeEvent,
      budgetItems: [...activeEvent.budgetItems, newItem],
    });
  };

  const handleAddVendorTask = (task: Omit<VendorTask, 'id'>) => {
    if (!activeEvent) return;
    const newTask: VendorTask = {
      ...task,
      id: 'vt-' + Date.now(),
    };
    handleUpdateActiveEvent({
      ...activeEvent,
      vendorTasks: [...activeEvent.vendorTasks, newTask],
    });
  };

  const handleAddMilestone = (milestone: Omit<TimelineMilestone, 'id'>) => {
    if (!activeEvent) return;
    const newM: TimelineMilestone = {
      ...milestone,
      id: 'm-' + Date.now(),
    };
    handleUpdateActiveEvent({
      ...activeEvent,
      timeline: [...activeEvent.timeline, newM],
    });
  };

  const handleToggleTaskComplete = (taskId: string) => {
    if (!activeEvent) return;
    const updated = activeEvent.vendorTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    handleUpdateActiveEvent({
      ...activeEvent,
      vendorTasks: updated,
    });
  };

  const handleToggleMilestoneStatus = (milestoneId: string) => {
    if (!activeEvent) return;
    const updated = activeEvent.timeline.map((m) => {
      if (m.id !== milestoneId) return m;
      const nextStatus: MilestoneStatus = m.status === 'completed' ? 'pending' : 'completed';
      return { ...m, status: nextStatus };
    });
    handleUpdateActiveEvent({
      ...activeEvent,
      timeline: updated,
    });
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopBar
          activeEvent={activeEvent}
          allEvents={events}
          onSelectEvent={handleSelectEvent}
          onOpenNewEventModal={() => {
            setEditingEventForModal(null);
            setIsEventModalOpen(true);
          }}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onNavigate={setCurrentTab}
          settings={settings}
        />

        <main className="page-body">
          {activeEvent ? (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  activeEvent={activeEvent}
                  onNavigate={setCurrentTab}
                  onToggleTaskComplete={handleToggleTaskComplete}
                  onToggleMilestoneStatus={handleToggleMilestoneStatus}
                />
              )}

              {currentTab === 'ai_planner' && (
                <AIPlannerView
                  activeEvent={activeEvent}
                  onUpdateEvent={handleUpdateActiveEvent}
                  settings={settings}
                  onAddBudgetItem={handleAddBudgetItem}
                  onAddVendorTask={handleAddVendorTask}
                  onAddMilestone={handleAddMilestone}
                  showToast={showToast}
                />
              )}

              {currentTab === 'budget' && (
                <BudgetPlannerView
                  activeEvent={activeEvent}
                  onUpdateEvent={handleUpdateActiveEvent}
                  showToast={showToast}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelineView
                  activeEvent={activeEvent}
                  onUpdateEvent={handleUpdateActiveEvent}
                  showToast={showToast}
                />
              )}

              {currentTab === 'vendors' && (
                <VendorChecklistView
                  activeEvent={activeEvent}
                  onUpdateEvent={handleUpdateActiveEvent}
                  showToast={showToast}
                />
              )}

              {currentTab === 'saved_plans' && (
                <SavedPlansView
                  allEvents={events}
                  activeEventId={activeEventId}
                  onSelectEvent={handleSelectEvent}
                  onOpenNewEventModal={() => {
                    setEditingEventForModal(null);
                    setIsEventModalOpen(true);
                  }}
                  onOpenEditEventModal={(ev) => {
                    setEditingEventForModal(ev);
                    setIsEventModalOpen(true);
                  }}
                  onDuplicateEvent={handleDuplicateEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onImportEvent={handleImportEvent}
                  showToast={showToast}
                />
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <h2>Welcome to Celebrio AI</h2>
              <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Let's begin by creating your first celebration plan.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingEventForModal(null);
                  setIsEventModalOpen(true);
                }}
              >
                Create Celebration
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Toasts */}
      <EventCreationModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEventForModal}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={handleResetSampleData}
        showToast={showToast}
      />

      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;
