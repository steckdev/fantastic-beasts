import { Disturbance, MentorId, MentorInfo, MasterclassLesson } from '../types';

export const MENTORS: Record<MentorId, MentorInfo> = {
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
    passivePerkDesc: '+35% Treat Calming Power in encounters; beast happiness and bond XP build significantly faster.',
    specialtyTip: 'Always carry an assortment of Brioches and Mooncalf Pellets. A content beast rarely attempts to flee.'
  },
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
  tina: {
    id: 'tina',
    name: 'Porpentina "Tina" Goldstein',
    title: 'MACUSA Field Auror & Investigator',
    domain: 'MACUSA Field Tactics & Subdual Wards',
    quote: '"Containment is about discipline and anticipation. One misstep, and the whole city wakes up."',
    philosophy: 'Read the threat before it strikes. Maintain perimeter control, deploy protective draughts early, and never let high-risk anomalies bolt.',
    sprite: '/sprites/heroes/tina_goldstein.png',
    accentColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    passivePerkName: 'Auror Rapid Response',
    passivePerkDesc: '+30% Spell Catch multiplier on Ministry Threat Level XXXX and XXXXX beasts; prevents sudden early flee attempts.',
    specialtyTip: 'When facing a high-danger disturbance, an Edurus or Invisibility potion tips the scales before the beast can retaliate.'
  }
};

