import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, mono, sans } from './theme';
import type { PanelKind } from './script';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 160 } });
};

const Typed: React.FC<{ text: string; from: number; cps?: number; cursor?: boolean }> = ({
  text,
  from,
  cps = 28,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - from) / fps) * cps));
  const done = n >= text.length;
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <span>
      {text.slice(0, n)}
      {cursor && (!done || blink) ? <span style={{ color: C.orange }}>▌</span> : null}
    </span>
  );
};

const Check: React.FC<{ color?: string; size?: number }> = ({ color = C.green, size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross: React.FC<{ size?: number }> = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill={C.red} />
    <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const Spinner: React.FC<{ size?: number }> = ({ size = 46 }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${frame * 14}deg)` }}>
      <circle cx="12" cy="12" r="9" stroke={C.creamDark} strokeWidth="3" fill="none" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke={C.orange} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const Terminal: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: C.term,
      borderRadius: 22,
      padding: '36px 40px',
      color: C.termText,
      fontFamily: mono,
      fontSize: 38,
      lineHeight: 1.55,
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

/* ---------- écrans ---------- */

const TitlePanel = () => {
  const p = usePop(10);
  return (
    <Terminal>
      <div style={{ color: C.muted }}>
        $ <Typed text="claude" from={0} cps={14} cursor={false} />
      </div>
      <div
        style={{
          marginTop: 80,
          textAlign: 'center',
          transform: `scale(${p})`,
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 120,
          lineHeight: 1.05,
          color: C.cream,
        }}
      >
        Claude
        <br />
        <span style={{ color: C.orange }}>Code</span>
      </div>
    </Terminal>
  );
};

const TerminalPanel = () => {
  const p = usePop(4);
  return (
    <Terminal>
      <div
        style={{
          border: `3px solid ${C.orange}`,
          borderRadius: 16,
          padding: '22px 28px',
          transform: `scale(${0.9 + 0.1 * p})`,
          opacity: p,
        }}
      >
        <span style={{ color: C.orange }}>✻</span> Bienvenue dans <b>Claude Code</b>
        <div style={{ color: C.muted, fontSize: 30 }}>~/mon-site</div>
      </div>
      <div style={{ marginTop: 40 }}>
        <span style={{ color: C.orange }}>&gt;</span> <Typed text="" from={0} />
      </div>
    </Terminal>
  );
};

const PromptPanel = () => {
  const frame = useCurrentFrame();
  const thinking = frame > 62;
  const dots = '.'.repeat((Math.floor(frame / 6) % 3) + 1);
  return (
    <Terminal>
      <div>
        <span style={{ color: C.orange }}>&gt;</span>{' '}
        <Typed text="Ajoute un bouton « Connexion » sur mon site" from={4} cps={26} cursor={!thinking} />
      </div>
      {thinking ? (
        <div style={{ marginTop: 50, color: C.orange }}>
          ✻ Claude réfléchit{dots}
        </div>
      ) : null}
    </Terminal>
  );
};

const FILES = ['index.html', 'style.css', 'app.js', 'menu.js', 'login.js', 'README.md'];
const FilesPanel = () => {
  const frame = useCurrentFrame();
  const step = 11;
  const active = Math.min(FILES.length - 1, Math.floor(frame / step));
  return (
    <div style={{ padding: '30px 40px', fontFamily: mono, fontSize: 40, color: C.ink }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, marginBottom: 18 }}>📂 mon-site/</div>
      {FILES.map((f, i) => {
        const read = frame >= (i + 1) * step;
        return (
          <div
            key={f}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              marginBottom: 8,
              borderRadius: 14,
              background: i === active && !read ? '#F6DCCF' : 'transparent',
            }}
          >
            <span>{f}</span>
            {read ? <Check size={40} /> : i === active ? <Spinner size={40} /> : null}
          </div>
        );
      })}
    </div>
  );
};

const CODE: { t: string; add?: boolean }[] = [
  { t: '<nav class="menu">' },
  { t: '  <a href="/">Accueil</a>' },
  { t: '  <button class="login">', add: true },
  { t: '    Connexion', add: true },
  { t: '  </button>', add: true },
  { t: '</nav>' },
];
const DiffPanel = () => {
  const frame = useCurrentFrame();
  let addIndex = 0;
  return (
    <div style={{ padding: '36px 30px', fontFamily: mono, fontSize: 36 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 42, color: C.ink, marginBottom: 20 }}>
        ✏️ index.html
      </div>
      {CODE.map((l, i) => {
        const appear = l.add ? 10 + addIndex++ * 12 : 0;
        const o = interpolate(frame, [appear, appear + 8], [0, 1], clamp);
        const x = interpolate(frame, [appear, appear + 8], [-40, 0], clamp);
        return (
          <div
            key={i}
            style={{
              whiteSpace: 'pre',
              padding: '8px 16px',
              borderRadius: 10,
              marginBottom: 4,
              color: l.add ? '#1D6B40' : C.ink,
              background: l.add ? '#D9F2E2' : 'transparent',
              opacity: o,
              transform: `translateX(${x}px)`,
            }}
          >
            {l.add ? '+ ' : '  '}
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

const TESTS = ['la page s’affiche', 'le menu marche', 'le bouton existe', 'la connexion marche'];
const TestRow: React.FC<{ label: string; state: 'wait' | 'run' | 'ok' | 'ko' }> = ({ label, state }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '12px 24px',
      borderRadius: 16,
      background: state === 'ko' ? '#FBE0DD' : state === 'ok' ? '#E3F4EA' : C.creamDark,
      marginBottom: 12,
      fontFamily: sans,
      fontWeight: 700,
      fontSize: 38,
      color: C.ink,
    }}
  >
    {state === 'ok' ? <Check /> : state === 'ko' ? <Cross /> : state === 'run' ? <Spinner /> : <div style={{ width: 46 }} />}
    {label}
  </div>
);

const TestsPanel = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ padding: 40 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: C.ink, marginBottom: 16 }}>🧪 Tests</div>
      {TESTS.map((t, i) => {
        const s = 6 + i * 12;
        const state = frame < s ? 'wait' : frame < s + 10 ? 'run' : i === 3 ? 'run' : 'ok';
        return <TestRow key={t} label={t} state={state} />;
      })}
    </div>
  );
};

const FixPanel = () => {
  // padding réduit pour laisser la place au message
  const frame = useCurrentFrame();
  const fixedAt = 52;
  const fixed = frame >= fixedAt;
  const shake = !fixed && frame < 30 ? Math.sin(frame * 1.6) * 8 : 0;
  const p = usePop(fixedAt);
  return (
    <div style={{ padding: '24px 40px' }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: C.ink, marginBottom: 16 }}>🧪 Tests</div>
      {TESTS.slice(0, 3).map((t) => (
        <TestRow key={t} label={t} state="ok" />
      ))}
      <div style={{ transform: `translateX(${shake}px)` }}>
        <TestRow label={TESTS[3]} state={fixed ? 'ok' : 'ko'} />
      </div>
      <div
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 46,
          color: fixed ? C.green : C.orange,
          transform: `scale(${fixed ? p : 1})`,
        }}
      >
        {fixed ? '✓ Corrigé tout seul' : frame > 22 ? '🔧 Correction en cours…' : ''}
      </div>
    </div>
  );
};

const CommitPanel = () => {
  const frame = useCurrentFrame();
  const stamp = usePop(38);
  const stampScale = interpolate(stamp, [0, 1], [2.4, 1]);
  return (
    <div style={{ padding: 40, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: C.ink, marginBottom: 26 }}>💾 Sauvegarde</div>
      <div
        style={{
          background: C.term,
          color: C.termText,
          fontFamily: mono,
          fontSize: 36,
          borderRadius: 18,
          padding: '28px 32px',
          lineHeight: 1.6,
        }}
      >
        <div style={{ color: C.muted }}>$ git commit</div>
        <div>
          <Typed text="Ajout du bouton Connexion" from={6} cps={30} cursor={frame < 38} />
        </div>
        <div style={{ color: C.green, opacity: frame > 30 ? 1 : 0 }}>4 fichiers modifiés</div>
      </div>
      {frame >= 38 ? (
        <div
          style={{
            position: 'absolute',
            right: 50,
            bottom: 70,
            transform: `rotate(-10deg) scale(${stampScale})`,
            opacity: Math.min(1, stamp * 1.5),
            border: `8px solid ${C.green}`,
            color: C.green,
            borderRadius: 18,
            padding: '10px 28px',
            fontFamily: sans,
            fontWeight: 800,
            fontSize: 64,
            background: 'rgba(251,245,236,0.92)',
          }}
        >
          SAUVEGARDÉ ✓
        </div>
      ) : null}
    </div>
  );
};

const CoffeeCup = () => {
  const frame = useCurrentFrame();
  return (
    <svg width="220" height="220" viewBox="0 0 100 100">
      {[0, 1, 2].map((i) => {
        const y = interpolate((frame + i * 12) % 36, [0, 36], [30, 4]);
        const o = interpolate((frame + i * 12) % 36, [0, 10, 36], [0, 0.8, 0]);
        return (
          <path
            key={i}
            d={`M${36 + i * 12} ${y + 10} q -5 -6 0 -12 q 5 -6 0 -12`}
            stroke={C.muted}
            strokeWidth="3"
            fill="none"
            opacity={o}
            strokeLinecap="round"
          />
        );
      })}
      <rect x="22" y="40" width="50" height="46" rx="8" fill={C.orange} />
      <path d="M72 50 h8 a10 10 0 0 1 0 20 h-8" stroke={C.orange} strokeWidth="7" fill="none" />
      <rect x="16" y="86" width="62" height="6" rx="3" fill={C.deskEdge} />
    </svg>
  );
};

const CoffeePanel = () => {
  const frame = useCurrentFrame();
  const pct = Math.round(interpolate(frame, [0, 90], [12, 100], clamp));
  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <CoffeeCup />
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: C.ink }}>Pause café ☕</div>
      <div style={{ width: '100%', marginTop: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 34, color: C.muted, marginBottom: 12 }}>
          ✻ Claude travaille… {pct}%
        </div>
        <div style={{ height: 34, background: C.creamDark, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: C.orange, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
};

const FollowPanel = () => {
  const frame = useCurrentFrame();
  const clickAt = 40;
  const clicked = frame >= clickAt;
  const cx = interpolate(frame, [0, clickAt - 4], [700, 520], clamp);
  const cy = interpolate(frame, [0, clickAt - 4], [640, 420], clamp);
  const press = interpolate(frame, [clickAt - 4, clickAt, clickAt + 6], [1, 0.9, 1], clamp);
  const p = usePop(clickAt);
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 58, color: C.ink, textAlign: 'center', lineHeight: 1.15 }}>
        Tout savoir
        <br />
        sur les <span style={{ color: C.orange }}>IA</span>
      </div>
      <div
        style={{
          transform: `scale(${press * (clicked ? 0.95 + 0.05 * p : 1)})`,
          background: clicked ? C.green : C.orange,
          color: '#fff',
          fontFamily: sans,
          fontWeight: 800,
          fontSize: 60,
          padding: '28px 70px',
          borderRadius: 999,
          boxShadow: '0 10px 0 rgba(0,0,0,0.18)',
        }}
      >
        {clicked ? 'ABONNÉ ✓' : "S'ABONNER"}
      </div>
      <svg
        width="70"
        height="70"
        viewBox="0 0 24 24"
        style={{ position: 'absolute', left: cx, top: cy }}
      >
        <path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18z" fill={C.ink} stroke="#fff" strokeWidth="1.2" />
      </svg>
    </div>
  );
};


const Bubble: React.FC<{ me?: boolean; children: React.ReactNode; delay: number }> = ({ me, children, delay }) => {
  const p = usePop(delay);
  return (
    <div style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', marginBottom: 22 }}>
      <div
        style={{
          transform: `scale(${p})`,
          transformOrigin: me ? '100% 100%' : '0% 100%',
          maxWidth: '78%',
          background: me ? C.orange : C.creamDark,
          color: me ? '#fff' : C.ink,
          borderRadius: 30,
          padding: '20px 30px',
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 38,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ChatPanel = () => {
  const frame = useCurrentFrame();
  const crossAt = 62;
  const p = usePop(crossAt);
  return (
    <div style={{ padding: 40, position: 'relative', height: '100%', boxSizing: 'border-box' }}>
      <Bubble me delay={4}>Comment ajouter un bouton ?</Bubble>
      <Bubble delay={20}>Voici le code, copie-le dans ton fichier…</Bubble>
      <Bubble me delay={40}>Euh… et je le mets où ? 😅</Bubble>
      {frame >= crossAt ? (
        <svg
          viewBox="0 0 100 100"
          style={{ position: 'absolute', inset: 60, width: 'calc(100% - 120px)', height: 'calc(100% - 120px)', opacity: 0.9 }}
        >
          <path d={`M10 10 L${10 + 80 * p} ${10 + 80 * p}`} stroke={C.red} strokeWidth="9" strokeLinecap="round" />
          <path d={`M90 10 L${90 - 80 * p} ${10 + 80 * p}`} stroke={C.red} strokeWidth="9" strokeLinecap="round" />
        </svg>
      ) : null}
    </div>
  );
};

const PLAN = ['Lire le projet', 'Ajouter le bouton', 'Lancer les tests', 'Sauvegarder'];
const PlanPanel = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ padding: 44 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 48, color: C.ink, marginBottom: 30 }}>📋 Le plan</div>
      {PLAN.map((t, i) => {
        const at = 6 + i * 10;
        const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
        return (
          <div
            key={t}
            style={{
              opacity: o,
              transform: `translateX(${(1 - o) * -40}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 42,
              color: C.ink,
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: C.orange,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              {i + 1}
            </div>
            {t}
          </div>
        );
      })}
    </div>
  );
};

