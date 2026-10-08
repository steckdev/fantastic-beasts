import { BEASTS } from '../data/beastsData';
import { rollMark } from '../data/marksData';
import { Disturbance, Waypoint } from '../types';

// Calculate distance in meters between two lat/lng coordinates (Haversine)
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Generate procedural disturbances around coordinates
export function generateDisturbances(
  centerLat: number,
  centerLng: number,
  count: number = 7,
  bonusMarkMultiplier: number = 1.0
): Disturbance[] {
  const disturbances: Disturbance[] = [];
  const traceCategories = [
    { type: 'magizoology', color: '#fbbf24', label: 'Magizoological Trace' },
    { type: 'wonders', color: '#38bdf8', label: 'Mystic Anomaly' },
    { type: 'peril', color: '#ef4444', label: 'High Danger Disturbance' },
    { type: 'spectral', color: '#c084fc', label: 'Spectral Distortion' }
  ];

  const wildBeasts = BEASTS.filter((b) => !b.isRaidExclusive);

  for (let i = 0; i < count; i++) {
    // Offset within 30 to 220 meters
    const angle = Math.random() * Math.PI * 2;
    const distMeters = 30 + Math.random() * 190;
    const deltaLat = (distMeters * Math.cos(angle)) / 111320;
    const deltaLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos((centerLat * Math.PI) / 180));

    const beast = wildBeasts[Math.floor(Math.random() * wildBeasts.length)];
    const cat = traceCategories[Math.floor(Math.random() * traceCategories.length)];
    const mark = rollMark(bonusMarkMultiplier);

    // Creature Power (CP) calculation with mark bonus
    let cp = Math.floor(beast.minCP + Math.random() * (beast.maxCP - beast.minCP));
    if (mark) cp = Math.floor(cp * 1.25);

    disturbances.push({
      id: `dist_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng,
      beast,
      cp,
      mark,
      category: cat.type,
      categoryLabel: cat.label,
      auraColor: mark ? mark.color : cat.color,
      spawnedAt: Date.now(),
      expiresAt: Date.now() + (8 + Math.floor(Math.random() * 6)) * 60 * 1000
    });
  }

  return disturbances;
}

// Procedural Waypoints (Magical Inns, Greenhouses, and Legendary Fortresses replacing 1/5)
export function generateWaypoints(centerLat: number, centerLng: number, count: number = 7): Waypoint[] {
  const innNames = [
    'The Leaky Cauldron Inn',
    'The Hog\'s Head Outpost',
    'Madame Malkin\'s Rest Stop',
    'Flourish & Blotts Registry',
    'Slug & Jiggers Apothecary',
    'MACUSA Auror Watchtower',
    'Jacob Kowalski\'s Bakery Waypoint',
    'Magical Menagerie Supply Cache',
    'Ollivanders Wand Workshop',
    'The Blind Pig Speakeasy'
  ];

  const fortressNames = [
    'Ancient Leyline Citadel',
    'Obsidian Dragon Spire',
    'MACUSA Maximum Ward Vault',
    'Tormenting Storm Spire',
    'High Alchemist Ancient Keep'
  ];

  const raidBeasts = BEASTS.filter((b) => b.isRaidExclusive);

  const waypoints: Waypoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const distMeters = 40 + Math.random() * 190;
    const deltaLat = (distMeters * Math.cos(angle)) / 111320;
    const deltaLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos((centerLat * Math.PI) / 180));

    // 1 in 5 (20%) replaces an inn with a Legendary Fortress
    const isFortress = i % 5 === 0;
    const isGreenhouse = !isFortress && i % 2 === 1;

    let wpType: 'inn' | 'greenhouse' | 'fortress' = 'inn';
    let wpName = innNames[i % innNames.length];
    let wpIcon = '🍺';
    let wpColor = '#f59e0b';
    let raidBossData = undefined;

    if (isFortress) {
      wpType = 'fortress';
      wpName = fortressNames[i % fortressNames.length];
      wpIcon = '🏰';
      wpColor = '#c084fc';

      const bossDef = raidBeasts.length > 0 ? raidBeasts[i % raidBeasts.length] : BEASTS[0];
      const bossCp = Math.floor(bossDef.minCP * 1.35 + Math.random() * 600);
      raidBossData = {
        beastId: bossDef.id,
        cp: bossCp,
        name: bossDef.name,
        hp: 100,
        maxHp: 100,
        sprite: bossDef.sprite
      };
    } else if (isGreenhouse) {
      wpType = 'greenhouse';
      wpName = `Herbology Conservatory #${(i % 4) + 1}`;
      wpIcon = '🌿';
      wpColor = '#10b981';
    }

    waypoints.push({
      id: `waypoint_${Math.floor(centerLat * 1000)}_${Math.floor(centerLng * 1000)}_${i}`,
      name: wpName,
      type: wpType,
      icon: wpIcon,
      color: wpColor,
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng,
      cooldownUntil: 0,
      raidBoss: raidBossData
    });
  }

  return waypoints;
}

// Procedural-only POI loader to avoid third-party CORS issues
export async function fetchNearbyRealPOIs(_lat: number, _lng: number): Promise<Waypoint[] | null> {
  // Rely directly on robust procedural waypoints to ensure 100% uptime without CORS errors
  return null;
}