export const MASTERCLASS_LESSONS: MasterclassLesson[] = [
  {
    id: 'lesson_newt_1',
    mentorId: 'newt',
    title: 'Magizoological Etiquette & Approach',
    subtitle: 'De-escalating Agitated Magical Behemoths',
    domain: 'Magizoology & Care',
    recommendedLevel: 1,
    rewardXP: 150,
    rewardKnuts: 220,
    rewardTitle: 'Friend of the Menagerie',
    tacticalTakeaway: 'Always inspect a beast\'s threat tier and feed treats before tracing your capture charm.',
    dialogue: [
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'Welcome to field study! Before you ever draw your wand against any creature, remember: fear is mutual. A beast lashes out only when cornered.',
        loreNote: 'Beasts in the wild respond directly to body posture, breathing cadence, and respectful distance.'
      },
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'Observe their posture closely. A relaxed creature lowers its shoulders and slows its cry; an agitated one bristles with crackling arcane auras.',
        loreNote: 'Crimson catch rings indicate intense beast resistance and heightened flee probability.'
      },
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'When encountering a skittish or fierce beast, never rush in with Flipendo. Offer food first—brioche for sweet appetites, moon pellets for nocturnal flyers.'
      }
    ],
    interactiveChoice: {
      prompt: 'You encounter a bristling, agitated Hippogriff in the wild. Its danger ring pulses crimson. What is your immediate course of action?',
      options: [
        {
          id: 'bow',
          text: 'Bow deeply, maintain unblinking eye contact, and wait for its nod.',
          response: 'Spot on! Respect is everything to a proud creature. Its posture softens immediately, turning the ring emerald green.',
          isOptimal: true,
          bonusKnuts: 50
        },
        {
          id: 'flipendo',
          text: 'Cast Flipendo immediately to stun it before it can strike.',
          response: 'A grave mistake! Hippogriffs take offense instantly. You must show deference first before attempting subdual.',
          isOptimal: false
        },
        {
          id: 'run',
          text: 'Turn and sprint to safety.',
          response: 'Running triggers their predatory chase instinct. Never turn your back on a majestic beast.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_newt_2',
    mentorId: 'newt',
    title: 'The Art of the Calming Draught',
    subtitle: 'Neutralizing Instinctive Panic in Urban Environments',
    domain: 'Potion Synergies',
    recommendedLevel: 2,
    rewardXP: 200,
    rewardKnuts: 260,
    rewardTitle: 'Calm Whisperer',
    tacticalTakeaway: 'Invisibility provides a free surprise bonus (+25% catch rate) and prevents premature flees.',
    dialogue: [
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'Sometimes treats alone aren\'t enough—especially with creatures that have tasted the sensory overload of human cities.',
        loreNote: 'Urban leyline noise can disorient sensitive creatures like Nifflers and Occamies.'
      },
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'This is where tactical alchemical elixirs come to the fore. A swift sip of Wiggenweld restores your magical stamina when the chase wears you thin.',
        loreNote: 'Wiggenweld also bolsters wand stability, steadying trembling fingers during tricky gestures.'
      },
      {
        speaker: 'Newt Scamander',
        avatar: '/sprites/heroes/newt_scamander.png',
        text: 'And if an Erumpent or Graphorn threatens to bolt, deploy an Invisibility Draught to approach unhindered from the downwind side!'
      }
    ],
    interactiveChoice: {
      prompt: 'A rare Ashwinder nest is cooling rapidly, and the serpent is thrashing frantically. How do you prevent it from fleeing?',
      options: [
        {
          id: 'invisibility',
          text: 'Drink an Invisibility Potion to cloak your scent and slip close quietly.',
          response: 'Brilliant thinking! Without sensing your presence, its panic subsides and containment proceeds smoothly.',
          isOptimal: true,
          bonusKnuts: 50
        },
        {
          id: 'woodlice',
          text: 'Toss woodlice directly into the glowing embers.',
          response: 'Ashwinders do not consume woodlice! You nearly singed your fingers on the magical fire.',
          isOptimal: false
        },
        {
          id: 'thunderbrew',
          text: 'Cast Thunderbrew right onto the nest.',
          response: 'Heavens no! The explosive shockwave would shatter the fragile eggs into ash.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_dumbledore_1',
    mentorId: 'dumbledore',
    title: 'The Geometry of Wand Harmony',
    subtitle: 'Tapping into Leyline Resonances and Precise Gestures',
    domain: 'Ancient Arcana & Wandcraft',
    recommendedLevel: 3,
    rewardXP: 250,
    rewardKnuts: 300,
    rewardTitle: 'Leyline Harmonizer',
    tacticalTakeaway: 'Focus Potions enhance Masterful cast accuracy multipliers up to 1.8x, turning difficult catches into triumphs.',
    dialogue: [
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Ah, welcome to the study of unseen geometry. Magic is not a blunt hammer, my friend, but a delicate resonance.',
        loreNote: 'Wand movement channels terrestrial leylines into physical manifestations.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'When tracing an incantation across the parchment of reality, speed without poise produces only chaotic sparks. The glyph requires steady intent.',
        loreNote: 'Masterful casts yield a 1.6x catch multiplier, jumping to 1.8x when bolstered by alchemical focus.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Focus your intent along the central axis of the spell glyph. Allow the wand tip to flow with uninterrupted grace.'
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
    recommendedLevel: 4,
    rewardXP: 350,
    rewardKnuts: 400,
    rewardTitle: 'Archivist of Ancient Runes',
    tacticalTakeaway: 'Marked beasts grant massive CP and permanent perks to your Sanctuary. Always prepare before engaging.',
    dialogue: [
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'Throughout history, certain beasts have absorbed primordial leylines, bearing what the ancients termed "Marks".',
        loreNote: 'Marks range from Uncommon titles up to Mythic celestial blessings with shimmering auras.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'A Marked beast radiates distinctive luminescence—from the subtle azure of the Dawn Mark to the blinding gold of the Mythic Mark.',
        loreNote: 'Each mark endows the beast with persistent battle perks and suitcase sanctuary bonuses.'
      },
      {
        speaker: 'Professor Albus Dumbledore',
        avatar: '/sprites/heroes/albus_dumbledore.png',
        text: 'They are exceedingly rare and extraordinarily resilient. One must approach them with reverence, for they are living relics of history.'
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
          bonusKnuts: 75
        },
        {
          id: 'lumos',
          text: 'Cast Lumos to signal other wizards across the city.',
          response: 'That breaches the Statute of Secrecy and blinds the creature, causing it to flee immediately!',
          isOptimal: false
        },
        {
          id: 'panic_throw',
          text: 'Throw all your treats at once in a panic.',
          response: 'Overwhelming the beast will cause it to retreat back into the astral planes.',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_tina_1',
    mentorId: 'tina',
    title: 'MACUSA Rapid Containment Protocols',
    subtitle: 'Warding Against Dangerous Beast Breakouts',
    domain: 'Field Auror Tactics',
    recommendedLevel: 2,
    rewardXP: 220,
    rewardKnuts: 250,
    rewardTitle: 'MACUSA Field Deputy',
    tacticalTakeaway: 'Edurus Potion nullifies aggressive beast counterattacks and safeguards your spell energy.',
    dialogue: [
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'Pay attention! When a beast breaks containment in a busy avenue, you have thirty seconds before No-Maj curiosity boils over.',
        loreNote: 'MACUSA enforces the Rappaport\'s Law strictly; containment speed protects both wizard and beast.'
      },
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'An Auror\'s first rule: establish the containment perimeter. Never let a beast get the high ground or an open alleyway to flee.',
        loreNote: 'Flee rates jump when beasts feel surrounded on multiple open fronts.'
      },
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'If a creature thrashes aggressively, don\'t trade blows. Shield yourself with Edurus to absorb retaliatory strikes without flinching.'
      }
    ],
    interactiveChoice: {
      prompt: 'A Dugbog lunges from the marsh, splashing corrosive bile toward you. How do you respond in the field?',
      options: [
        {
          id: 'edurus',
          text: 'Fortify with Edurus Potion and cast an Incendio counter-burst.',
          response: 'Textbook Auror field maneuver. The stony skin deflects the bile completely, and the fire drives the beast into subdual.',
          isOptimal: true,
          bonusKnuts: 50
        },
        {
          id: 'reason',
          text: 'Try to reason verbally with the swamp creature.',
          response: 'A Dugbog does not negotiate, rookie! Your robes are now covered in pungent bog slime.',
          isOptimal: false
        },
        {
          id: 'drop_wand',
          text: 'Turn and drop your wand.',
          response: 'Never abandon your wand in the field under any circumstance!',
          isOptimal: false
        }
      ]
    }
  },
  {
    id: 'lesson_tina_2',
    mentorId: 'tina',
    title: 'Ministry Threat Level 5: Apex Anomalies',
    subtitle: 'Subduing XXXXX Class Killers and Rampaging Behemoths',
    domain: 'Apex Containment & High Danger',
    recommendedLevel: 5,
    rewardXP: 400,
    rewardKnuts: 500,
    rewardTitle: 'Special Auror Taskforce Veteran',
    tacticalTakeaway: 'Apex Class XXXXX beasts require combined potion deployment (Stun + Maxima) for successful subdual.',
    dialogue: [
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'Classification XXXXX: "Known wizard killer / impossible to train or domesticate." Dragons, Nundus, Lethifolds, Basilisks.',
        loreNote: 'Only certified elite field teams are authorized for solitary XXXXX engagements.'
      },
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'At Threat Level 5, their base catch chance drops precipitously, and flee rates exceed thirty percent per cast cycle.',
        loreNote: 'A failed capture attempt on a Class 5 beast almost always provokes an immediate flee or retaliation.'
      },
      {
        speaker: 'Tina Goldstein',
        avatar: '/sprites/heroes/tina_goldstein.png',
        text: 'You cannot hesitate. Combine Maxima for spell potency, Thunderbrew to stun their sensory organs, and strike when the capture ring aligns.'
      }
    ],
    interactiveChoice: {
      prompt: 'An apex danger beast begins channeling a devastating whirlwind to flee the encounter. What is the decisive sequence?',
      options: [
        {
          id: 'combo',
          text: 'Deploy Thunderbrew to interrupt the vortex, followed by a Maxima-empowered binding charm.',
          response: 'Flawless execution! The lightning surge grounds the beast, creating the perfect capture opportunity before it can escape.',
          isOptimal: true,
          bonusKnuts: 80
        },
        {
          id: 'bread',
          text: 'Offer it a stale crust of bread.',
          response: 'An apex predator will consume your wand arm along with the bread! Do not underestimate a XXXXX threat.',
          isOptimal: false
        },
        {
          id: 'wait',
          text: 'Wait and see if it calms down on its own.',
          response: 'Too late! It apparated through the skyline, leaving a trail of shattered glass.',
          isOptimal: false
        }
      ]
    }
  }
];

