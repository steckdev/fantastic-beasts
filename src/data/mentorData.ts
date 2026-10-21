import { Disturbance, MentorId, MentorInfo, MasterclassLesson } from '../types';
import { getMoMClassification } from './ministryClassification';

export const PRIMARY_MENTOR_IDS: MentorId[] = ['dumbledore', 'grindelwald', 'lally', 'theseus'];

export const MENTORS: Record<MentorId, MentorInfo> = {
  dumbledore: {
    id: 'dumbledore',
    name: 'Professor Albus Dumbledore',
    title: 'Transfiguration Master & Hogwarts Scholar',
    domain: 'Ancient Arcana, Runes & Leylines',
    quote: '"Words are, in my not-so-humble opinion, our most inexhaustible source of magic."',
    philosophy: 'Patience and harmony govern all true sorcery. Where brute force falters, a single measured gesture can unravel the most obstinate wards.',
    sprite: '/sprites/heroes/albus_dumbledore.png',
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    passivePerkName: 'Ancient Resonances',
    passivePerkDesc: '+40% Masterful Cast bonus chance; reveals hidden leyline markings and doubles Ancient Mark discovery rates.',
    specialtyTip: 'Do not rush your wand trace. The leylines favor calm precision over frantic haste.'
  },
  grindelwald: {
    id: 'grindelwald',
    name: 'Gellert Grindelwald',
    title: 'Visionary Revolutionary & Relic Master',
    domain: 'Relic Mastery, Dark Charms & Raw Leyline Force',
    quote: '"Magic blooms only in rare souls. It is granted to those who live for higher things."',
    philosophy: 'Power without resolve is meaningless. Command the magical currents; never let a wild entity dictate the terms of your engagement.',
    sprite: '/sprites/heroes/gellert_grindelwald.png',
    accentColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.5)',
    passivePerkName: 'Relentless Arcana',
    passivePerkDesc: '+35% Spell damage in combat and raids, +25% wild catch force, and unlocks aggressive subdual focus rings.',
    specialtyTip: 'When faced with ferocious resistance, strike first with Maxima or Thunderbrew before the anomaly can adapt.'
  },
  lally: {
    id: 'lally',
    name: 'Professor Eulalie "Lally" Hicks',
    title: 'Ilvermorny Charms Professor & Tactician',
    domain: 'Advanced Charmwork, Tactical Books & De-escalation',
    quote: '"Never underestimate a teacher with a stack of enchanted books and a well-placed ward."',
    philosophy: 'Every charm is an equation waiting to be solved. Conserve your energy, exploit environmental advantages, and outthink the adversary.',
    sprite: '/sprites/heroes/professor_lally.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    passivePerkName: 'Scholarly Efficiency',
    passivePerkDesc: '-25% Spell Energy consumption on all casts; expands the Masterful timing window and awards +20% bonus Knuts.',
    specialtyTip: 'Deploy calming draughts and maintain your distance. A measured charm beats reckless spell-slinging every time.'
  },
  theseus: {
    id: 'theseus',
    name: 'Theseus Scamander',
    title: 'Ministry Head Auror & War Hero',
    domain: 'Auror Containment, Tactical Counter-Spells & High-Threat Subdual',
    quote: '"Keep a cool head, stick to the perimeter, and always have your defensive ward ready."',
    philosophy: 'Containment demands discipline and unwavering focus. Shield the innocent, secure the anomaly, and never let high-risk beasts break through.',
    sprite: '/sprites/heroes/theseus_scamander.png',
    accentColor: '#f87171',
    glowColor: 'rgba(248, 113, 113, 0.45)',
    passivePerkName: 'Auror Rapid Response',
    passivePerkDesc: '+45% Catch Multiplier on Level 4★ & 5★ (Mythic & Apex) beasts; prevents sudden early flee attempts.',
    specialtyTip: 'When confronting a high-danger disturbance, an Edurus or Invisibility potion tips the scales before the beast can retaliate.'
  },
  // Backwards-compatible legacy mappings:
  newt: {
    id: 'newt',
    name: 'Newt Scamander',
    title: 'World-Renowned Magizoologist',
    domain: 'Magizoology & Compassionate Care',
    quote: '"They are being hurt, and they need our help. Worrying means you suffer twice."',
    philosophy: 'Understanding precedes mastery. Treat every creature not as a beast to conquer, but as a living wonder to protect.',
    sprite: '/sprites/heroes/newt_scamander.png',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    passivePerkName: 'Suitcase Sanctuary Harmony',
    passivePerkDesc: '+35% Treat Calming Power in encounters; beast happiness builds faster.',
    specialtyTip: 'Always carry an assortment of treats. A content beast rarely flees.'
  },
  tina: {
    id: 'tina',
    name: 'Porpentina "Tina" Goldstein',
    title: 'MACUSA Field Auror',
    domain: 'MACUSA Field Tactics & Subdual Wards',
    quote: '"Containment is about discipline and anticipation. One misstep, and the whole city wakes up."',
    philosophy: 'Read the threat before it strikes. Maintain perimeter control and deploy protective draughts early.',
    sprite: '/sprites/heroes/tina_goldstein.png',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    passivePerkName: 'Auror Rapid Response',
    passivePerkDesc: '+30% Spell Catch multiplier on Level 4★ & 5★ (Mythic & Apex) beasts.',
    specialtyTip: 'When facing a high-danger disturbance, an Edurus or Invisibility potion tips the scales.'
  }
};

