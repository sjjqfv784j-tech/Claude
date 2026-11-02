import React from 'react';
import type { Mood } from '../story/Sam';

const Box: React.FC<{
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  emissive?: string;
}> = ({ size, position = [0, 0, 0], rotation = [0, 0, 0], color, emissive }) => (
  <mesh position={position} rotation={rotation}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} emissive={emissive ?? '#000'} roughness={0.75} flatShading />
  </mesh>
);

/* ---------- Pixel : mascotte originale (robot rond turquoise) ---------- */

const TEAL = '#3FC1B0';
const TEAL_DARK = '#1F8F80';

export type ClawdPose = { bob: number; squash: number; turn: number; armL: number; armR: number; blink: number; tilt: number; jump: number };

// posé sur le comptoir : l'origine du groupe = sous ses pieds
export const Clawd3D: React.FC<{ pose: ClawdPose; position: [number, number, number] }> = ({ pose, position }) => {
  const sy = 1 - pose.squash;
  const sx = 1 + pose.squash * 0.6;
  return (
    <group position={[position[0], position[1] + pose.jump, position[2]]} rotation={[0, pose.turn, pose.tilt]}>
      {/* pieds */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.02]} scale={[1, 0.4, 1.2]}>
          <sphereGeometry args={[0.12, 14, 10]} />
          <meshStandardMaterial color={TEAL_DARK} roughness={0.6} />
        </mesh>
      ))}
      <group position={[0, 0.1 + pose.bob, 0]} scale={[sx, sy, sx]}>
        {/* corps */}
        <mesh position={[0, 0.3, 0]} scale={[1, 0.95, 0.9]}>
          <sphereGeometry args={[0.36, 24, 18]} />
          <meshStandardMaterial color={TEAL} roughness={0.45} />
        </mesh>
        {/* visage */}
        <mesh position={[0, 0.36, 0.25]} scale={[1, 0.62, 0.35]}>
          <sphereGeometry args={[0.26, 20, 14]} />
          <meshStandardMaterial color="#10242B" roughness={0.3} />
        </mesh>
        <mesh position={[-0.09, 0.37, 0.34]} scale={[1, pose.blink, 0.4]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color="#8CF3E3" emissive="#8CF3E3" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.09, 0.37, 0.34]} scale={[1, pose.blink, 0.4]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color="#8CF3E3" emissive="#8CF3E3" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.29, 0.34]} scale={[1, 0.5 + pose.squash * 6, 0.4]}>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color="#8CF3E3" emissive="#8CF3E3" emissiveIntensity={0.7} />
        </mesh>
        {/* bras */}
        <group position={[-0.34, 0.28, 0]} rotation={[0, 0, pose.armL]}>
          <mesh position={[-0.1, 0, 0]} scale={[1.5, 0.8, 0.8]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color={TEAL_DARK} roughness={0.6} />
          </mesh>
        </group>
        <group position={[0.34, 0.28, 0]} rotation={[0, 0, -pose.armR]}>
          <mesh position={[0.1, 0, 0]} scale={[1.5, 0.8, 0.8]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshStandardMaterial color={TEAL_DARK} roughness={0.6} />
          </mesh>
        </group>
        {/* antenne */}
        <mesh position={[0, 0.69, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
          <meshStandardMaterial color={TEAL_DARK} />
        </mesh>
        <mesh position={[0, 0.77, 0]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color="#FFB347" emissive="#FFB347" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
};

/* ---------- Sam en low-poly ---------- */

const SKIN = '#C98B62';
const SKIN_SHADE = '#B37752';
const HAIR = '#3A2A22';
const WHITE = '#F2EFE8';
const SCARF = '#D9534F';

export type SamPose = { mood: Mood; talk: number; blink: number; headTilt: number; headTurn: number; nod: number; breathe: number };

const BROWS: Record<Mood, { y: number; rot: number }> = {
  tired: { y: 0.08, rot: -0.22 },
  neutral: { y: 0.09, rot: 0 },
  surprised: { y: 0.13, rot: -0.1 },
  happy: { y: 0.1, rot: -0.05 },
};

// l'origine du groupe = au sol, Sam debout derrière le comptoir
export const Sam3D: React.FC<{ pose: SamPose; position: [number, number, number] }> = ({ pose, position }) => {
  const brow = BROWS[pose.mood];
  const eyeH = (pose.mood === 'tired' ? 0.045 : pose.mood === 'surprised' ? 0.1 : 0.08) * pose.blink;
  const mouthOpen = pose.talk > 0.05 || pose.mood === 'surprised';
  const mouthH = 0.018 + pose.talk * 0.08 + (pose.mood === 'surprised' ? 0.04 : 0);
  return (
    <group position={position}>
      {/* buste */}
      <group position={[0, pose.breathe, 0]}>
        <Box size={[0.72, 0.9, 0.4]} position={[0, 1.1, 0]} color={WHITE} />
        {[1.12, 1.27, 1.42].map((y) => (
          <group key={y}>
            <Box size={[0.05, 0.05, 0.02]} position={[-0.09, y, 0.205]} color="#CFC8BA" />
            <Box size={[0.05, 0.05, 0.02]} position={[0.09, y, 0.205]} color="#CFC8BA" />
          </group>
        ))}
        <Box size={[0.36, 0.09, 0.42]} position={[0, 1.57, 0]} color={SCARF} />
        <Box size={[0.1, 0.16, 0.04]} position={[0.04, 1.47, 0.21]} rotation={[0, 0, 0.3]} color={SCARF} />
        {/* bras posés sur le comptoir */}
        <Box size={[0.2, 0.5, 0.22]} position={[-0.44, 1.32, 0.05]} rotation={[0.5, 0, 0.15]} color={WHITE} />
        <Box size={[0.2, 0.5, 0.22]} position={[0.44, 1.32, 0.05]} rotation={[0.5, 0, -0.15]} color={WHITE} />
        <Box size={[0.15, 0.12, 0.2]} position={[-0.42, 1.08, 0.32]} color={SKIN} />
        <Box size={[0.15, 0.12, 0.2]} position={[0.42, 1.08, 0.32]} color={SKIN} />
        {/* cou */}
        <Box size={[0.16, 0.12, 0.16]} position={[0, 1.65, 0]} color={SKIN_SHADE} />
      </group>

      {/* tête */}
      <group position={[0, 1.7 + pose.breathe, 0]} rotation={[pose.nod, pose.headTurn, pose.headTilt]}>
        <group position={[0, 0.25, 0]}>
          <Box size={[0.46, 0.5, 0.44]} color={SKIN} />
          <Box size={[0.06, 0.12, 0.1]} position={[-0.25, 0, 0]} color={SKIN_SHADE} />
          <Box size={[0.06, 0.12, 0.1]} position={[0.25, 0, 0]} color={SKIN_SHADE} />
          {/* barbe */}
          <Box size={[0.47, 0.14, 0.06]} position={[0, -0.18, 0.2]} color={HAIR} />
          <Box size={[0.06, 0.22, 0.4]} position={[-0.21, -0.12, 0]} color={HAIR} />
          <Box size={[0.06, 0.22, 0.4]} position={[0.21, -0.12, 0]} color={HAIR} />
          {/* cheveux */}
          <Box size={[0.48, 0.08, 0.46]} position={[0, 0.22, 0]} color={HAIR} />
          {/* toque */}
          <mesh position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 10]} />
            <meshStandardMaterial color={WHITE} flatShading roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.52, 0]} scale={[1, 0.75, 1]}>
            <icosahedronGeometry args={[0.29, 1]} />
            <meshStandardMaterial color={WHITE} flatShading roughness={0.8} />
          </mesh>
          {/* sourcils */}
          <Box size={[0.12, 0.03, 0.02]} position={[-0.11, brow.y, 0.225]} rotation={[0, 0, -brow.rot]} color={HAIR} />
          <Box size={[0.12, 0.03, 0.02]} position={[0.11, brow.y, 0.225]} rotation={[0, 0, brow.rot]} color={HAIR} />
          {/* yeux */}
          <Box size={[0.055, eyeH, 0.02]} position={[-0.1, 0.015, 0.225]} color="#141018" />
          <Box size={[0.055, eyeH, 0.02]} position={[0.1, 0.015, 0.225]} color="#141018" />
          {/* nez */}
          <Box size={[0.07, 0.1, 0.06]} position={[0, -0.05, 0.245]} color={SKIN_SHADE} />
          {/* bouche */}
          {mouthOpen ? (
            <Box size={[pose.mood === 'surprised' ? 0.08 : 0.12, mouthH, 0.02]} position={[0, -0.14, 0.235]} color="#4A1E22" />
          ) : (
            <Box
              size={[0.13, 0.022, 0.02]}
              position={[0, pose.mood === 'happy' ? -0.13 : -0.14, 0.235]}
              rotation={[0, 0, 0]}
              color={pose.mood === 'happy' ? '#7A2E2E' : '#4A1E22'}
            />
          )}
          {pose.mood === 'happy' ? (
            <>
              <Box size={[0.07, 0.03, 0.02]} position={[-0.08, -0.12, 0.236]} rotation={[0, 0, -0.5]} color="#7A2E2E" />
              <Box size={[0.07, 0.03, 0.02]} position={[0.08, -0.12, 0.236]} rotation={[0, 0, 0.5]} color="#7A2E2E" />
            </>
          ) : null}
          {pose.mood === 'tired' ? (
            <>
              <Box size={[0.08, 0.02, 0.02]} position={[-0.1, -0.035, 0.226]} color={SKIN_SHADE} />
              <Box size={[0.08, 0.02, 0.02]} position={[0.1, -0.035, 0.226]} color={SKIN_SHADE} />
            </>
          ) : null}
        </group>
      </group>
    </group>
  );
};
