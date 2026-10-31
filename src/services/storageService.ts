import { EventPlan, AppSettings } from '../types';
import { getSampleEvents } from './sampleData';

const STORAGE_KEYS = {
  EVENTS: 'celebrio_events_v1',
  ACTIVE_EVENT_ID: 'celebrio_active_event_id_v1',
  SETTINGS: 'celebrio_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  engineMode: 'deterministic_offline',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS };
  } catch (e: unknown) {
    console.error('Failed to load settings from localStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e: unknown) {
    console.error('Failed to save settings:', e);
  }
}

export function loadAllEvents(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      // First time initialization: populate with sample events
      const samples = getSampleEvents();
      saveAllEvents(samples);
      return samples;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const samples = getSampleEvents();
      saveAllEvents(samples);
      return samples;
    }
    return parsed;
  } catch (e: unknown) {
    console.error('Failed to load events from storage, restoring samples:', e);
    const samples = getSampleEvents();
    saveAllEvents(samples);
    return samples;
  }
}

export function saveAllEvents(events: EventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e: unknown) {
    console.error('Failed to save events to localStorage:', e);
  }
}

export function loadActiveEventId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || '';
  } catch {
    return '';
  }
}

export function saveActiveEventId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
  } catch (e: unknown) {
    console.error('Failed to save active event id:', e);
  }
}

export function resetToSampleEvents(): EventPlan[] {
  const samples = getSampleEvents();
  saveAllEvents(samples);
  saveActiveEventId(samples[0].id);
  return samples;
}

export function exportPlanAsJSON(event: EventPlan): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_plan.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
