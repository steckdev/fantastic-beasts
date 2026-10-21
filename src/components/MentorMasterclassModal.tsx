import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, BookOpen, CheckCircle, ChevronRight, Sparkles, GraduationCap, Compass, Wand2 } from 'lucide-react';
import { MentorId, MentorInfo, MasterclassLesson } from '../types';
import { MENTORS, MASTERCLASS_LESSONS, PRIMARY_MENTOR_IDS } from '../data/mentorData';
import { HEROES } from '../data/heroesData';
import { sounds } from '../services/soundService';

interface MentorMasterclassModalProps {
  heroId?: string;
  activeMentorId: MentorId;
  completedMasterclasses: string[];
  alchemistRank: number;
  onSelectMentor: (mentorId: MentorId) => void;
  onCompleteMasterclass: (lesson: MasterclassLesson, bonusKnuts: number) => void;
  onClose: () => void;
  onShowToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'energy' | 'mark') => void;
}

export default function MentorMasterclassModal({
  heroId,
  activeMentorId,
  completedMasterclasses = [],
  alchemistRank = 1,
  onSelectMentor,
  onCompleteMasterclass,
  onClose,
  onShowToast
}: MentorMasterclassModalProps) {
  const [activeTab, setActiveTab] = useState<'mentors' | 'curriculum'>('mentors');
  const [selectedMentorDetail, setSelectedMentorDetail] = useState<MentorId>(
    PRIMARY_MENTOR_IDS.includes(activeMentorId) ? activeMentorId : 'dumbledore'
  );
  const [activeLesson, setActiveLesson] = useState<MasterclassLesson | null>(null);
  const [dialogueStepIndex, setDialogueStepIndex] = useState<number>(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentMentor: MentorInfo = MENTORS[selectedMentorDetail] || MENTORS.dumbledore;
  const playerHero = HEROES.find((h) => h.id === heroId) || HEROES[0];

  useEffect(() => {
    if (activeLesson) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogueStepIndex, selectedChoiceId, activeLesson]);

  const handleStartLesson = (lesson: MasterclassLesson) => {
    setActiveLesson(lesson);
    setDialogueStepIndex(0);
    setSelectedChoiceId(null);
    sounds.playSparkle();
  };

  const handleNextDialogue = () => {
    if (!activeLesson) return;
    if (dialogueStepIndex < activeLesson.dialogue.length - 1) {
      setDialogueStepIndex((prev) => prev + 1);
      sounds.playUiClick();
    }
  };

  const handleSelectChoice = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    sounds.playCauldronBubble();
  };

  const handleFinishLesson = () => {
    if (!activeLesson) return;
    const choice = activeLesson.interactiveChoice?.options.find((o) => o.id === selectedChoiceId);
    const bonus = choice?.bonusKnuts || 0;

    onCompleteMasterclass(activeLesson, bonus);
    sounds.playLevelUp();

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#38bdf8', '#c084fc']
    });

    if (onShowToast) {
      onShowToast(
        'Masterclass Completed!',
        `Earned +${activeLesson.rewardXP} XP, +${activeLesson.rewardKnuts + bonus} Knuts & Title: "${activeLesson.rewardTitle}"`,
        'success'
      );
    }

    setActiveLesson(null);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          height: '92vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          border: '1.5px solid var(--border-gold)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.85)',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 15%, #151d30 0%, #080c16 100%)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            background: 'rgba(15, 23, 42, 0.85)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
              }}
            >
              <GraduationCap size={20} color="#000" />
            </div>
            <div>
              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.15rem', color: '#fef08a', margin: 0 }}>
                Mentors & Masterclasses
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Field Coaching & Canonical Wizarding Wisdom
              </span>
            </div>
          </div>

          <button
            className="btn-modal-close"
            onClick={onClose}
            title="Close mentors"
            aria-label="Close mentors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(11, 15, 25, 0.6)',
            padding: '4px 12px'
          }}
        >
          <button
            onClick={() => {
              setActiveTab('mentors');
              setActiveLesson(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'mentors' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'transparent',
              color: activeTab === 'mentors' ? '#fef08a' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              borderBottom: activeTab === 'mentors' ? '2px solid #fbbf24' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Compass size={16} />
            <span>Field Mentors</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'curriculum' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'transparent',
              color: activeTab === 'curriculum' ? '#fef08a' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              borderBottom: activeTab === 'curriculum' ? '2px solid #fbbf24' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={16} />
            <span>Masterclasses ({completedMasterclasses.length}/{MASTERCLASS_LESSONS.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Lesson Reader View: Progressive Story Feed */}
          {activeLesson ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(15, 23, 42, 0.75)',
                borderRadius: '18px',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                padding: '16px',
                overflowY: 'auto'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    {activeLesson.domain}
                  </span>
                  <h3 className="font-cinzel" style={{ fontSize: '1.1rem', color: '#fef08a', margin: '2px 0 0' }}>
                    {activeLesson.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLesson(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#94a3b8',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>

              {/* Progressive Story Dialogue Feed: Cumulative messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {activeLesson.dialogue.slice(0, dialogueStepIndex + 1).map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                      animation: 'fadeIn 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <img
                        src={step.avatar}
                        alt={step.speaker}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: '1.5px solid #fbbf24',
                          objectFit: 'cover',
                          background: '#1e293b'
                        }}
                      />
                      <div>
                        <h4 style={{ margin: 0, color: '#fef08a', fontSize: '0.88rem', fontWeight: 700 }}>
                          {step.speaker}
                        </h4>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                          Lesson Part {idx + 1} of {activeLesson.dialogue.length}
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.55' }}>
                      "{step.text}"
                    </p>

                    {step.loreNote && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.76rem',
                          color: '#7dd3fc'
                        }}
                      >
                        <Sparkles size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                        <span>{step.loreNote}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Continue button while more advice remains */}
                {dialogueStepIndex < activeLesson.dialogue.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
                    <button
                      onClick={handleNextDialogue}
                      className="btn-primary"
                      style={{
                        padding: '10px 24px',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
                      }}
                    >
                      <span>Continue Guidance ({dialogueStepIndex + 1}/{activeLesson.dialogue.length})</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Once all dialogue is revealed, Mentor presents the Field Assessment Scenario in the feed */}
                {dialogueStepIndex >= activeLesson.dialogue.length - 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.35s ease' }}>
                    {/* Mentor's Question Bubble */}
                    <div
                      style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                        border: '1.5px solid #fbbf24',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        boxShadow: '0 4px 16px rgba(251, 191, 36, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <img
                          src={activeLesson.dialogue[0].avatar}
                          alt={activeLesson.dialogue[0].speaker}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '1.5px solid #fbbf24',
                            objectFit: 'cover',
                            background: '#1e293b'
                          }}
                        />
                        <div>
                          <h4 style={{ margin: 0, color: '#fef08a', fontSize: '0.88rem', fontWeight: 700 }}>
                            {activeLesson.dialogue[0].speaker}
                          </h4>
                          <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700 }}>
                            Field Assessment Challenge
                          </span>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.92rem', color: '#fef08a', fontWeight: 600, lineHeight: '1.5' }}>
                        "{activeLesson.interactiveChoice?.prompt}"
                      </p>
                    </div>

                    {/* Tactical Target Choices */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        Select Your Action:
                      </span>
                      {activeLesson.interactiveChoice?.options.map((option, oIdx) => {
                        const isSelected = selectedChoiceId === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectChoice(option.id)}
                            style={{
                              textAlign: 'left',
                              padding: '12px 14px',
                              borderRadius: '12px',
                              background: isSelected
                                ? option.isOptimal
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : 'rgba(239, 68, 68, 0.18)'
                                : 'rgba(30, 41, 59, 0.65)',
                              border: `1.5px solid ${
                                isSelected
                                  ? option.isOptimal
                                    ? '#10b981'
                                    : '#ef4444'
                                  : 'rgba(255,255,255,0.1)'
                              }`,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: isSelected
                                    ? option.isOptimal
                                      ? '#10b981'
                                      : '#ef4444'
                                    : 'rgba(255,255,255,0.1)',
                                  color: '#fff',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: isSelected ? 700 : 500 }}>
                                {option.text}
                              </span>
                            </div>
                            {option.isOptimal && (
                              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, flexShrink: 0 }}>
                                +{option.bonusKnuts} Knuts Bonus!
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* If choice made: Reveal Player Dialogue, Mentor Evaluation, Tactical Takeaway & Claim */}
                    {selectedChoiceId && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.35s ease' }}>
                        {(() => {
                          const choice = activeLesson.interactiveChoice?.options.find((o) => o.id === selectedChoiceId);
                          if (!choice) return null;
                          return (
                            <>
                              {/* Player Action Bubble */}
                              <div
                                style={{
                                  alignSelf: 'flex-end',
                                  maxWidth: '92%',
                                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.85), rgba(15, 23, 42, 0.95))',
                                  border: '1px solid rgba(56, 189, 248, 0.45)',
                                  borderRadius: '16px 16px 4px 16px',
                                  padding: '12px 14px',
                                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#7dd3fc', fontWeight: 700 }}>
                                    {playerHero.name} (You)
                                  </span>
                                  <img
                                    src={playerHero.sprite}
                                    alt="You"
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #38bdf8' }}
                                  />
                                </div>
                                <p style={{ margin: 0, fontSize: '0.86rem', color: '#f0f9ff', lineHeight: 1.45 }}>
                                  "{choice.text}"
                                </p>
                              </div>

                              {/* Mentor Feedback Bubble */}
                              <div
                                style={{
                                  alignSelf: 'flex-start',
                                  maxWidth: '94%',
                                  background: choice.isOptimal
                                    ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.85), rgba(15, 23, 42, 0.95))'
                                    : 'linear-gradient(135deg, rgba(127, 29, 29, 0.85), rgba(15, 23, 42, 0.95))',
                                  border: `1.5px solid ${choice.isOptimal ? '#10b981' : '#f87171'}`,
                                  borderRadius: '16px 16px 16px 4px',
                                  padding: '12px 14px',
                                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <img
                                    src={activeLesson.dialogue[0].avatar}
                                    alt={activeLesson.dialogue[0].speaker}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      border: `1.5px solid ${choice.isOptimal ? '#10b981' : '#f87171'}`
                                    }}
                                  />
                                  <div>
                                    <span style={{ fontSize: '0.78rem', color: choice.isOptimal ? '#6ee7b7' : '#fca5a5', fontWeight: 700 }}>
                                      {activeLesson.dialogue[0].speaker}'s Evaluation
                                    </span>
                                    {choice.isOptimal ? (
                                      <span style={{ marginLeft: '8px', fontSize: '0.68rem', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                        OPTIMAL (+{choice.bonusKnuts} Knuts)
                                      </span>
                                    ) : (
                                      <span style={{ marginLeft: '8px', fontSize: '0.68rem', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                        SUBOPTIMAL
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.86rem', color: '#f8fafc', lineHeight: 1.45 }}>
                                  "{choice.response}"
                                </p>
                              </div>

                              {/* Tactical Takeaway Parchment */}
                              <div
                                style={{
                                  background: 'rgba(192, 132, 252, 0.12)',
                                  border: '1px solid rgba(192, 132, 252, 0.35)',
                                  borderRadius: '12px',
                                  padding: '12px 14px',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px'
                                }}
                              >
                                <BookOpen size={18} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Tactical Takeaway
                                  </span>
                                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#f3e8ff', lineHeight: 1.4 }}>
                                    {activeLesson.tacticalTakeaway}
                                  </p>
                                </div>
                              </div>

                              {/* Certificate & Completion Banner */}
                              <div
                                style={{
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.9))',
                                  border: '1.5px solid #fbbf24',
                                  borderRadius: '14px',
                                  padding: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  marginTop: '4px'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
                                    <Award size={18} />
                                    <span>Reward: +{activeLesson.rewardXP} XP, +{activeLesson.rewardKnuts + (choice.bonusKnuts || 0)} Knuts</span>
                                  </div>
                                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                                    Title Unlocked: <strong>"{activeLesson.rewardTitle}"</strong>
                                  </span>
                                </div>

                                <button
                                  onClick={handleFinishLesson}
                                  className="btn-primary"
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexShrink: 0
                                  }}
                                >
                                  <span>Complete & Claim</span>
                                  <CheckCircle size={16} />
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : activeTab === 'mentors' ? (
            /* Mentors Selection & Dossier View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* Mentor Selector Chips: The 4 Dedicated Mentors */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
                {PRIMARY_MENTOR_IDS.map((mId) => {
                  const m = MENTORS[mId];
                  const isSelected = selectedMentorDetail === mId;
                  const isActive = activeMentorId === mId;
                  return (
                    <button
                      key={mId}
                      onClick={() => setSelectedMentorDetail(mId)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '10px 4px',
                        borderRadius: '14px',
                        background: isSelected
                          ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
                          : 'rgba(15, 23, 42, 0.5)',
                        border: `1.5px solid ${isSelected ? m.accentColor : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: isSelected ? `0 0 15px ${m.glowColor}` : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '3px',
                            right: '3px',
                            background: '#10b981',
                            color: '#fff',
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            padding: '1px 4px',
                            borderRadius: '4px'
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                      <img
                        src={m.sprite}
                        alt={m.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          border: `2px solid ${m.accentColor}`,
                          objectFit: 'cover',
                          marginBottom: '6px',
                          background: '#090d16'
                        }}
                      />
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc', textAlign: 'center', lineHeight: 1.2 }}>
                        {m.name.split(' ')[0]}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8', textAlign: 'center', marginTop: '2px' }}>
                        {m.domain.split('&')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Mentor Dossier Card */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '18px',
                  border: `1.5px solid ${currentMentor.accentColor}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: `0 8px 25px ${currentMentor.glowColor}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <img
                      src={currentMentor.sprite}
                      alt={currentMentor.name}
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        border: `2.5px solid ${currentMentor.accentColor}`,
                        objectFit: 'cover',
                        background: '#090d16',
                        boxShadow: `0 0 16px ${currentMentor.glowColor}`
                      }}
                    />
                    <div>
                      <h3 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fef08a', margin: '0 0 2px' }}>
                        {currentMentor.name}
                      </h3>
                      <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: currentMentor.accentColor, fontWeight: 700 }}>
                        {currentMentor.title}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{currentMentor.domain}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      fontStyle: 'italic',
                      fontSize: '0.82rem',
                      color: '#e2e8f0',
                      background: 'rgba(0,0,0,0.4)',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      borderLeft: `3px solid ${currentMentor.accentColor}`,
                      marginBottom: '14px'
                    }}
                  >
                    {currentMentor.quote}
                  </div>

                  {/* Passive Perk */}
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Sparkles size={16} color="#fbbf24" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>
                        Passive Blessing: {currentMentor.passivePerkName}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {currentMentor.passivePerkDesc}
                    </p>
                  </div>

                  {/* Coaching Advice */}
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Wand2 size={16} color="#38bdf8" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>
                        Encounter Coaching Style
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                      {currentMentor.specialtyTip}
                    </p>
                  </div>
                </div>

                {/* Set Active Button */}
                <div style={{ marginTop: '16px' }}>
                  {activeMentorId === currentMentor.id ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '11px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1.5px solid #10b981',
                        color: '#6ee7b7',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle size={18} />
                      <span>Active Field Mentor Assigned</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectMentor(currentMentor.id);
                        sounds.playWandCast('great');
                        if (onShowToast) {
                          onShowToast(
                            'Field Mentor Assigned',
                            `${currentMentor.name} is now your active mentor! (${currentMentor.passivePerkName})`,
                            'success'
                          );
                        }
                      }}
                      className="btn-magical"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <GraduationCap size={18} />
                      <span>Assign {currentMentor.name.split(' ')[0]} as Active Mentor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Masterclass Curriculum View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}>
              {MASTERCLASS_LESSONS.map((lesson) => {
                const isCompleted = completedMasterclasses.includes(lesson.id);
                const isLocked = alchemistRank < lesson.recommendedLevel;
                const mentor = MENTORS[lesson.mentorId] || MENTORS.dumbledore;

                return (
                  <div
                    key={lesson.id}
                    style={{
                      background: isCompleted
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(15, 23, 42, 0.65)',
                      border: `1.5px solid ${
                        isCompleted
                          ? '#10b981'
                          : isLocked
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(251, 191, 36, 0.35)'
                      }`,
                      borderRadius: '16px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={mentor.sprite}
                        alt={mentor.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          border: `1.5px solid ${mentor.accentColor}`,
                          objectFit: 'cover',
                          background: '#090d16'
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: mentor.accentColor, fontWeight: 700 }}>
                            {mentor.name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>•</span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            Rank {lesson.recommendedLevel}+
                          </span>
                        </div>
                        <h4 className="font-cinzel" style={{ margin: '2px 0', fontSize: '0.92rem', color: '#fef08a' }}>
                          {lesson.title}
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                          {lesson.subtitle}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#10b981',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            padding: '6px 10px',
                            borderRadius: '8px'
                          }}
                        >
                          <CheckCircle size={16} />
                          <span>Mastered</span>
                        </div>
                      ) : isLocked ? (
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '0.72rem',
                            padding: '6px 10px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}
                        >
                          Requires Rank {lesson.recommendedLevel}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartLesson(lesson)}
                          className="btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            borderColor: '#fbbf24',
                            color: '#fef08a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>Study</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
