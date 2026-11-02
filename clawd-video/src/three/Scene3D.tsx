import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { FPS, type TimedSegment } from '../timing';
import { Clawd3D, Sam3D, type ClawdPose, type SamPose } from './Characters';
import type { Mood } from '../story/Sam';

export type Seg3D = { speaker: 'clawd' | 'sam'; clawd: string; holo: string; mood: Mood };

const COUNTER_Y = 1.0;
const SAM_POS: [number, number, number] = [-0.55, 0, -0.35];
const CLAWD_POS: [number, number, number] = [0.6, COUNTER_Y, 0.15];

/* ---------- ville la nuit (texture dessinée une seule fois) ---------- */

const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const useCityTexture = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    const g = c.getContext('2d')!;
    const sky = g.createLinearGradient(0, 0, 0, 1024);
    sky.addColorStop(0, '#081230');
    sky.addColorStop(0.7, '#15306A');
    sky.addColorStop(1, '#22397A');
    g.fillStyle = sky;
    g.fillRect(0, 0, 1024, 1024);
    g.fillStyle = '#F3EBD3';
    g.beginPath();
    g.arc(800, 150, 46, 0, Math.PI * 2);
    g.fill();
    for (let layer = 0; layer < 2; layer++) {
      let x = -20;
      let i = layer * 100;
      while (x < 1024) {
        const w = 60 + rand(i) * 70;
        const h = (layer ? 380 : 260) + rand(i + 7) * (layer ? 420 : 300);
        g.fillStyle = layer ? '#0B1633' : '#13224A';
        g.fillRect(x, 1024 - h, w, h);
        for (let wy = 1024 - h + 14; wy < 1010; wy += 26) {
          for (let wx = x + 8; wx < x + w - 12; wx += 18) {
            const on = rand(wx * 3.1 + wy * 7.7 + layer) > (layer ? 0.55 : 0.7);
            g.fillStyle = on ? (layer ? '#F6C76B' : '#C9A35A') : layer ? '#1B2A55' : '#1A2B58';
            g.fillRect(wx, wy, 9, 12);
          }
        }
        x += w + 6;
        i++;
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

const Room: React.FC<{ glow: number }> = ({ glow }) => {
  const city = useCityTexture();
  return (
    <>
      {/* ville derrière la baie vitrée */}
      <mesh position={[0, 3.2, -6]}>
        <planeGeometry args={[14, 9]} />
        <meshBasicMaterial map={city} />
      </mesh>
      {/* montants de la baie */}
      {[-3.3, -1.1, 1.1, 3.3].map((x) => (
        <mesh key={x} position={[x, 3, -2.2]}>
          <boxGeometry args={[0.12, 6, 0.12]} />
          <meshStandardMaterial color="#0B0F1E" />
        </mesh>
      ))}
      <mesh position={[0, 5.2, -2.2]}>
        <boxGeometry args={[8, 0.2, 0.2]} />
        <meshStandardMaterial color="#0B0F1E" />
      </mesh>
      {/* étagère avec bocaux, à gauche */}
      <group position={[-2.3, 0, -1.6]}>
        {[1.3, 2.0].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[1.6, 0.06, 0.4]} />
            <meshStandardMaterial color="#5A4234" />
          </mesh>
        ))}
        {[-0.55, -0.2, 0.15, 0.5].map((x, i) => (
          <mesh key={x} position={[x, 1.45 + (i % 2) * 0.7, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.24, 8]} />
            <meshStandardMaterial color={['#E8B04A', '#7FB069', '#D9534F', '#F2EFE8'][i]} flatShading />
          </mesh>
        ))}
      </group>
      {/* sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1A1420" />
      </mesh>
      {/* comptoir */}
      <mesh position={[0, COUNTER_Y - 0.04, 0.1]}>
        <boxGeometry args={[7, 0.08, 1.2]} />
        <meshStandardMaterial color="#8A6448" roughness={0.6} />
      </mesh>
      <mesh position={[0, (COUNTER_Y - 0.08) / 2, 0.65]}>
        <boxGeometry args={[7, COUNTER_Y - 0.08, 0.1]} />
        <meshStandardMaterial color="#4E392D" roughness={0.9} />
      </mesh>
      {/* tasse de Sam */}
      <mesh position={[-0.95, COUNTER_Y + 0.08, 0.38]}>
        <cylinderGeometry args={[0.07, 0.06, 0.16, 10]} />
        <meshStandardMaterial color="#F2EFE8" flatShading />
      </mesh>
      {/* projecteur d'hologramme */}
      <mesh position={[0.02, COUNTER_Y + 0.03, 0.35]}>
        <cylinderGeometry args={[0.2, 0.24, 0.05, 24]} />
        <meshStandardMaterial color="#10213F" emissive="#4FE3F0" emissiveIntensity={0.5 + glow * 0.8} />
      </mesh>
      <mesh position={[0.02, COUNTER_Y + 0.9, 0.35]}>
        <cylinderGeometry args={[0.7, 0.2, 1.75, 24, 1, true]} />
        <meshBasicMaterial color="#4FE3F0" transparent opacity={0.05 + glow * 0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* lampe suspendue */}
      <mesh position={[0, 3.3, 0]}>
        <coneGeometry args={[0.35, 0.3, 12, 1, true]} />
        <meshStandardMaterial color="#2B2F45" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.6, 4]} />
        <meshStandardMaterial color="#0B0F1E" />
      </mesh>
    </>
  );
};

/* ---------- caméra : plan large / gros plan sur celui qui parle ---------- */