const WebPanel = () => {
  const frame = useCurrentFrame();
  const results = ['Guide : bouton de connexion', 'Exemple de code HTML', 'Bonnes pratiques'];
  return (
    <div style={{ padding: 40 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          border: `4px solid ${C.ink}`,
          borderRadius: 999,
          padding: '16px 30px',
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 38,
          color: C.ink,
          marginBottom: 34,
        }}
      >
        🔍 <Typed text="bouton connexion html" from={2} cps={24} />
      </div>
      {results.map((r, i) => {
        const at = 32 + i * 8;
        const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
        return (
          <div key={r} style={{ opacity: o, marginBottom: 22, padding: '18px 24px', background: C.creamDark, borderRadius: 18 }}>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 36, color: '#3B6FD8' }}>{r}</div>
            <div style={{ height: 14, width: `${70 - i * 12}%`, background: '#DDD2C2', borderRadius: 8, marginTop: 12 }} />
          </div>
        );
      })}
    </div>
  );
};

const AGENTS = [
  { name: 'Agent 1', task: 'Design', speed: 1.3 },
  { name: 'Agent 2', task: 'Code', speed: 1.0 },
  { name: 'Agent 3', task: 'Tests', speed: 0.8 },
];
const AgentsPanel = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ padding: 40 }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 48, color: C.ink, marginBottom: 30 }}>👥 En parallèle</div>
      {AGENTS.map((a, i) => {
        const pct = Math.min(100, Math.max(0, (frame - 6 - i * 4) * a.speed * 1.4));
        const done = pct >= 100;
        return (
          <div key={a.name} style={{ marginBottom: 30 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 38,
                color: C.ink,
                marginBottom: 12,
              }}
            >
              <span>
                <span style={{ color: C.orange }}>✻</span> {a.name} · {a.task}
              </span>
              {done ? <Check size={42} /> : <Spinner size={42} />}
            </div>
            <div style={{ height: 30, background: C.creamDark, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: done ? C.green : C.orange }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WarnPanel = () => {
  const frame = useCurrentFrame();
  const p = usePop(4);
  const wobble = Math.sin(frame / 4) * 4;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
      <svg width="260" height="230" viewBox="0 0 100 88" style={{ transform: `scale(${p}) rotate(${wobble}deg)` }}>
        <path d="M50 4 L96 84 H4 Z" fill="#E8B04A" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
        <rect x="45" y="30" width="10" height="30" rx="4" fill={C.ink} />
        <circle cx="50" cy="71" r="6" fill={C.ink} />
      </svg>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 56, color: C.ink, textAlign: 'center', lineHeight: 1.15 }}>
        L’IA peut
        <br />
        <span style={{ color: C.red }}>se tromper</span>
      </div>
    </div>
  );
};

const ValidatePanel = () => {
  const frame = useCurrentFrame();
  const clickAt = 70;
  const clicked = frame >= clickAt;
  const cx = interpolate(frame, [20, clickAt - 4], [720, 250], clamp);
  const cy = interpolate(frame, [20, clickAt - 4], [560, 420], clamp);
  const p = usePop(clickAt);
  return (
    <div style={{ position: 'relative', height: '100%', padding: 40, boxSizing: 'border-box' }}>
      <div style={{ background: C.term, color: C.termText, fontFamily: mono, fontSize: 34, borderRadius: 18, padding: '24px 30px', lineHeight: 1.5 }}>
        <span style={{ color: C.orange }}>✻</span> Claude veut :
        <div style={{ color: '#fff', fontWeight: 700 }}>supprimer old-site/</div>
      </div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: C.ink, textAlign: 'center', margin: '40px 0 30px' }}>
        Tu valides ?
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        {[
          { l: 'OUI', c: C.green },
          { l: 'NON', c: C.red },
        ].map((b, i) => (
          <div
            key={b.l}
            style={{
              background: b.c,
              color: '#fff',
              fontFamily: sans,
              fontWeight: 800,
              fontSize: 48,
              padding: '20px 60px',
              borderRadius: 999,
              transform: `scale(${i === 0 && clicked ? 1 + 0.12 * p : 1})`,
              boxShadow: i === 0 && clicked ? `0 0 0 ${10 * p}px rgba(63,166,107,0.3)` : 'none',
            }}
          >
            {b.l}
          </div>
        ))}
      </div>
      {frame >= 20 ? (
        <svg width="70" height="70" viewBox="0 0 24 24" style={{ position: 'absolute', left: cx, top: cy }}>
          <path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.5-7.5L4 18z" fill={C.ink} stroke="#fff" strokeWidth="1.2" />
        </svg>
      ) : null}
    </div>
  );
};

