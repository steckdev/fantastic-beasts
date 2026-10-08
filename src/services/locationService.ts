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

  for (let i = 0; i < count; i++) {
    // Offset within 30 to 220 meters
    const angle = Math.random() * Math.PI * 2;
    const distMeters = 30 + Math.random() * 190;
    const deltaLat = (distMeters * Math.cos(angle)) / 111320;
    const deltaLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos((centerLat * Math.PI) / 180));

    const beast = BEASTS[Math.floor(Math.random() * BEASTS.length)];
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

// Procedural Waypoints (Magical Inns & Greenhouses) around player
export function generateWaypoints(centerLat: number, centerLng: number, count: number = 5): Waypoint[] {
  const innNames = [
    'The Leaky Cauldron Inn',
    'The Hog\'s Head Outpost',
    'Madame Malkin\'s Rest Stop',
    'Flourish & Blotts Registry',
    'Herbology Greenhouse #3',
    'Apothecary Dispensary',
    'MACUSA Watchtower',
    'Kowalski Bakery Waypoint',
    'Magical Menagerie Supply'
  ];

  const waypoints: Waypoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const distMeters = 50 + Math.random() * 180;
    const deltaLat = (distMeters * Math.cos(angle)) / 111320;
    const deltaLng = (distMeters * Math.sin(angle)) / (111320 * Math.cos((centerLat * Math.PI) / 180));

    const isGreenhouse = i % 2 === 1;
    waypoints.push({
      id: `waypoint_${Math.floor(centerLat * 1000)}_${Math.floor(centerLng * 1000)}_${i}`,
      name: innNames[i % innNames.length],
      type: isGreenhouse ? 'greenhouse' : 'inn',
      icon: isGreenhouse ? '🌿' : '🍺',
      color: isGreenhouse ? '#10b981' : '#f59e0b',
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng,
      cooldownUntil: 0
    });
  }

  return waypoints;
}

// Try to query real OpenStreetMap Overpass POIs if network is available
export async function fetchNearbyRealPOIs(lat: number, lng: number): Promise<Waypoint[] | null> {
  try {
    const query = `
      [out:json][timeout:4];
      (
        node["amenity"~"cafe|restaurant|library|park|fountain"](around:400,${lat},${lng});
        node["historic"](around:400,${lat},${lng});
        node["tourism"](around:400,${lat},${lng});
      );
      out center 8;
    `;
    const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.elements || data.elements.length === 0) return null;

    return data.elements.map((el: { id: number; lat: number; lon: number; tags?: Record<string, string> }, idx: number) => {
      const tags = el.tags || {};
      const name = tags.name || tags.amenity || 'Magical Waypoint';
      const isGreenhouse = !!(tags.leisure || tags.park || tags.fountain);
      return {
        id: `osm_poi_${el.id}`,
        name: `${name} (${isGreenhouse ? 'Greenhouse' : 'Wizarding Inn'})`,
        type: isGreenhouse ? 'greenhouse' : 'inn',
        icon: isGreenhouse ? '🌿' : '🍺',
        color: isGreenhouse ? '#10b981' : '#f59e0b',
        lat: el.lat,
        lng: el.lon,
        cooldownUntil: 0
      };
    });
  } catch {
    return null;
  }
}
