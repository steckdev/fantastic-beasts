import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Car, Sparkles, Wind } from 'lucide-react';
import { getDistanceMeters } from '../services/locationService';
import { HEROES } from '../data/heroesData';
import { Disturbance, Waypoint, CapturedBeast, Beast } from '../types';
import { BEASTS } from '../data/beastsData';
import BuddyWidget from './BuddyWidget';

interface MapEngineProps {
  playerPos: { lat: number; lng: number };
  onMovePlayer: (lat: number, lng: number) => void;
  disturbances: Disturbance[];
  waypoints: Waypoint[];
  selectedHeroId: string;
  buddyInstance: CapturedBeast | null;
  buddyProgressKm: number;
  totalKmWalked: number;
  totalSteps: number;
  onOpenBuddySelect: () => void;
  driveMode: boolean;
  onToggleDriveMode: () => void;
  useVirtualGPS: boolean;
  onToggleVirtualGPS: () => void;
  onSelectDisturbance: (distObj: Disturbance, inRange: boolean, distMeters: number) => void;
  onSelectWaypoint: (wp: Waypoint, inRange: boolean, distMeters: number) => void;
  activeLureTimeLeft: number;
}

export default function MapEngine({
  playerPos,
  onMovePlayer,
  disturbances,
  waypoints,
  selectedHeroId,
  buddyInstance,
  buddyProgressKm,
  totalKmWalked,
  totalSteps,
  onOpenBuddySelect,
  driveMode,
  onToggleDriveMode,
  onSelectDisturbance,
  onSelectWaypoint,
  activeLureTimeLeft
}: MapEngineProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const buddyMarkerRef = useRef<L.Marker | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [showJoystick, setShowJoystick] = useState(false);

  const hero = HEROES.find((h) => h.id === selectedHeroId) || HEROES[0];
  const buddyBeast: Beast | undefined = buddyInstance
    ? BEASTS.find((b) => b.id === buddyInstance.beastId)
    : undefined;

  const interactionRadius = driveMode ? 130 : 80;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [playerPos.lat, playerPos.lng],
        zoom: 17,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Voyager tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
  }, []);

  // Update Player Position, Buddy Avatar, and Radar Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latlng: [number, number] = [playerPos.lat, playerPos.lng];

    // Player Avatar Marker
    const playerIcon = L.divIcon({
      className: 'player-marker-container',
      html: `
        <div style="
          position: relative;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.7), inset 0 0 10px rgba(0,0,0,0.5);
          background: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <img src="${hero.sprite}" style="width: 44px; height: 44px; object-fit: contain;" alt="${hero.name}" />
          <div style="
            position: absolute;
            bottom: -6px;
            background: #d97706;
            color: #fff;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 6px;
            border-radius: 10px;
            letter-spacing: 0.5px;
            border: 1px solid #fef08a;
          ">YOU</div>
        </div>
      `,
      iconSize: [54, 54],
      iconAnchor: [27, 27]
    });

    if (!playerMarkerRef.current) {
      playerMarkerRef.current = L.marker(latlng, { icon: playerIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      playerMarkerRef.current.setLatLng(latlng);
      playerMarkerRef.current.setIcon(playerIcon);
    }

    // Walking Buddy Companion Marker (positioned slightly to the east of player)
    if (buddyBeast) {
      const buddyLatLng: [number, number] = [playerPos.lat, playerPos.lng + 0.00012];
      const buddyIcon = L.divIcon({
        className: 'buddy-marker-container',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 2px solid #38bdf8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
            background: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: float 2.5s ease-in-out infinite;
          ">
            <img src="${buddyBeast.sprite}" style="width: 30px; height: 30px; object-fit: contain;" alt="${buddyBeast.name}" />
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      if (!buddyMarkerRef.current) {
        buddyMarkerRef.current = L.marker(buddyLatLng, { icon: buddyIcon, zIndexOffset: 950 }).addTo(map);
      } else {
        buddyMarkerRef.current.setLatLng(buddyLatLng);
        buddyMarkerRef.current.setIcon(buddyIcon);
      }
    } else if (buddyMarkerRef.current) {
      buddyMarkerRef.current.remove();
      buddyMarkerRef.current = null;
    }

    // Interaction Radius Circle
    if (!pulseCircleRef.current) {
      pulseCircleRef.current = L.circle(latlng, {
        radius: interactionRadius,
        color: '#fbbf24',
        weight: 1.5,
        opacity: 0.8,
        fillColor: '#d97706',
        fillOpacity: 0.08,
        dashArray: '6, 8'
      }).addTo(map);
    } else {
      pulseCircleRef.current.setLatLng(latlng);
      pulseCircleRef.current.setRadius(interactionRadius);
    }
  }, [playerPos, hero, buddyBeast, driveMode, interactionRadius]);

  // Update Disturbances and Waypoints Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Render Waypoints
    waypoints.forEach((wp) => {
      const dist = Math.round(getDistanceMeters(playerPos.lat, playerPos.lng, wp.lat, wp.lng));
      const inRange = dist <= interactionRadius;
      const isCooldown = wp.cooldownUntil && wp.cooldownUntil > Date.now();

      const wpIcon = L.divIcon({
        className: 'waypoint-marker',
        html: `
          <div style="
            position: relative;
            width: 48px;
            height: 48px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 12px;
              background: ${isCooldown ? 'rgba(75, 85, 99, 0.85)' : wp.type === 'greenhouse' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #b45309, #f59e0b)'};
              border: 2px solid ${isCooldown ? '#9ca3af' : '#fef08a'};
              box-shadow: 0 4px 14px ${isCooldown ? 'rgba(0,0,0,0.5)' : 'rgba(245, 158, 11, 0.6)'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            ">
              ${isCooldown ? '⏳' : wp.icon}
            </div>
            <div style="
              margin-top: 3px;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(255,255,255,0.2);
              color: ${inRange ? '#fef08a' : '#cbd5e1'};
              font-size: 9px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 6px;
              white-space: nowrap;
            ">
              ${dist}m
            </div>
          </div>
        `,
        iconSize: [48, 56],
        iconAnchor: [24, 28]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon });
      marker.on('click', () => {
        onSelectWaypoint(wp, inRange, dist);
      });
      group.addLayer(marker);
    });

    // 2. Render Magical Disturbances
    disturbances.forEach((distObj) => {
      const dist = Math.round(getDistanceMeters(playerPos.lat, playerPos.lng, distObj.lat, distObj.lng));
      const inRange = dist <= interactionRadius;
      const hasMark = !!distObj.mark;

      const traceIcon = L.divIcon({
        className: 'disturbance-marker',
        html: `
          <div style="
            position: relative;
            width: 52px;
            height: 52px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: ${distObj.auraColor};
              opacity: 0.35;
              animation: pulse-ring 2s infinite ease-in-out;
            "></div>

            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${hasMark ? '#fde047' : distObj.auraColor};
              box-shadow: 0 0 14px ${distObj.auraColor};
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            ">
              <img src="${distObj.beast.sprite}" style="width: 32px; height: 32px; object-fit: contain;" alt="${distObj.beast.name}" />
              ${
                hasMark
                  ? `<div style="
                      position: absolute;
                      top: 1px;
                      right: 1px;
                      font-size: 10px;
                      filter: drop-shadow(0 0 3px #fbbf24);
                    ">${distObj.mark?.icon || '✨'}</div>`
                  : ''
              }
            </div>

            <div style="
              position: absolute;
              bottom: -4px;
              background: rgba(11, 15, 25, 0.9);
              border: 1px solid ${inRange ? '#fbbf24' : 'rgba(255,255,255,0.2)'};
              color: ${inRange ? '#fef08a' : '#cbd5e1'};
              font-size: 9px;
              font-weight: 700;
              padding: 1px 4px;
              border-radius: 6px;
              white-space: nowrap;
            ">
              ${dist}m
            </div>
          </div>
        `,
        iconSize: [52, 60],
        iconAnchor: [26, 30]
      });

      const marker = L.marker([distObj.lat, distObj.lng], { icon: traceIcon });
      marker.on('click', () => {
        onSelectDisturbance(distObj, inRange, dist);
      });
      group.addLayer(marker);
    });
  }, [disturbances, waypoints, playerPos, interactionRadius, onSelectDisturbance, onSelectWaypoint]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([playerPos.lat, playerPos.lng], 17, { animate: true });
    }
  };

  const stepPlayer = (dLat: number, dLng: number) => {
    onMovePlayer(playerPos.lat + dLat, playerPos.lng + dLng);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Floating Status Bar */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(var(--safe-top) + 8px)',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 400
        }}
      >
        {/* Buddy Companion Widget */}
        <div style={{ pointerEvents: 'auto' }}>
          <BuddyWidget
            buddyInstance={buddyInstance}
            buddyProgressKm={buddyProgressKm}
            totalKmWalked={totalKmWalked}
            totalSteps={totalSteps}
            onOpenBuddySelect={onOpenBuddySelect}
          />
        </div>

        {/* Lure & Mode Badges */}
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          {activeLureTimeLeft > 0 && (
            <div
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                borderColor: '#fbbf24',
                color: '#fde047',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Lure ({Math.ceil(activeLureTimeLeft / 60)}m)</span>
            </div>
          )}

          {driveMode && (
            <div
              className="glass-panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                borderColor: '#38bdf8',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <Car size={14} />
              <span>Drive (130m)</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Control Buttons (Right Side) */}
      <div
        style={{
          position: 'absolute',
          right: '16px',
          bottom: 'calc(var(--safe-bottom) + 85px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 400
        }}
      >
        <button className="btn-icon" onClick={handleRecenter} title="Center on Player">
          <Navigation size={20} />
        </button>

        <button
          className="btn-icon"
          onClick={onToggleDriveMode}
          title={driveMode ? 'Drive Mode Active' : 'Enable Drive Mode'}
          style={{
            borderColor: driveMode ? '#38bdf8' : 'var(--border-gold)',
            color: driveMode ? '#38bdf8' : 'var(--gold-bright)'
          }}
        >
          <Car size={20} />
        </button>

        <button
          className="btn-icon"
          onClick={() => setShowJoystick(!showJoystick)}
          title="Virtual Broomstick Joystick"
          style={{
            borderColor: showJoystick ? '#fbbf24' : 'var(--border-gold)',
            color: showJoystick ? '#fbbf24' : 'var(--gold-bright)'
          }}
        >
          <Wind size={20} />
        </button>
      </div>

      {/* Virtual Joystick / D-Pad */}
      {showJoystick && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            left: '16px',
            bottom: 'calc(var(--safe-bottom) + 85px)',
            padding: '8px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            zIndex: 400,
            background: 'rgba(11, 15, 25, 0.88)'
          }}
        >
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>BROOMSTICK</div>
          <button
            className="btn-secondary"
            style={{ width: '40px', height: '36px', padding: 0 }}
            onClick={() => stepPlayer(0.00022, 0)}
          >
            ▲
          </button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn-secondary"
              style={{ width: '40px', height: '36px', padding: 0 }}
              onClick={() => stepPlayer(0, -0.00028)}
            >
              ◀
            </button>
            <button
              className="btn-secondary"
              style={{ width: '40px', height: '36px', padding: 0 }}
              onClick={() => stepPlayer(-0.00022, 0)}
            >
              ▼
            </button>
            <button
              className="btn-secondary"
              style={{ width: '40px', height: '36px', padding: 0 }}
              onClick={() => stepPlayer(0, 0.00028)}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