const PhonePanel = () => {
  const frame = useCurrentFrame();
  const p = usePop(2);
  const off = frame > 40;
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50 }}>
      <div style={{ transform: `scale(${p})`, width: 270, height: 500, borderRadius: 44, background: C.ink, padding: 16, boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 32, background: C.term, padding: 20, boxSizing: 'border-box', fontFamily: mono, fontSize: 24, color: C.termText, lineHeight: 1.6 }}>
          <div style={{ color: C.orange }}>✻ Claude</div>
          <Typed text="Mission en cours…" from={8} cps={18} />
          {frame > 46 ? <div style={{ color: C.green, marginTop: 10 }}>✓ Terminé</div> : null}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: interpolate(frame, [10, 20], [0, 1], clamp) }}>
        <div style={{ width: 280, height: 180, borderRadius: 20, border: `10px solid ${C.ink}`, background: off ? '#111' : '#9EC5F5', boxSizing: 'border-box' }} />
        <div style={{ width: 340, height: 18, borderRadius: 9, background: C.ink }} />
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 34, color: off ? C.muted : C.ink }}>{off ? 'Ordi éteint 💤' : 'Ordi allumé'}</div>
      </div>
    </div>
  );
};

const EasyPanel = () => {
  const p = usePop(4);
  const q = usePop(26);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
      <div style={{ transform: `scale(${p})`, fontFamily: sans, fontWeight: 800, fontSize: 64, color: C.ink, textAlign: 'center', lineHeight: 1.15 }}>
        Tu parles
        <br />
        <span style={{ color: C.orange }}>français</span>
      </div>
      <div style={{ transform: `scale(${q})`, fontFamily: sans, fontWeight: 800, fontSize: 64, color: C.ink, textAlign: 'center', lineHeight: 1.15 }}>
        Il écrit
        <br />
        <span style={{ color: C.green }}>le code</span>
      </div>
    </div>
  );
};

export const PANELS: Record<PanelKind, React.FC> = {
  title: TitlePanel,
  chat: ChatPanel,
  plan: PlanPanel,
  web: WebPanel,
  agents: AgentsPanel,
  warn: WarnPanel,
  validate: ValidatePanel,
  phone: PhonePanel,
  easy: EasyPanel,
  terminal: TerminalPanel,
  prompt: PromptPanel,
  files: FilesPanel,
  diff: DiffPanel,
  tests: TestsPanel,
  fix: FixPanel,
  commit: CommitPanel,
  coffee: CoffeePanel,
  follow: FollowPanel,
};
