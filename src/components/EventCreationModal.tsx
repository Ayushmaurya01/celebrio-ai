import React, { useState, useEffect } from 'react';
import { EventPlan, EventType } from '../types';
import { validateEventForm } from '../services/validationService';
import { generateInitialBudgetItems } from '../services/budgetService';
import { generateInitialMilestones } from '../services/timelineService';
import { generateInitialVendorTasks } from '../services/vendorTaskService';
import { generateDeterministicPlan } from '../services/aiPlannerService';
import { 
  X, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Tag, 
  Palette, 
  Music, 
  Utensils 
} from 'lucide-react';

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: EventPlan) => void;
  editingEvent?: EventPlan | null;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
}) => {
  const [formData, setFormData] = useState<Partial<EventPlan>>({
    name: '',
    type: 'wedding',
    date: '',
    time: '16:00',
    location: '',
    venueType: 'indoor',
    guestCount: 100,
    totalBudget: 15000,
    themeKeywords: '',
    preferences: {
      formality: 'semi-formal',
      colorScheme: '',
      dietaryNotes: '',
      musicPreference: '',
      specialRequests: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        name: editingEvent.name,
        type: editingEvent.type,
        date: editingEvent.date,
        time: editingEvent.time || '16:00',
        location: editingEvent.location,
        venueType: editingEvent.venueType || 'indoor',
        guestCount: editingEvent.guestCount,
        totalBudget: editingEvent.totalBudget,
        themeKeywords: editingEvent.themeKeywords || '',
        preferences: {
          formality: editingEvent.preferences?.formality || 'semi-formal',
          colorScheme: editingEvent.preferences?.colorScheme || '',
          dietaryNotes: editingEvent.preferences?.dietaryNotes || '',
          musicPreference: editingEvent.preferences?.musicPreference || '',
          specialRequests: editingEvent.preferences?.specialRequests || '',
        },
      });
    } else {
      // Default future date: 3 months from today
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      const dateStr = defaultDate.toISOString().split('T')[0];

      setFormData({
        name: '',
        type: 'wedding',
        date: dateStr,
        time: '16:00',
        location: '',
        venueType: 'hybrid',
        guestCount: 100,
        totalBudget: 25000,
        themeKeywords: '',
        preferences: {
          formality: 'semi-formal',
          colorScheme: 'Ivory, Rose Gold & Sage Green',
          dietaryNotes: 'Vegetarian and gluten-free options',
          musicPreference: 'Acoustic welcome + Live energetic DJ',
          specialRequests: '',
        },
      });
    }
    setErrors({});
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateEventForm(formData);
    if (!validation.isValid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    if (editingEvent) {
      // Update existing
      const updated: EventPlan = {
        ...editingEvent,
        name: formData.name!.trim(),
        type: formData.type!,
        date: formData.date!,
        time: formData.time,
        location: formData.location!.trim(),
        venueType: formData.venueType,
        guestCount: Number(formData.guestCount),
        totalBudget: Number(formData.totalBudget),
        themeKeywords: formData.themeKeywords?.trim() || '',
        preferences: {
          ...formData.preferences,
        },
        updatedAt: new Date().toISOString(),
      };
      onSave(updated);
    } else {
      // Create new event plan and seed intelligent budget, timeline, vendor checklist, and AI plan
      const newPlanBase: EventPlan = {
        id: 'event-' + Date.now(),
        name: formData.name!.trim(),
        type: formData.type!,
        date: formData.date!,
        time: formData.time,
        location: formData.location!.trim(),
        venueType: formData.venueType,
        guestCount: Number(formData.guestCount),
        totalBudget: Number(formData.totalBudget),
        themeKeywords: formData.themeKeywords?.trim() || '',
        preferences: {
          ...formData.preferences,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        budgetItems: [],
        timeline: [],
        vendorTasks: [],
        chatHistory: [],
      };

      newPlanBase.budgetItems = generateInitialBudgetItems(
        newPlanBase.totalBudget,
        newPlanBase.type,
        newPlanBase.guestCount
      );
      newPlanBase.timeline = generateInitialMilestones(newPlanBase.date, newPlanBase.type);
      newPlanBase.vendorTasks = generateInitialVendorTasks(newPlanBase.date, newPlanBase.type);
      newPlanBase.aiPlan = generateDeterministicPlan(newPlanBase);

      onSave(newPlanBase);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog" 
        aria-labelledby="modal-event-title"
        style={{ maxWidth: '720px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-500)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 id="modal-event-title" style={{ fontSize: '1.25rem' }}>
                {editingEvent ? 'Edit Celebration Parameters' : 'Create New Celebration Plan'}
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Celebrio AI will personalize budgets, schedules, and styling concepts.
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh' }}>
            {/* Event Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="ev-name">Event / Celebration Name *</label>
              <input
                id="ev-name"
                type="text"
                className="form-input"
                placeholder="e.g. Maya & Liam's Tuscan Villa Wedding, Sofia's 25th Sunset Soiree"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Type & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-type">Celebration Type *</label>
                <select
                  id="ev-type"
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                >
                  <option value="wedding">💍 Wedding</option>
                  <option value="birthday">🎂 Milestone Birthday</option>
                  <option value="community">🎪 Community Festival / Gala</option>
                  <option value="anniversary">🥂 Anniversary</option>
                  <option value="baby_shower">👶 Baby Shower</option>
                  <option value="corporate">💼 Corporate Celebration</option>
                  <option value="other">✨ Other Celebration</option>
                </select>
                {errors.type && <div className="form-error">{errors.type}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-date">Celebration Date *</label>
                <input
                  id="ev-date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {errors.date && <div className="form-error">{errors.date}</div>}
              </div>
            </div>

            {/* Location & Venue Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-location">Location / Venue Name *</label>
                <input
                  id="ev-location"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Villa San Michele, Florence or Central Park Pavilion"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                {errors.location && <div className="form-error">{errors.location}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-venuetype">Venue Setting</label>
                <select
                  id="ev-venuetype"
                  className="form-select"
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value as any })}
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="hybrid">Hybrid (Indoor + Garden)</option>
                  <option value="destination">Destination</option>
                </select>
              </div>
            </div>

            {/* Guest Count & Total Budget */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-guests">Estimated Guest Count *</label>
                <input
                  id="ev-guests"
                  type="number"
                  min="1"
                  step="1"
                  className="form-input"
                  placeholder="e.g. 120"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                />
                {errors.guestCount && <div className="form-error">{errors.guestCount}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-budget">Total Allocated Budget ($) *</label>
                <input
                  id="ev-budget"
                  type="number"
                  min="1"
                  step="100"
                  className="form-input"
                  placeholder="e.g. 25000"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                />
                {errors.totalBudget && <div className="form-error">{errors.totalBudget}</div>}
              </div>
            </div>

            {/* Theme & Aesthetic Keywords */}
            <div className="form-group">
              <label className="form-label" htmlFor="ev-theme">Theme & Aesthetic Vibe Keywords</label>
              <input
                id="ev-theme"
                type="text"
                className="form-input"
                placeholder="e.g. Boho Terracotta, Vintage Gatsby 1920s, French Countryside Lavender"
                value={formData.themeKeywords}
                onChange={(e) => setFormData({ ...formData, themeKeywords: e.target.value })}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Celebrio AI uses this to craft bespoke color palettes, decor items, and playlists.
              </div>
            </div>

            {/* Custom Preferences Accordion / Sub-fields */}
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              marginTop: '0.5rem',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-700)', marginBottom: '0.75rem' }}>
                Planning Preferences & Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" htmlFor="pref-formality" style={{ fontSize: '0.8rem' }}>Formality</label>
                  <select
                    id="pref-formality"
                    className="form-select"
                    value={formData.preferences?.formality}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, formality: e.target.value as any }
                    })}
                  >
                    <option value="casual">Casual / Relaxed</option>
                    <option value="semi-formal">Semi-Formal / Cocktail</option>
                    <option value="black-tie">Black-Tie / Gala</option>
                    <option value="traditional">Traditional / Cultural</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="pref-colors" style={{ fontSize: '0.8rem' }}>Color Palette</label>
                  <input
                    id="pref-colors"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rose Gold, Sage, Warm Ivory"
                    value={formData.preferences?.colorScheme}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, colorScheme: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" htmlFor="pref-dietary" style={{ fontSize: '0.8rem' }}>Dietary & Catering Notes</label>
                  <input
                    id="pref-dietary"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vegetarian heavy, 3 nut allergies"
                    value={formData.preferences?.dietaryNotes}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, dietaryNotes: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="pref-music" style={{ fontSize: '0.8rem' }}>Music & Entertainment Taste</label>
                  <input
                    id="pref-music"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 90s Throwbacks, Acoustic Strings"
                    value={formData.preferences?.musicPreference}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, musicPreference: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              <span>{editingEvent ? 'Save Changes' : 'Generate Event Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