export const MASTERCLASS_LESSONS: MasterclassLesson[] = [
  {
    id: 'lesson_dumbledore_1',
    mentorId: 'dumbledore',
    title: 'The Geometry of Wand Harmony',
    subtitle: 'Tapping into Leyline Resonances and Precise Gestures',
    domain: 'Ancient Arcana & Wandcraft',
    recommendedLevel: 1,
    rewardXP: 180,
    rewardKnuts: 240,
    rewardTitle: 'Leyline Harmonizer',
    tacticalTakeaway: 'Focus Potions enhance Masterful cast accuracy multipliers up to 1.8x, turning difficult catches into triumphs.',
    dialogue: [
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Welcome to the study of unseen geometry, my young friend. Magic is not a blunt hammer, but a delicate resonance between spirit and leyline.',
        loreNote: 'Wand gestures channel terrestrial leylines into physical subdual matrices.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'When tracing an incantation across the parchment of reality, speed without poise produces only chaotic sparks. The glyph requires steady, unwavering intent.',
        loreNote: 'Masterful casts yield a 1.6x catch multiplier, jumping to 1.8x when bolstered by alchemical focus.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Focus your intent along the central axis of the spell glyph. Allow your wand tip to flow with uninterrupted grace.'
      }
    ],
    interactiveChoice: {
      prompt: 'Your wand glyph is wobbling under the turbulence of ambient magical interference. How do you restore harmony?',
      options: [
        {
          id: 'focus',
          text: 'Drink a Focus Potion to sharpen your mind\'s eye and steady your hand.',
          response: 'Exquisite choice. The elixir clears extraneous mental chatter and expands your timing window for a Masterful cast.',
          isOptimal: true,
          bonusKnuts: 60
        },
        {
          id: 'flick_fast',
          text: 'Flick the wand as fast as humanly possible.',
          response: 'Haste is the eternal enemy of precision. The stroke fractures into discordant sparks.',
          isOptimal: false
        },
        {
          id: 'overpower',
          text: 'Overload the spell with raw, unshaped magical energy.',
          response: 'Excessive force only destabilizes the containment matrix, exhausting your spell energy.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_dumbledore_2',
    mentorId: 'dumbledore',
    title: 'Deciphering Ancient Marks & The Astral Arcana',
    subtitle: 'Unlocking the Secrets of Marked Creatures',
    domain: 'Ancient Marks & Lore',
    recommendedLevel: 2,
    rewardXP: 300,
    rewardKnuts: 350,
    rewardTitle: 'Archivist of Ancient Runes',
    tacticalTakeaway: 'Marked beasts grant massive CP and permanent perks to your Sanctuary. Always prepare before engaging.',
    dialogue: [
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Throughout history, certain rare beasts have absorbed primordial leylines, bearing what the ancient wizards termed "Marks".',
        loreNote: 'Marks range from Uncommon titles up to Mythic celestial blessings with shimmering auras.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'A Marked beast radiates distinctive luminescence—from the subtle azure of the Dawn Mark to the blinding radiance of the Mythic Mark.',
        loreNote: 'Each mark endows the beast with persistent battle perks and suitcase sanctuary bonuses.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'They are exceedingly rare and extraordinarily resilient. One must approach them with reverence, for they are living relics of magical history.'
      }
    ],
    interactiveChoice: {
      prompt: 'You detect a creature surrounded by a swirling golden aura—an ancient Mythic Mark. What is the wisest approach?',
      options: [
        {
          id: 'prepare',
          text: 'Ensure spell energy is full, drink a Maxima Potion, and cast your most type-effective spell.',
          response: 'Masterful strategy! Marked beasts test every ounce of a wizard\'s preparation. The celestial aura will yield to your resolve.',
          isOptimal: true,
          bonusKnuts: 80
        },
        {
          id: 'rush',
          text: 'Immediately cast Flipendo without preparing.',
          response: 'The Marked beast deflects your casual hex effortlessly, its danger ring flaring crimson.',
          isOptimal: false
        },
        {
          id: 'flee',
          text: 'Back away in terror.',
          response: 'Caution has its place, but true magizoology requires courage in the presence of greatness.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_grindelwald_1',
    mentorId: 'grindelwald',
    title: 'Commanding Leyline Dominance',
    subtitle: 'Bending Wild Arcana to Unyielding Will',
    domain: 'Dark Arts & Relic Mastery',
    recommendedLevel: 3,
    rewardXP: 320,
    rewardKnuts: 380,
    rewardTitle: 'Acolyte of the Greater Good',
    tacticalTakeaway: 'Aggressive subdual charms backed by Maxima draughts crush beast resistance before they can retaliate.',
    dialogue: [
      {
        speaker: 'Gellert Grindelwald',
        avatar: '/sprites/heroes/gellert_grindelwald.png',
        text: 'Do not apologize for your strength. The world belongs to those with the courage to claim it, not those who whisper timidly in corners.',
        loreNote: 'Wild beasts sense hesitation. A firm, resolute magical intent suppresses instinctual aggression.'
      },
      {
        speaker: 'Gellert Grindelwald',
        avatar: '/sprites/heroes/gellert_grindelwald.png',
        text: 'When a fierce beast challenges you, gentle cooing will only invite its fangs. Command the surrounding leyline. Impose order upon its fury.',
        loreNote: 'Grindelwald\'s Relentless Arcana grants +35% Spell Damage and tightens containment rings.'
      },
      {
        speaker: 'Gellert Grindelwald',
        avatar: '/sprites/heroes/gellert_grindelwald.png',
        text: 'Strike with conviction. When your wand descends, let there be no doubt in the creature\'s mind that it stands before a master.'
      }
    ],
    interactiveChoice: {
      prompt: 'A ferocious Nundu stalks out from the shadows, its toxic breath withering the grass. How do you assert dominance?',
      options: [
        {
          id: 'maxima_strike',
          text: 'Quaff a Maxima Draught and weave an overpowering Glacius ward to freeze its noxious breath.',
          response: 'Magnificent! Pure decisive power. The beast yields before your absolute mastery.',
          isOptimal: true,
          bonusKnuts: 75
        },
        {
          id: 'whistle',
          text: 'Whistle softly and offer a biscuit.',
          response: 'Folly! The Nundu would swallow you whole with the biscuit.',
          isOptimal: false
        },
        {
          id: 'cower',
          text: 'Drop your wand and shield your eyes.',
          response: 'Unacceptable weakness. Surrender is not in our lexicon.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_lally_1',
    mentorId: 'lally',
    title: 'Tactical Charms & Enchanted Tomes',
    subtitle: 'Conserving Energy and Outthinking the Adversary',
    domain: 'Ilvermorny Charmwork & Strategy',
    recommendedLevel: 2,
    rewardXP: 220,
    rewardKnuts: 280,
    rewardTitle: 'Scholar of Ilvermorny',
    tacticalTakeaway: 'Deploy Invisibility and tactical positioning to reduce spell energy consumption by -25%.',
    dialogue: [
      {
        speaker: 'Professor Eulalie Hicks',
        avatar: '/sprites/heroes/professor_lally.png',
        text: 'Hello there! Let me tell you a secret: the most dangerous wizard in any duel is never the loudest. It\'s the one who brought a good book and conserved their energy.',
        loreNote: 'Charmwork efficiency is paramount during prolonged outdoor field exploration.'
      },
      {
        speaker: 'Professor Eulalie Hicks',
        avatar: '/sprites/heroes/professor_lally.png',
        text: 'Every incantation draws from your personal reserves. Flailing your wand empties your stamina before you even notice. Think of every spell as a precise sentence.',
        loreNote: 'Lally\'s blessing decreases energy cost by -25% and expands Masterful timing windows.'
      },
      {
        speaker: 'Professor Eulalie Hicks',
        avatar: '/sprites/heroes/professor_lally.png',
        text: 'When a beast becomes skittish, shift your angle. Use the wind, use the shadows, and let the architecture work for you!'
      }
    ],
    interactiveChoice: {
      prompt: 'You are down to your last few drops of spell energy and a skittish Fwooper is singing loudly. What is the tactician\'s move?',
      options: [
        {
          id: 'invisibility_tome',
          text: 'Sip an Invisibility Draught, slip into its blind spot, and cast a measured Silencio with perfect form.',
          response: 'Excellently calculated! You neutralized the noise, saved your energy, and secured containment with zero waste.',
          isOptimal: true,
          bonusKnuts: 65
        },
        {
          id: 'rapid_fire',
          text: 'Spam five quick spells in rapid succession.',
          response: 'Your energy was depleted on cast two, and the Fwooper flew away screeching.',
          isOptimal: false
        },
        {
          id: 'shout',
          text: 'Shout at it to stop singing.',
          response: 'Its song drives listeners mad—shouting only made you dizzy!',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_theseus_1',
    mentorId: 'theseus',
    title: 'Ministry Perimeter Containment Protocols',
    subtitle: 'Locking Down High-Threat Beast Breakouts',
    domain: 'Auror Field Tactics & Defense',
    recommendedLevel: 2,
    rewardXP: 260,
    rewardKnuts: 320,
    rewardTitle: 'Chief Auror Envoy',
    tacticalTakeaway: 'Fortify with Edurus Barkskin before high-threat beasts retaliate with counter-attacks.',
    dialogue: [
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: 'Attention in the field! In war, as in rogue beast containment, panic is what gets wizards injured. Maintain your formation and secure the perimeter.',
        loreNote: 'Level 4★ and 5★ beasts possess aggressive retaliatory counter-attacks.'
      },
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: 'My brother Newt loves to pet them; I make sure nobody gets eaten. When an anomaly breaks containment, fortify your defense first with Edurus.',
        loreNote: 'Edurus potion absorbs 50% damage and prevents beasts from breaking through.'
      },
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: 'Once your shield is set, close the ring methodically. No bravado, no theatrics—just clean, textbook Ministry subdual.'
      }
    ],
    interactiveChoice: {
      prompt: 'A rogue Chimaera roars in the town square. Its claws strike sparks on the cobblestones. What is your containment protocol?',
      options: [
        {
          id: 'edurus_contain',
          text: 'Imbibe Edurus potion for stone barkskin, anchor your defensive perimeter, and weave an immobilizing Stupefy ward.',
          response: 'Textbook Auror execution! The Chimaera\'s swipe bounces harmlessly off your stone skin, leaving it vulnerable to capture.',
          isOptimal: true,
          bonusKnuts: 70
        },
        {
          id: 'charge',
          text: 'Charge headlong into melee range with your wand held like a rapier.',
          response: 'You were tossed twenty feet into a vegetable cart. Aurors rely on wards, not reckless charges!',
          isOptimal: false
        },
        {
          id: 'whistle_theseus',
          text: 'Try Newt\'s mating dance.',
          response: 'Good grief, leave the Erumpent mating dance to Newt! The Chimaera was merely insulted.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_theseus_2',
    mentorId: 'theseus',
    title: 'Level 5★: Apex Anomalies & Behemoths',
    subtitle: 'Subduing 5-Star (★★★★★) Apex Anomalies and Rampaging Behemoths',
    domain: 'Apex Containment & Combat',
    recommendedLevel: 4,
    rewardXP: 450,
    rewardKnuts: 500,
    rewardTitle: 'Apex Auror Vanguard',
    tacticalTakeaway: 'Thunderbrew Tempest Brew stuns aggressive beasts and freezes resistance rings, enabling safe high-tier subdual.',
    dialogue: [
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: '5-Star (★★★★★) Apex beasts are officially classified by the Ministry as the most dangerous known anomalies in the wizarding world.',
        loreNote: 'Includes Dragons, Chimaeras, Nundus, and Lethifolds.'
      },
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: 'When facing an Apex disturbance, conventional spells slip like water off their scales. You must break their kinetic momentum.',
        loreNote: 'Thunderbrew releases storm lightning that temporarily paralyzes rage rings.'
      },
      {
        speaker: 'Theseus Scamander',
        avatar: '/sprites/heroes/theseus_scamander.png',
        text: 'Deploy Thunderbrew to trigger an electrostatic disruption, then channel your subdual charm while the beast is grounded!'
      }
    ],
    interactiveChoice: {
      prompt: 'A Welsh Green Dragon charges with wings spread wide, flame gathering in its gullet. How do you disrupt its fatal breath?',
      options: [
        {
          id: 'thunderbrew_ground',
          text: 'Shatter a Thunderbrew potion beneath its talons to electrify the ground and ground its flight.',
          response: 'Flawless Auror tactics! The storm shockwave grounds the dragon and locks its resistance ring emerald green!',
          isOptimal: true,
          bonusKnuts: 100
        },
        {
          id: 'blow_fire',
          text: 'Try to blow the flames back with your breath.',
          response: 'Singed eyebrows and a trip to St. Mungo\'s. Never challenge dragon flame with your lungs.',
          isOptimal: false
        },
        {
          id: 'hide_bush',
          text: 'Hide behind a wooden fence.',
          response: 'Wood turns to cinder in half a second under dragon fire.',
          isOptimal: false
        }
      ]
    }
  }
];

export function getMentorTacticalAdvice(
  mentorId: MentorId,
  disturbance: Disturbance,
  inventory: Record<string, number>
): {
  text: string;
  actionSuggestion: string;
  urgency: 'normal' | 'caution' | 'critical';
} {
  const { beast, cp, mark } = disturbance;
  const isHighDanger = beast.dangerRating >= 4;
  const isApex = beast.classification === 'XXXXX' || cp >= 1500;
  const hasLowEnergy = (inventory.spell_energy || 0) < 15;
  const isHighFlee = beast.fleeRate >= 0.15;

  if (mentorId === 'dumbledore') {
    if (isApex) {
      return {
        text: `An ancient resonance stirs within this creature. Steel your mind and seek the hidden harmony before tracing your incantation.`,
        actionSuggestion: 'Focus Potion + Ancient Mark alignment.',
        urgency: 'critical'
      };
    }
    if (hasLowEnergy) {
      return {
        text: `Your magical reserves are critically low (${inventory.spell_energy || 0}⚡). Weave your next cast with absolute precision.`,
        actionSuggestion: 'Ensure your stroke touches every nexus point.',
        urgency: 'caution'
      };
    }
    if (isHighDanger) {
      return {
        text: `This ${beast.species} radiates turbulent transfiguration auras. Patience and harmony will tame its frenzy.`,
        actionSuggestion: 'Align with its elemental affinity before drawing.',
        urgency: 'caution'
      };
    }
    return {
      text: `Observe the rhythm of its breath. Every creature resonates with a fundamental frequency. Trace your spell with poise.`,
      actionSuggestion: `Use a spell effective against ${beast.type} types.`,
      urgency: 'normal'
    };
  }

  if (mentorId === 'grindelwald') {
    if (isApex || isHighDanger) {
      return {
        text: `A beast worthy of our power! Do not hesitate—strike with overwhelming force and bend its will to your command.`,
        actionSuggestion: 'Drink Maxima Draught for +50% subdual power.',
        urgency: 'critical'
      };
    }
    if (isHighFlee) {
      return {
        text: `It seeks to escape! Crush its retreat before it crosses the ward line.`,
        actionSuggestion: 'Deploy Thunderbrew to paralyze its evasion.',
        urgency: 'caution'
      };
    }
    return {
      text: `Command the magical current. Never let a wild entity dictate the pace of your engagement.`,
      actionSuggestion: 'Cast with unrelenting force.',
      urgency: 'normal'
    };
  }

  if (mentorId === 'lally') {
    if (hasLowEnergy) {
      return {
        text: `Conserve your stamina! A calculated charm placed accurately expends far less energy than frantic casting.`,
        actionSuggestion: 'Take your time to trace the exact glyph.',
        urgency: 'critical'
      };
    }
    if (isHighFlee) {
      return {
        text: `Watch its wings—it\'s calculating its escape vector. Slip into its blind spot before you begin.`,
        actionSuggestion: 'An Invisibility draught gives you the tactical edge.',
        urgency: 'caution'
      };
    }
    return {
      text: `Every creature is an equation waiting to be solved. Let\'s see what charm fits its disposition best.`,
      actionSuggestion: `Calm it with ${beast.favoriteTreat || 'food'} first.`,
      urgency: 'normal'
    };
  }

  // Default: Theseus Scamander
  if (isHighFlee || isApex) {
    return {
      text: `Ministry Alert: High-risk anomaly detected! Maintain perimeter discipline and lock down the escape routes.`,
      actionSuggestion: 'Deploy Thunderbrew or Edurus immediately.',
      urgency: 'critical'
    };
  }
  if (isHighDanger) {
    const mom = getMoMClassification(beast.classification);
    return {
      text: `${mom.stars} (${mom.tierName} Threat). Prepare for retaliation—fortify with Edurus Barkskin before striking.`,
      actionSuggestion: 'Drink an Edurus Potion to resist counter-attacks.',
      urgency: 'caution'
    };
  }
  if (mark) {
    return {
      text: `Marked specimen detected! Ministry archives catalog very few of these. Keep containment tight.`,
      actionSuggestion: 'Cast an immobilizing spell before it reacts.',
      urgency: 'normal'
    };
  }
  return {
    text: `Clean field conditions. Maintain wand stance and execute the containment pattern swiftly.`,
    actionSuggestion: 'Cast when the ring is smallest for maximum subdual chance.',
    urgency: 'normal'
  };
}