export interface MentorAdviceResult {
  text: string;
  actionSuggestion: string;
  urgency: 'normal' | 'caution' | 'critical';
}

export function getMentorTacticalAdvice(
  mentorId: MentorId,
  disturbance: Disturbance,
  inventory: Record<string, number>
): MentorAdviceResult {
  const { beast, cp, mark } = disturbance;
  const isHighDanger = beast.dangerRating >= 4;
  const isApex = beast.dangerRating === 5;
  const isHighFlee = beast.fleeRate >= 0.15;
  const hasLowEnergy = (inventory.spell_energy || 0) < 15;

  if (mentorId === 'dumbledore') {
    if (mark) {
      return {
        text: `Behold the ancient ${mark.title}! Leyline energies converge in this creature. Do not rush your wand movement.`,
        actionSuggestion: 'Focus on a smooth, measured gesture for a Masterful Cast.',
        urgency: 'normal'
      };
    }
    if (isApex) {
      return {
        text: `A formidable Class XXXXX entity. Raw willpower alone will not suffice—empower your casting with Maxima.`,
        actionSuggestion: 'Drink Maxima or Focus Potion from your belt.',
        urgency: 'critical'
      };
    }
    if (hasLowEnergy) {
      return {
        text: `Your magical reserves are critically low (${inventory.spell_energy}⚡). Weave your next cast with absolute precision.`,
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

  if (mentorId === 'tina') {
    if (isHighFlee || isApex) {
      return {
        text: `MACUSA Alert: Flee risk is extreme! One sloppy gesture and this ${beast.name} will bolt into the city streets.`,
        actionSuggestion: 'Deploy Invisibility or Thunderbrew immediately.',
        urgency: 'critical'
      };
    }
    if (isHighDanger) {
      return {
        text: `Threat Level ${beast.classification}. Prepare for retaliation—fortify with Edurus or strike with overwhelming force.`,
        actionSuggestion: 'Drink an Edurus Potion to resist counter-attacks.',
        urgency: 'caution'
      };
    }
    if (mark) {
      return {
        text: `Marked specimen detected! MACUSA archives have cataloged very few like this. Keep containment tight.`,
        actionSuggestion: 'Cast an immobilizing spell before it reacts.',
        urgency: 'normal'
      };
    }
    if (hasLowEnergy) {
      return {
        text: `Spell energy dropping fast! You can't afford wasted casts on this perimeter.`,
        actionSuggestion: 'Replenish at an Inn soon after this capture.',
        urgency: 'caution'
      };
    }
    return {
      text: `Clean field conditions. Maintain wand stance and execute the containment pattern swiftly.`,
      actionSuggestion: 'Cast when the ring is smallest for maximum subdual chance.',
      urgency: 'normal'
    };
  }

  // Default: Newt Scamander
  if (mark) {
    return {
      text: `Look at that magnificent ${mark.title}! It has lived in harmony with the wild for generations. Treat it with kindness!`,
      actionSuggestion: `Feed it ${beast.favoriteTreat || 'a Brioche'} to earn its trust.`,
      urgency: 'normal'
    };
  }
  if (isHighDanger || isApex) {
    return {
      text: `Careful now—she's terrified and feeling cornered! Don't make any sudden movements or aggressive flashes.`,
      actionSuggestion: `Calm it with a treat before drawing your wand.`,
      urgency: 'caution'
    };
  }
  if (isHighFlee) {
    return {
      text: `Skittish little soul! A single loud incantation might scare it off. A treat will keep it right here.`,
      actionSuggestion: `A ${beast.favoriteTreat || 'sweet pastry'} will settle its nerves.`,
      urgency: 'caution'
    };
  }
  if (hasLowEnergy) {
    return {
      text: `You're looking rather drained, my friend. Don't strain yourself—one gentle, confident cast will do it.`,
      actionSuggestion: 'Take a deep breath and trace with care.',
      urgency: 'caution'
    };
  }
  return {
    text: `A wonderful ${beast.species}! Its favorite treat is ${beast.favoriteTreat || 'brioche'}. Show it we mean no harm.`,
    actionSuggestion: 'A treat will make your capture charm much easier to weave.',
    urgency: 'normal'
  };
}