type Shot = { pos: [number, number, number]; look: [number, number, number] };
const SHOTS: Record<'wide' | 'sam' | 'clawd', Shot> = {
  // le comptoir reste vers le bas de l'image, le haut est laissé aux hologrammes
  wide: { pos: [0, 2.05, 6.6], look: [0, 2.2, 0] },
  sam: { pos: [-0.45, 1.95, 5.4], look: [-0.45, 2.02, 0] },
  clawd: { pos: [0.45, 1.95, 5.4], look: [0.45, 2.02, 0] },
};

const CameraRig: React.FC<{ shot: Shot; progress: number }> = ({ shot, progress }) => {
  const { camera } = useThree();
  const push = 1 - progress * 0.06; // léger travelling avant
  const [x, y, z] = shot.pos;
  const [lx, ly, lz] = shot.look;
  camera.position.set(lx + (x - lx) * push, ly + (y - ly) * push, lz + (z - lz) * push);
  camera.lookAt(lx, ly, lz);
  return null;
};

const shotFor = (seg: Seg3D, i: number): keyof typeof SHOTS => {
  if (i === 0) return 'wide';
  if (seg.holo.startsWith('agents') || seg.holo === 'overload' || seg.holo === 'follow') return 'wide';
  return seg.speaker;
};

/* ---------- volume de la voix -> bouche / rebond ---------- */

const useTalk = (timeline: TimedSegment[], idx: number, frame: number) => {
  const { fps } = useVideoConfig();
  // un hook par segment (nombre constant)
  const datas = timeline.map((s) => useAudioData(staticFile(s.audio ?? 'voice/restaurant/seg-0.mp3')));
  const seg = timeline[idx];
  const data = datas[idx];
  if (!seg?.audio || !data) return 0;
  const local = frame - Math.round(seg.start * fps);
  if (local < 0) return 0;
  const v = visualizeAudio({ fps, frame: local, audioData: data, numberOfSamples: 16 });
  return Math.min(1, (v.slice(0, 6).reduce((a, b) => a + b, 0) / 6) * 6);
};

/* ---------- scène ---------- */

export const Scene3D: React.FC<{ timeline: TimedSegment[]; segs: Seg3D[] }> = ({ timeline, segs }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let idx = timeline.findIndex((s) => t >= s.start && t < s.start + s.duration);
  if (idx < 0) idx = timeline.length - 1;
  const seg = segs[idx];
  const tl = timeline[idx];
  const local = frame - Math.round(tl.start * FPS);
  const progress = Math.min(1, local / Math.max(1, tl.duration * FPS));
  const talk = useTalk(timeline, idx, frame);

  const samTalk = seg.speaker === 'sam' ? talk : 0;
  const clawdTalk = seg.speaker === 'clawd' ? talk : 0;

  // Clawd : petites actions selon l'animation prévue dans le script
  const a = seg.clawd;
  const wave = a.startsWith('greeting') ? Math.sin(local / 3) * 0.5 + 0.6 : 0;
  const busy = /writing|running|searching|plan/.test(a) ? Math.sin(local / 2.5) * 0.35 : 0;
  const lead = a.startsWith('directing') ? 1.1 + Math.sin(local / 5) * 0.2 : 0;
  const shake = a.startsWith('error') ? Math.sin(local * 1.3) * 0.08 * Math.max(0, 1 - local / 30) : 0;
  const joy = a.startsWith('done') ? Math.abs(Math.sin(local / 5)) * 0.12 : 0;
  const clawdPose: ClawdPose = {
    bob: Math.sin(frame / 9) * 0.012,
    squash: clawdTalk * 0.12,
    turn: seg.speaker === 'sam' ? -0.3 : -0.08,
    armL: Math.max(wave, lead, busy * 0.6 + clawdTalk * 0.4),
    armR: Math.max(lead, -busy * 0.6 + clawdTalk * 0.3),
    blink: frame % 110 > 104 ? 0.15 : 1,
    tilt: shake + (seg.speaker === 'sam' ? Math.sin(frame / 20) * 0.04 : 0),
    jump: joy + clawdTalk * 0.03,
  };

  const samPose: SamPose = {
    mood: seg.mood,
    talk: samTalk,
    blink: frame % 96 > 90 ? 0.15 : 1,
    headTilt: Math.sin(frame / 37) * 0.04 + samTalk * 0.04,
    headTurn: seg.speaker === 'clawd' ? 0.3 : 0.1,
    nod: samTalk * 0.08 + (seg.mood === 'tired' ? 0.08 : 0),
    breathe: Math.sin(frame / 22) * 0.008,
  };

  const glow = interpolate(Math.sin(frame / 8), [-1, 1], [0.6, 1]);

  return (
    <ThreeCanvas width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} camera={{ fov: 38, near: 0.1, far: 50 }}>
      <color attach="background" args={['#0A1430']} />
      <CameraRig shot={SHOTS[shotFor(seg, idx)]} progress={progress} />
      <ambientLight color="#7C8BC9" intensity={0.55} />
      <hemisphereLight args={['#9DB4FF', '#2A1C14', 0.5]} />
      <spotLight position={[0, 3.2, 0.2]} angle={0.9} penumbra={0.6} intensity={22} distance={8} decay={1.6} color="#FFD9A0" />
      <directionalLight position={[2, 3, 5]} intensity={1.5} color="#FFE7C8" />
      <pointLight position={[1.4, 1.8, 1.6]} intensity={3} distance={4} color="#FFD2B8" />
      <pointLight position={[0, COUNTER_Y + 0.5, 0.4]} intensity={2.5 * glow} distance={3} color="#4FE3F0" />
      <Room glow={glow} />
      <Sam3D pose={samPose} position={SAM_POS} />
      <Clawd3D pose={clawdPose} position={CLAWD_POS} />
    </ThreeCanvas>
  );
};
