import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Award, BookOpen, CheckCircle, ChevronRight, Sparkles, GraduationCap, Compass, Shield, Wand2, Star } from 'lucide-react';
import { MentorId, MentorInfo, MasterclassLesson } from '../types';
import { MENTORS, MASTERCLASS_LESSONS } from '../data/mentorData';
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
  const [selectedMentorDetail, setSelectedMentorDetail] = useState<MentorId>(activeMentorId);
  const [activeLesson, setActiveLesson] = useState<MasterclassLesson | null>(null);
  const [dialogueStepIndex, setDialogueStepIndex] = useState<number>(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [hasFinishedLesson, setHasFinishedLesson] = useState<boolean>(false);

  const currentMentor: MentorInfo = MENTORS[selectedMentorDetail] || MENTORS.newt;

  const handleStartLesson = (lesson: MasterclassLesson) => {
    setActiveLesson(lesson);
    setDialogueStepIndex(0);
    setSelectedChoiceId(null);
    setHasFinishedLesson(false);
    sounds.playSparkle();
  };

  const handleNextDialogue = () => {
    if (!activeLesson) return;
    if (dialogueStepIndex < activeLesson.dialogue.length - 1) {
      setDialogueStepIndex((prev) => prev + 1);
      sounds.playUiClick();
    } else {
      // Reached interactive choice or conclusion
      setDialogueStepIndex(activeLesson.dialogue.length);
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

    setHasFinishedLesson(true);
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
          padding: '20px 16px',
          background: 'radial-gradient(circle at 50% 10%, #172033 0%, #080d1a 100%)',
          border: '2px solid var(--border-gold-bright)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)'
              }}
            >
              <GraduationCap size={24} color="#0f172a" />
            </div>
            <div>
              <h2 className="font-cinzel title-glow" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fef08a', margin: 0 }}>
                Mentors & Masterclasses
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Field Coaching & Canonical Wizarding Wisdom
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-modal-close"
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
            background: 'rgba(0,0,0,0.5)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            marginBottom: '14px'
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
            onClick={() => {
              setActiveTab('curriculum');
              setActiveLesson(null);
            }}
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
            <span>Masterclasses ({completedMasterclasses.length}/6)</span>
          </button>
        </div>

        {/* Lesson Reader View */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </div>

            {/* Step-by-step dialogue */}
            {dialogueStepIndex < activeLesson.dialogue.length ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img
                      src={activeLesson.dialogue[dialogueStepIndex].avatar}
                      alt={activeLesson.dialogue[dialogueStepIndex].speaker}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: '2px solid #fbbf24',
                        objectFit: 'cover',
                        background: '#1e293b',
                        boxShadow: '0 0 12px rgba(251, 191, 36, 0.4)'
                      }}
                    />
                    <div>
                      <h4 style={{ margin: 0, color: '#fef08a', fontSize: '0.95rem', fontWeight: 700 }}>
                        {activeLesson.dialogue[dialogueStepIndex].speaker}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Lesson Step {dialogueStepIndex + 1} of {activeLesson.dialogue.length}
                      </span>
                    </div>
                  </div>

                  {/* Dialogue Bubble */}
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      borderRadius: '16px',
                      padding: '16px',
                      fontSize: '0.92rem',
                      lineHeight: '1.5',
                      color: '#e2e8f0',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
                      fontStyle: 'normal'
                    }}
                  >
                    "{activeLesson.dialogue[dialogueStepIndex].text}"
                  </div>

                  {/* Lore Note */}
                  {activeLesson.dialogue[dialogueStepIndex].loreNote && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.08)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.78rem',
                        color: '#7dd3fc'
                      }}
                    >
                      <Sparkles size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
                      <span>{activeLesson.dialogue[dialogueStepIndex].loreNote}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    onClick={handleNextDialogue}
                    className="btn-primary"
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{dialogueStepIndex === activeLesson.dialogue.length - 1 ? 'Practical Scenario' : 'Continue'}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Choice & Completion */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      marginBottom: '14px'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                      Field Assessment Challenge
                    </span>
                    <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#fef08a', fontWeight: 600 }}>
                      {activeLesson.interactiveChoice?.prompt}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeLesson.interactiveChoice?.options.map((option) => {
                      const isSelected = selectedChoiceId === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectChoice(option.id)}
                          style={{
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
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: isSelected ? 700 : 500 }}>
                              {option.text}
                            </span>
                            {isSelected && option.isOptimal && (
                              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                                +{option.bonusKnuts} Knuts Bonus!
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <div
                              style={{
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.78rem',
                                color: option.isOptimal ? '#6ee7b7' : '#fca5a5',
                                lineHeight: '1.4'
                              }}
                            >
                              {option.response}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tactical Takeaway summary */}
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(192, 132, 252, 0.12)',
                      border: '1px solid rgba(192, 132, 252, 0.35)',
                      fontSize: '0.78rem',
                      color: '#e9d5ff'
                    }}
                  >
                    <strong>Tactical Takeaway:</strong> {activeLesson.tacticalTakeaway}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fbbf24' }}>
                    <Award size={18} />
                    <span>Reward: +{activeLesson.rewardXP} XP, +{activeLesson.rewardKnuts} Knuts</span>
                  </div>

                  <button
                    onClick={handleFinishLesson}
                    disabled={!selectedChoiceId}
                    className="btn-primary"
                    style={{
                      padding: '10px 22px',
                      fontSize: '0.85rem',
                      opacity: selectedChoiceId ? 1 : 0.5,
                      cursor: selectedChoiceId ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Complete & Claim
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'mentors' ? (
          /* Mentors Selection & Dossier View */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* Mentor Selector Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {(Object.keys(MENTORS) as MentorId[]).map((mId) => {
                const m = MENTORS[mId];
                const isSelected = selectedMentorDetail === mId;
                const isActive = activeMentorId === mId;
                const isCurrentHeroPersona =
                  (heroId === 'newt_scamander' && mId === 'newt') ||
                  (heroId === 'tina_goldstein' && mId === 'tina');
                return (
                  <button
                    key={mId}
                    onClick={() => setSelectedMentorDetail(mId)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px 6px',
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
                    {isCurrentHeroPersona ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#f59e0b',
                          color: '#000',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '6px'
                        }}
                      >
                        YOU
                      </span>
                    ) : isActive ? (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: '6px'
                        }}
                      >
                        ACTIVE
                      </span>
                    ) : null}
                    <img
                      src={m.sprite}
                      alt={m.name}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        border: `2px solid ${m.accentColor}`,
                        objectFit: 'cover',
                        marginBottom: '6px',
                        background: '#090d16'
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', textAlign: 'center' }}>
                      {m.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
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
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Sparkles size={16} color={currentMentor.accentColor} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fef08a' }}>
                      Passive Blessing: {currentMentor.passivePerkName}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {currentMentor.passivePerkDesc}
                  </p>
                </div>

                {/* Tactical Coaching Domain */}
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
                {((heroId === 'newt_scamander' && currentMentor.id === 'newt') ||
                  (heroId === 'tina_goldstein' && currentMentor.id === 'tina')) ? (
                  <div
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(251, 191, 36, 0.12)',
                      border: '1.5px dashed #fbbf24',
                      color: '#fef08a',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      lineHeight: '1.4'
                    }}
                  >
                    <span>
                      👤 <strong>Your Active Persona:</strong> You are currently exploring as {currentMentor.name}! A wizard cannot mentor themselves—select Professor Dumbledore or your fellow field partner above for tactical counsel.
                    </span>
                  </div>
                ) : activeMentorId === currentMentor.id ? (
                  <div
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1.5px solid #10b981',
                      color: '#6ee7b7',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle size={18} />
                    <span>Active Field Mentor Assigned</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelectMentor(currentMentor.id);
                      sounds.playSparkle();
                      if (onShowToast) {
                        onShowToast(
                          'Active Mentor Changed!',
                          `${currentMentor.name} will now provide tactical coaching during wild encounters.`,
                          'info'
                        );
                      }
                    }}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.85rem',
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
              const mentor = MENTORS[lesson.mentorId];

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
  );
}
