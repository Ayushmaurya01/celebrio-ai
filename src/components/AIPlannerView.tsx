import { useState } from 'react';
import { EventPlan, AppSettings, BudgetItem, VendorTask, TimelineMilestone, BudgetCategory, SuggestedAction } from '../types';
import { generateAIEventPlan, sendChatMessageToPlanner } from '../services/aiPlannerService';
import { generateId } from '../utils/idUtils';
import { PlanSectionCard } from './PlanSectionCard';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Sparkle, 
  Utensils, 
  Music, 
  Compass, 
  Lightbulb, 
  Bot, 
  User, 
  PlusCircle, 
  Check
} from 'lucide-react';

interface AIPlannerViewProps {
  activeEvent: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
  settings: AppSettings;
  onAddBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  onAddVendorTask: (task: Omit<VendorTask, 'id'>) => void;
  onAddMilestone: (milestone: Omit<TimelineMilestone, 'id'>) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  activeEvent,
  onUpdateEvent,
  settings,
  onAddBudgetItem,
  onAddVendorTask,
  onAddMilestone,
  showToast,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'chat'>('blueprint');
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});
  const [adoptedItems, setAdoptedItems] = useState<Record<string, boolean>>({});

  const isLiveAI = Boolean(settings.geminiApiKey && !settings.preferOfflineDemo);

  const handleRegeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generateAIEventPlan(activeEvent, {
        apiKey: settings.geminiApiKey,
        model: settings.model,
        forceOffline: settings.preferOfflineDemo,
      });

      onUpdateEvent({
        ...activeEvent,
        aiPlan: plan,
        updatedAt: new Date().toISOString(),
      });

      showToast(
        plan.isLiveAI 
          ? 'Live Gemini AI event plan generated successfully!' 
          : 'Deterministic event plan refreshed!',
        'success'
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Plan generation failed: ${errorMsg}`, 'warning');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || chatInput;
    if (!query.trim()) return;

    const userMsg = {
      id: generateId('usr'),
      sender: 'user' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query.trim(),
      isLiveAI: false,
    };

    const newHistory = [...activeEvent.chatHistory, userMsg];
    onUpdateEvent({
      ...activeEvent,
      chatHistory: newHistory,
    });
    setChatInput('');
    setIsSendingMessage(true);

    try {
      const assistantMsg = await sendChatMessageToPlanner(
        query,
        activeEvent,
        newHistory,
        {
          apiKey: settings.geminiApiKey,
          model: settings.model,
          forceOffline: settings.preferOfflineDemo,
        }
      );

      onUpdateEvent({
        ...activeEvent,
        chatHistory: [...newHistory, assistantMsg],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reply';
      showToast(`Assistant error: ${errorMsg}`, 'warning');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const executeAction = (action: SuggestedAction, actionKey: string) => {
    setAppliedActions((prev) => ({ ...prev, [actionKey]: true }));
    if (action.actionType === 'add_expense') {
      onAddBudgetItem({
        category: action.payload.category || 'miscellaneous',
        name: action.payload.name || 'AI Suggested Item',
        estimatedCost: action.payload.estimatedCost || 100,
        isEstimate: true,
        notes: action.payload.notes || 'Added from AI Assistant chat',
        paidStatus: 'unpaid',
      });
      showToast(`Added "${action.payload.name}" to budget planner!`, 'success');
    } else if (action.actionType === 'add_task') {
      onAddVendorTask({
        title: action.payload.title || 'AI Task',
        category: action.payload.category || 'miscellaneous',
        estimatedCost: action.payload.estimatedCost || 0,
        priority: action.payload.priority || 'medium',
        dueDate: activeEvent.date,
        notes: action.payload.notes || 'Suggested by AI Assistant',
        bookingStatus: 'inquiry',
        completed: false,
      });
      showToast(`Added "${action.payload.title}" to vendor tasks!`, 'success');
    } else if (action.actionType === 'add_milestone') {
      onAddMilestone({
        title: action.payload.title || 'AI Milestone',
        description: action.payload.description || '',
        category: action.payload.category || 'general',
        targetDate: activeEvent.date,
        status: 'pending',
        isDayOfAgenda: false,
      });
      showToast(`Added "${action.payload.title}" to event timeline!`, 'success');
    } else if (action.actionType === 'refine_theme') {
      if (action.payload.themeKeywords) {
        onUpdateEvent({
          ...activeEvent,
          themeKeywords: action.payload.themeKeywords,
        });
        showToast(`Updated theme: ${action.payload.themeKeywords}`, 'success');
      }
    }
  };

  const handleAdoptItem = (itemText: string, category: BudgetCategory, itemKey: string) => {
    onAddVendorTask({
      title: itemText,
      category,
      estimatedCost: 0,
      priority: 'medium',
      dueDate: activeEvent.date,
      notes: `Curated from AI Event Blueprint (${activeEvent.aiPlan?.themeTitle || 'Theme Concept'})`,
      bookingStatus: 'inquiry',
      completed: false,
    });
    setAdoptedItems((prev) => ({ ...prev, [itemKey]: true }));
    showToast(`Added to Vendor & Deliverables Checklist!`, 'success');
  };

  const samplePrompts = [
    'How do we handle catering if 15% of guests are vegetarian?',
    'Suggest 3 signature cocktails matching our theme & color palette',
    'What should our Plan B be if it rains on the outdoor venue?',
    'Where can we trim $1,500 without impacting guest experience?',
    'What music flow works best from cocktail hour through peak dancing?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Mode Banner */}
      <div 
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.2rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: isLiveAI ? 'var(--gold-500)' : 'var(--primary-500)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '1rem' }}>
                {isLiveAI ? 'Live Gemini AI Assistant' : 'Deterministic AI Planning Engine'}
              </strong>
              <span className={`badge ${isLiveAI ? 'badge-gold' : 'badge-coral'}`}>
                {isLiveAI ? `Active (${settings.model})` : 'Offline Demo Mode'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-secondary)' }}>
              {isLiveAI
                ? 'Connected directly to Google Gemini API with dynamic multimodal reasoning.'
                : 'Deterministic, tailored event architect producing concrete plans without requiring an API key. (Never mocks live status).'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleRegeneratePlan}
            disabled={isGeneratingPlan}
          >
            <RefreshCw size={14} className={isGeneratingPlan ? 'spin' : ''} />
            <span>{isGeneratingPlan ? 'Generating...' : 'Regenerate Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Blueprint vs Conversational Assistant */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'blueprint' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('blueprint')}
        >
          <Sparkle size={15} />
          <span>Event Blueprint & Concepts</span>
        </button>
        <button
          className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('chat')}
        >
          <Bot size={15} />
          <span>Conversational Refinement ({activeEvent.chatHistory.length})</span>
        </button>
      </div>

      {/* Blueprint Tab */}
      {activeTab === 'blueprint' && (
        activeEvent.aiPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Theme Hero */}
            <div className="glass-card" style={{ padding: '1.75rem', borderColor: 'var(--gold-100)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ maxWidth: '850px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="badge badge-gold">Design Concept</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Model: {activeEvent.aiPlan.modelUsed}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-700)', marginBottom: '0.5rem' }}>
                    {activeEvent.aiPlan.themeTitle}
                  </h2>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {activeEvent.aiPlan.themeDescription}
                  </p>

                  {/* Swatches */}
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Harmonious Color Palette (Click swatch to copy hex code)
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {activeEvent.aiPlan.colorPalette.map((col, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            navigator.clipboard.writeText(col.hex);
                            showToast(`Copied ${col.name} hex code (${col.hex}) to clipboard!`, 'info');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                          title={`Click to copy ${col.hex} to clipboard`}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: col.hex,
                            border: '1px solid rgba(0,0,0,0.12)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'transform 0.15s ease'
                          }} />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{col.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{col.hex}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gold-50)',
                  border: '1px solid var(--gold-100)',
                  maxWidth: '340px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-600)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={16} />
                    <span>Atmospheric & Sensory Vibe</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
                    {activeEvent.aiPlan.atmosphereAndVibe}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Pillars Grid: Decor, Catering, Entertainment, Logistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}>
              {/* Decor & Floral */}
              <PlanSectionCard
                section={activeEvent.aiPlan.decorIdeas}
                category="decorations"
                itemPrefix="decor"
                Icon={Sparkles}
                iconColor="var(--primary-500)"
                tipLabel="Styling Tip: "
                tipStyle={{
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-100)',
                  color: 'var(--primary-700)',
                }}
                adoptedItems={adoptedItems}
                onAdoptItem={handleAdoptItem}
              />

              {/* Catering & Beverage */}
              <PlanSectionCard
                section={activeEvent.aiPlan.cateringSuggestions}
                category="catering"
                itemPrefix="catering"
                Icon={Utensils}
                iconColor="var(--rose-500)"
                tipLabel="Menu Tip: "
                tipStyle={{
                  background: 'var(--sage-50)',
                  border: '1px solid var(--sage-100)',
                  color: 'var(--sage-700)',
                }}
                adoptedItems={adoptedItems}
                onAdoptItem={handleAdoptItem}
              />

              {/* Music & Entertainment */}
              <PlanSectionCard
                section={activeEvent.aiPlan.entertainmentSuggestions}
                category="entertainment"
                itemPrefix="music"
                Icon={Music}
                iconColor="#7C3AED"
                tipLabel="Atmosphere Tip: "
                tipStyle={{
                  background: 'var(--rose-50)',
                  border: '1px solid var(--rose-100)',
                  color: 'var(--rose-600)',
                }}
                adoptedItems={adoptedItems}
                onAdoptItem={handleAdoptItem}
              />

              {/* Practical Recommendations */}
              <PlanSectionCard
                section={activeEvent.aiPlan.practicalRecommendations}
                category="miscellaneous"
                itemPrefix="practical"
                Icon={Compass}
                iconColor="var(--gold-500)"
                tipLabel="Coordinator Rule: "
                tipStyle={{
                  background: 'var(--gold-50)',
                  border: '1px solid var(--gold-100)',
                  color: 'var(--gold-600)',
                }}
                adoptedItems={adoptedItems}
                onAdoptItem={handleAdoptItem}
              />
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Sparkle size={48} color="var(--primary-500)" style={{ margin: '0 auto 1rem' }} />
            <h2>No Event Blueprint Generated Yet</h2>
            <p style={{ maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
              Celebrio AI can construct a personalized theme, color palette, decoration ideas, catering menu, and entertainment arc for {activeEvent.name}.
            </p>
            <button className="btn btn-primary" onClick={handleRegeneratePlan} disabled={isGeneratingPlan}>
              <Sparkles size={18} />
              <span>{isGeneratingPlan ? 'Synthesizing Plan...' : 'Generate Blueprint Now'}</span>
            </button>
          </div>
        )
      )}

      {/* Conversational Refinement Chat Tab */}
      {activeTab === 'chat' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '520px', padding: 0 }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--primary-500)" />
              <strong style={{ fontSize: '0.95rem' }}>Celebrio Planning Concierge</strong>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                {isLiveAI ? 'Live Gemini Chat' : 'Deterministic Assistant'}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Refining {activeEvent.name}
            </span>
          </div>

          {/* Chat Messages Log */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxHeight: '480px',
            background: '#FCFBF9'
          }}>
            {activeEvent.chatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)' }}>
                <Lightbulb size={32} color="var(--gold-500)" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Start refining your celebration with Celebrio AI</p>
                <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
                  Ask questions about menu adaptations, rain contingencies, budget adjustments, or music schedules.
                </p>
              </div>
            ) : (
              activeEvent.chatHistory.map((msg) => {
                const isAssistant = msg.sender === 'assistant';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAssistant ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)'
                    }}>
                      {isAssistant ? <Bot size={13} color="var(--primary-500)" /> : <User size={13} />}
                      <span>{isAssistant ? 'Celebrio AI' : 'You'} • {msg.timestamp}</span>
                    </div>

                    <div style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      background: isAssistant ? 'var(--bg-surface)' : 'var(--primary-500)',
                      color: isAssistant ? 'var(--text-primary)' : 'var(--text-inverse)',
                      border: isAssistant ? '1px solid var(--border-medium)' : 'none',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.text}
                    </div>

                    {/* Quick Interactive Actions */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {msg.suggestedActions.map((act, i) => {
                          const actionKey = `${msg.id}-${i}`;
                          const isDone = appliedActions[actionKey];
                          return (
                            <button
                              key={i}
                              className="btn btn-secondary btn-sm"
                              disabled={isDone}
                              onClick={() => executeAction(act, actionKey)}
                              style={{
                                fontSize: '0.78rem',
                                background: isDone ? 'var(--sage-50)' : '#FFFFFF',
                                borderColor: isDone ? 'var(--sage-500)' : 'var(--primary-500)',
                                color: isDone ? 'var(--sage-600)' : 'var(--primary-600)',
                                cursor: isDone ? 'default' : 'pointer',
                                opacity: isDone ? 0.9 : 1,
                              }}
                            >
                              {isDone ? <Check size={13} color="var(--sage-600)" /> : <PlusCircle size={13} />}
                              <span>{isDone ? 'Added to Plan' : act.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isSendingMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
                <RefreshCw size={14} className="spin" />
                <span>Celebrio AI is formulating tailored recommendations...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Starters */}
          <div style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
          }}>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm"
                onClick={() => handleSendChat(undefined, prompt)}
                style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-full)' }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => handleSendChat(e)}
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder={`Ask Celebrio AI anything about ${activeEvent.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isSendingMessage}
              style={{ flex: 1 }}
              aria-label="Ask Celebrio AI a planning question"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSendingMessage || !chatInput.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
