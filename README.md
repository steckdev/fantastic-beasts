# 🧳 Fantastic Beasts GO

> **An On-The-Go Magizoology Adventure for iPhone & Mobile**  
> Inspired by Pokémon GO mechanics and set in the Wizarding World of *Fantastic Beasts*.

Track leylines and magical disturbances across your local town, encounter and capture 36 canonical Fantastic Beasts, discover rare Pokémon-style Ancient Marks, spin Magical Inns & Greenhouses for energy and treats, and visit Newt's Suitcase Sanctuary to feed, pet, and bond with your creatures!

---

## ✨ Key Features

### 🧙‍♂️ 1. Character Selection & Story
- **Newt Scamander**: World-Renowned Magizoologist (*+25% faster Bond Level growth with beasts*).
- **Tina Goldstein**: MACUSA Auror Investigator (*+25% Spell Accuracy on unruly beasts; reveals Dark disturbances*).
- **Jacob Kowalski**: Master Baker (*Pastries & brioches are +50% more effective at calming wild beasts*).
- **Queenie Goldstein**: Gifted Legilimens (*3x higher chance of encountering beasts with rare Ancient Marks*).

### 📍 2. On-the-Go Location Gameplay & Cartography
- **Real GPS Geolocation**: High-accuracy tracking via browser `watchPosition` with animated interaction radar (80m radius).
- **Passenger / Drive Mode**: Designed specifically for family drives! Expands radar range to **130m** and accelerates sweep frequency without speed locks.
- **Virtual Broomstick Joystick**: Smooth D-pad / tap navigation so you can explore from home or test without walking outside.
- **Energy Disturbances (Beast Traces)**: Procedural & real OpenStreetMap POI disturbance generation. Four trace categories:
  - 🟡 *Magizoological Traces* (Nifflers, Bowtruckles, Pygmy Puffs, Mooncalves, Crups)
  - 🔵 *Mystic Anomalies* (Demiguises, Occamies, Qilin, Thunderbirds)
  - 🔴 *High Danger Disturbances* (Nundu, Acromantula, Phoenix, Chimaera, Horned Serpent)
  - 🟣 *Spectral Distortions* (Thestrals, Boggarts, Kelpies, Erumpents)
- **Waypoints (Magical Inns & Greenhouses)**: Real & procedural leylines. Spin the enchanted plate to collect Spell Energy, Bronze Knuts, treats, and Enchanted Suitcase Lures! (5-minute cooldown).

### ⚡ 3. Wild Encounter & Capture Minigame
- **Dynamic Capture Arena**: Habitat backdrops, floating creature sprites with idle breathing animations, Threat Levels (1 to 5), and dynamic Capture Probability rings.
- **Interactive Wand Gestures**: Trace wand glyphs (*Flipendo*, *Arresto Momentum*, *Bombarda*) with glowing spark trails to achieve Fair, Good, Great, or Masterful accuracy.
- **Treat Feeding**: Toss Jacob's Sweet Brioche, Gilded Sugar Coins, or Moon Pellets to calm agitated beasts and boost catch rates.
- **Suitcase Catch Sequence**: Suitcase snaps open, pulls the beast in with a vortex, and shakes 3 times before latching shut.

### 🌟 4. Pokémon-Style Rarity "Marks"
Wild beasts have a chance to possess an **Ancient Mark** conferring a prestigious title, glowing aura, and permanent bonus:
- ⚡ **Mark of the Storm** (*the Tempest-Born*) — Golden electric aura & +15% spell resistance
- 🪙 **Mark of the Gilded** (*the Shiny-Hoarder*) — Golden shimmer & doubles Knut harvests
- 💤 **Mark of the Slumbering** (*the Sleepy*) — Drowsy purple sparkles & easy to calm
- 🌅 **Mark of the Dawn** (*the Early-Riser*) — Sunrise amber glow & +20% daytime Bond XP
- 🌙 **Mark of Twilight** (*the Night-Prowler*) — Indigo moonlight aura & +20% nighttime Bond XP
- ᚱ **Mark of the Ancient Rune** (*the Rune-Bearer*) — Glowing runic glyph halo & +30% CP
- 🎭 **Mark of Mischief** (*the Unruly Scamp*) — Crimson spark aura & unexpected gifts
- ✨ **Mark of Starlight** (*the Star-Touched*) — Ultra-rare cosmic nebula aura (1/50 roll!)
- 👑 **Mark of the Pure-Hearted** (*the Chosen Familiar*) — Mythic prismatic halo (1/100 roll, recognized by Qilin!)

### 🌿 5. Newt's Suitcase Sanctuary & Beast Care
- **5 Biome Habitats**: Sunlit Plains, Enchanted Forest, Mystic Marsh, Sky Heights, Ancient Ruins.
- **Interactive Petting**: Stroke or tap your beast to hear purrs, release floating heart bursts, and build affection.
- **Favorite Treat Feeding**: Feed species-specific treats (Gilded Knuts for Nifflers, Sweet Woodlice for Bowtruckles, Moon Pellets for Mooncalves) for bonus Bond XP!
- **Bond Levels 1 to 10**: Unlock custom companion bounces, sparkling golden auras, daily gifts, and nicknames.

### 📖 6. Complete 36-Beast Magizoology Field Guide
- Canonical descriptions, Ministry classifications (XX to XXXXX), native habitats, diets, and discovery trackers for all 36 Fantastic Beasts.

### 📜 7. MACUSA Tasks & Quests
- Fulfill Ministry missions (capturing beasts, spinning Inns, casting Masterful spells, finding Marks) to unlock rare treats and Enchanted Suitcase Lures.

---

## 📱 iPhone / PWA Installation Guide

1. Open Safari on your iPhone and navigate to the hosted app URL (or local network IP).
2. Tap the **Share** button (box with upward arrow) at the bottom of the screen.
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **"Add"**. The **Fantastic Beasts GO** icon will now appear on your home screen, launching full-screen like a native app with offline caching and GPS tracking!

---

## 🛠️ Technology Stack

- **Core**: React 19, JavaScript (ESM)
- **Build Tool**: Vite 6
- **Cartography**: Leaflet 1.9 with CartoDB Voyager tiles
- **Audio**: Web Audio API (procedural wand hums, beast cries, purrs, and fanfares)
- **Styling**: Bespoke Vanilla CSS design system with glassmorphism, Cinzel & Plus Jakarta Sans typography, and iOS notch safe-area handling.
- **Offline / PWA**: Manifest v3 spec & Service Worker caching.

---

## 🚀 Development & Local Run

```bash
# Install dependencies
npm install

# Start Vite dev server (accessible across local Wi-Fi / iPhone)
npm run dev -- --host
```
