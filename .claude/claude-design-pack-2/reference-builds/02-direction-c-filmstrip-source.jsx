// Direction C v2 — Filmstrip Season · Refinement Pass
// Same structural concept (time-as-axis, filmstrip with playhead, scope = zoom).
// What changed in v2:
//  · Latest-match-first hierarchy (hero card under identity, then strip)
//  · Frames encode meaning visually (MOTM border + gold star, poor coral, DNP greyed/striped, training dashed)
//  · Filmstrip pages 7-at-a-time with chevrons + range label
//  · Heatmap, voice-memo, four-line trajectory ALL DROPPED
//  · Compressed season-numbers strip replaces trajectory
//  · Section ends on IDP postscript (numbered goals, status, ratings)
//  · Sticky scope strip on mobile + Show all (n) ↓ affordance
//  · Share-card export modal as bonus

const { PB: V_PB, PT: V_PT, PLAYER: V_P, RADAR_AXES: V_AXES, evMeta: V_EV,
        PolyRadar: V_Radar, ScoreArc: V_Arc, PlayerGlyph: V_Glyph } = window;

// ── Tokens ──
const v2 = {
  motmBorder: V_PB.yellow,
  poorBorder: V_PB.coral,
  trainingDash: '5 4',
};

// ── Local primitives ──
function V_Eyebrow({ children, color = V_PB.indigoMute, style = {} }) {
  return <div style={{
    fontFamily: V_PT.mono, fontSize: 10.5, letterSpacing: '0.22em',
    color, fontWeight: 700, textTransform: 'uppercase', ...style,
  }}>{children}</div>;
}

function V_Display({ children, size = 44, color = V_PB.indigo, style = {} }) {
  return <div style={{
    fontFamily: V_PT.display, fontSize: size, lineHeight: 0.94,
    letterSpacing: '-0.02em', color, ...style,
  }}>{children}</div>;
}

// Result dot — tiny circle in the sprocket bar
function V_ResultDot({ result }) {
  const color = result === 'W' ? V_PB.green : result === 'L' ? V_PB.coral : (result === 'D' ? V_PB.indigoMute : 'transparent');
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}

// Diagonal-stripe pattern as inline SVG fill
function V_DnpStripes({ id = 'dnp-stripes' }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill={V_PB.sandDeep} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={V_PB.indigoLine} strokeWidth="2" />
      </pattern>
    </defs>
  );
}

// ── A SINGLE FRAME — encodes state visually ──
function V_Frame({ d, isPlayhead, onClick, w = 138, h = 172 }) {
  const isMotm = d.motm;
  const isPoor = d.poor;
  const isDnp = d.dnp;
  const isUpcoming = d.upcoming;
  const isTraining = d.kind === 'training';

  // Border treatment — visual hierarchy: MOTM > poor > playhead > default
  let borderColor = V_PB.indigoLine;
  let borderWidth = 1;
  let borderStyle = 'solid';
  if (isMotm) { borderColor = V_PB.yellow; borderWidth = 3; }
  else if (isPoor) { borderColor = V_PB.coral; borderWidth = 2; }
  else if (isPlayhead) { borderColor = V_PB.indigo; borderWidth = 2; }
  if (isTraining && !isMotm && !isPoor) borderStyle = 'dashed';

  // Score arc fill colour — hierarchical
  let arcColor = V_PB.indigo;
  if (isMotm) arcColor = V_PB.yellow;
  else if (isPoor) arcColor = V_PB.coral;
  else if (d.score >= 80) arcColor = V_PB.indigo;
  else if (d.score < 60) arcColor = V_PB.coral;

  // Sprocket holes — replace one with a star for MOTM
  const sprocketCount = 3;

  return (
    <button
      onClick={onClick}
      style={{
        width: w, minWidth: w, height: h, padding: 0, position: 'relative',
        background: isPlayhead ? V_PB.indigo : isUpcoming ? 'transparent' : V_PB.paper,
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        color: isPlayhead ? V_PB.sand : V_PB.indigo,
        borderRadius: 6, cursor: isUpcoming ? 'default' : 'pointer', textAlign: 'left',
        transition: 'all 200ms ease',
        boxShadow: isPlayhead ? '0 12px 28px rgba(11,8,40,0.32)' : isMotm ? '0 4px 14px rgba(252,215,24,0.25)' : '0 2px 6px rgba(11,8,40,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: isUpcoming ? 0.45 : 1,
      }}
    >
      {/* Sprocket header — holes + result dot + MD label */}
      <div style={{
        background: isPlayhead ? '#0F0A36' : isDnp ? V_PB.sandDeep : V_PB.sand,
        borderBottom: `1px solid ${isPlayhead ? 'rgba(238,228,200,0.16)' : V_PB.indigoLine}`,
        padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {/* sprockets — for MOTM, the middle one is replaced by ★ */}
        <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {Array.from({ length: sprocketCount }).map((_, i) => {
            if (isMotm && i === 1) {
              return <span key={i} style={{ color: V_PB.yellow, fontSize: 11, lineHeight: 1, marginTop: -1 }}>★</span>;
            }
            return <span key={i} style={{ width: 6, height: 6, borderRadius: 1, background: isPlayhead ? '#1B1550' : V_PB.indigoLine }} />;
          })}
        </span>
        <span style={{ flex: 1 }} />
        <V_ResultDot result={d.result} />
        <span style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.16em', fontWeight: 700, color: isPlayhead ? V_PB.yellow : V_PB.indigoMute }}>
          MD{d.md}
        </span>
      </div>

      {/* Frame body — score arc or DNP stamp */}
      <div style={{ flex: 1, position: 'relative', background: isPlayhead ? `radial-gradient(ellipse at 50% 65%, ${V_PB.indigoMid} 0%, ${V_PB.indigo} 80%)` : isDnp ? 'transparent' : V_PB.sand }}>
        {/* DNP diagonal stripes filling the frame */}
        {isDnp && (
          <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
            <V_DnpStripes id={`dnp-${d.md}`} />
            <rect width="100%" height="100%" fill={`url(#dnp-${d.md})`} />
          </svg>
        )}

        {/* Score arc — only for played, non-DNP */}
        {!isDnp && !isUpcoming && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <V_Arc value={d.score} size={50} stroke={4.5} color={arcColor} ring={isPlayhead ? 'rgba(238,228,200,0.18)' : V_PB.indigoSofter} font={V_PT.display} textColor={isPlayhead ? V_PB.sand : V_PB.indigo} />
          </div>
        )}

        {/* DNP stamp */}
        {isDnp && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%) rotate(-8deg)' }}>
            <div style={{
              fontFamily: V_PT.display, fontSize: 22, color: V_PB.coral, letterSpacing: '0.04em',
              border: `2px solid ${V_PB.coral}`, padding: '2px 10px', borderRadius: 4,
              background: 'rgba(255,255,255,0.5)',
            }}>DNP</div>
          </div>
        )}

        {/* Upcoming = empty frame indicator */}
        {isUpcoming && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.22em', color: V_PB.indigoMute, fontWeight: 700 }}>UPCOMING</span>
          </div>
        )}

        {/* Goals/assists chips bottom */}
        {!isDnp && !isUpcoming && (d.g > 0 || d.a > 0) && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 4 }}>
            {d.g > 0 && (
              <span style={{ background: isPlayhead ? V_PB.yellow : V_PB.indigo, color: isPlayhead ? V_PB.indigo : V_PB.sand, fontFamily: V_PT.mono, fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>
                {d.g}G
              </span>
            )}
            {d.a > 0 && (
              <span style={{ background: 'transparent', color: isPlayhead ? V_PB.sand : V_PB.indigo, border: `1px solid ${isPlayhead ? 'rgba(238,228,200,0.4)' : V_PB.indigoLine}`, fontFamily: V_PT.mono, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>
                {d.a}A
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer — date + opponent */}
      <div style={{
        background: isPlayhead ? '#0F0A36' : isDnp ? V_PB.sandDeep : V_PB.sandDeep,
        borderTop: `1px solid ${isPlayhead ? 'rgba(238,228,200,0.16)' : V_PB.indigoLine}`,
        padding: '6px 8px',
      }}>
        <div style={{ fontFamily: V_PT.mono, fontSize: 8.5, letterSpacing: '0.14em', fontWeight: 700, color: isPlayhead ? 'rgba(238,228,200,0.55)' : V_PB.indigoMute }}>
          {d.date.toUpperCase()}{isTraining && <span style={{ marginLeft: 4, color: isPlayhead ? V_PB.yellow : V_PB.indigoMid }}>· FRIENDLY</span>}
        </div>
        <div style={{ fontFamily: V_PT.body, fontSize: 11, fontWeight: 600, color: isPlayhead ? V_PB.sand : V_PB.indigo, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {d.opp}
        </div>
      </div>
    </button>
  );
}

// ── FILMSTRIP — 7-frame paged window with chevrons ──
function V_Filmstrip({ data, currentMd, onSelect, windowSize = 7, dark = true, frameW = 138, frameH = 172 }) {
  // Default the visible window to end at the playhead.
  const playheadIdx = data.findIndex(d => d.md === currentMd);
  const totalLen = data.length;
  // The window starts so currentMd is visible; default to the latest.
  const initialStart = Math.max(0, Math.min(totalLen - windowSize, playheadIdx - windowSize + 2));
  const [start, setStart] = React.useState(initialStart);
  React.useEffect(() => { setStart(Math.max(0, Math.min(totalLen - windowSize, playheadIdx - windowSize + 2))); }, [currentMd, totalLen, windowSize, playheadIdx]);

  const end = Math.min(start + windowSize, totalLen);
  const visible = data.slice(start, end);
  const canBack = start > 0;
  const canFwd = end < totalLen;

  const prevWin = `MD${data[Math.max(0, start - windowSize)].md}–MD${data[Math.max(0, start - 1)] ? data[start - 1].md : data[start].md}`;
  const nextWin = canFwd ? `MD${data[end].md}–MD${data[Math.min(totalLen - 1, end + windowSize - 1)].md}` : '';
  const currentRange = `MD${visible[0].md}–MD${visible[visible.length - 1].md}`;

  const cellW = frameW, gap = 12;

  // Playhead position in the visible window (or hidden if scrolled away)
  const playheadInWindow = playheadIdx >= start && playheadIdx < end;
  const playheadOffset = (playheadIdx - start) * (cellW + gap) + cellW / 2;

  const bg = dark ? V_PB.indigo : V_PB.paper;
  const fg = dark ? V_PB.sand : V_PB.indigo;
  const muted = dark ? 'rgba(238,228,200,0.65)' : V_PB.indigoMute;
  const yellow = V_PB.yellow;
  const ringBtn = dark ? 'rgba(238,228,200,0.3)' : V_PB.indigoLine;

  return (
    <div style={{ background: bg, color: fg, borderRadius: 12, padding: '20px 28px 26px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <V_Eyebrow color={yellow}>SEASON FILMSTRIP</V_Eyebrow>
          <span style={{ fontFamily: V_PT.mono, fontSize: 11, color: muted, letterSpacing: '0.16em', fontWeight: 600 }}>
            {currentRange} · {totalLen} MATCHES
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => canBack && setStart(Math.max(0, start - windowSize))}
            disabled={!canBack}
            style={{
              background: 'transparent', color: fg, border: `1px solid ${ringBtn}`,
              padding: '7px 14px', borderRadius: 999,
              fontFamily: V_PT.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
              opacity: canBack ? 1 : 0.3, cursor: canBack ? 'pointer' : 'default',
            }}
          >‹ {canBack ? prevWin : '—'}</button>
          <button
            onClick={() => canFwd && setStart(Math.min(totalLen - windowSize, start + windowSize))}
            disabled={!canFwd}
            style={{
              background: 'transparent', color: fg, border: `1px solid ${ringBtn}`,
              padding: '7px 14px', borderRadius: 999,
              fontFamily: V_PT.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
              opacity: canFwd ? 1 : 0.3, cursor: canFwd ? 'pointer' : 'default',
            }}
          >{canFwd ? nextWin : '—'} ›</button>
        </div>
      </div>

      {/* The strip */}
      <div style={{ display: 'flex', gap, position: 'relative' }}>
        {visible.map(d => (
          <V_Frame key={d.md} d={d} isPlayhead={d.md === currentMd} onClick={() => !d.upcoming && onSelect && onSelect(d.md)} w={cellW} h={frameH} />
        ))}
        {/* Yellow playhead bar */}
        {playheadInWindow && (
          <div style={{
            position: 'absolute', top: -10, bottom: -18,
            left: playheadOffset - 1, width: 2, background: yellow, zIndex: 1, pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', top: -8, left: -7, width: 16, height: 16, borderRadius: '50%',
              background: yellow, border: `3px solid ${V_PB.indigo}`,
            }} />
            <div style={{
              position: 'absolute', bottom: -8, left: -7, width: 16, height: 16, borderRadius: '50%',
              background: yellow, border: `3px solid ${V_PB.indigo}`,
            }} />
          </div>
        )}
      </div>

      {/* Mini-map: dots representing the entire season */}
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.18em', color: muted, fontWeight: 700 }}>FULL SEASON</span>
        <div style={{ flex: 1, display: 'flex', gap: 2, position: 'relative' }}>
          {data.map((d, i) => {
            const inWindow = i >= start && i < end;
            const isPlay = d.md === currentMd;
            let dotColor = 'rgba(238,228,200,0.18)';
            if (!dark) dotColor = V_PB.indigoLine;
            if (d.motm) dotColor = yellow;
            else if (d.poor) dotColor = V_PB.coral;
            else if (d.dnp) dotColor = V_PB.coralSoft;
            else if (d.upcoming) dotColor = dark ? 'rgba(238,228,200,0.1)' : V_PB.indigoSofter;
            else if (d.score >= 75) dotColor = dark ? V_PB.sand : V_PB.indigo;
            return (
              <div key={d.md} style={{
                flex: 1, height: 8,
                background: dotColor,
                opacity: inWindow ? 1 : 0.45,
                border: isPlay ? `2px solid ${yellow}` : 'none',
                borderRadius: 2,
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TOP NAV ──
function V_Nav() {
  const p = V_P;
  return (
    <div style={{
      background: V_PB.sand, borderBottom: `1px solid ${V_PB.indigoLine}`,
      padding: '12px 36px', display: 'flex', alignItems: 'center', gap: 22,
    }}>
      <div style={{ fontFamily: V_PT.display, fontSize: 22, letterSpacing: '0.04em', color: V_PB.indigo }}>FAIRPLAI</div>
      <div style={{ width: 1, height: 18, background: V_PB.indigoLine }} />
      <div style={{ display: 'flex', gap: 18, fontFamily: V_PT.mono, fontSize: 10.5, letterSpacing: '0.18em' }}>
        <span style={{ color: V_PB.indigoMute }}>SQUAD</span>
        <span style={{ color: V_PB.indigoMute }}>THE REEL</span>
        <span style={{ color: V_PB.indigo, fontWeight: 700, position: 'relative' }}>
          PLAYER
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: -13, height: 2, background: V_PB.yellow }} />
        </span>
        <span style={{ color: V_PB.indigoMute }}>NOTES</span>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 600 }}>
          {p.roster.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── IDENTITY STRIP — adds Make a card CTA ──
function V_IdentityStrip({ onMakeCard }) {
  const p = V_P;
  return (
    <div style={{
      padding: '20px 36px', background: V_PB.sand,
      borderBottom: `1px solid ${V_PB.indigoLine}`,
      display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', gap: 24, alignItems: 'center',
    }}>
      <V_Glyph size={84} num={p.num} name={`${p.firstName} ${p.lastName}`} motm={p.lastSession.motm} />
      <div>
        <V_Eyebrow>{p.positionLabel} · #{p.num}</V_Eyebrow>
        <V_Display size={48} style={{ marginTop: 2 }}>{p.firstName} {p.lastName}</V_Display>
        <div style={{ fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigoMute, marginTop: 4, display: 'flex', gap: 12 }}>
          <span>{p.age} yrs</span><span>·</span>
          <span>{p.height}</span><span>·</span>
          <span>{p.foot}-foot</span><span>·</span>
          <span>{p.nationality}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', borderLeft: `1px solid ${V_PB.indigoLine}`, padding: '0 22px' }}>
        <V_Eyebrow style={{ fontSize: 9.5 }}>SEASON</V_Eyebrow>
        <V_Display size={44} style={{ marginTop: 3 }}>{p.season.score}</V_Display>
        <div style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700, color: V_PB.green }}>↑ +{p.season.trend}</div>
      </div>
      <div style={{ textAlign: 'center', borderLeft: `1px solid ${V_PB.indigoLine}`, padding: '0 22px' }}>
        <V_Eyebrow style={{ fontSize: 9.5 }}>LATEST</V_Eyebrow>
        <V_Display size={44} color={V_PB.yellow} style={{ marginTop: 3, WebkitTextStroke: `1.5px ${V_PB.indigo}` }}>{p.lastSession.score}</V_Display>
        <div style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700, color: V_PB.indigo }}>★ MOTM</div>
      </div>
      <button
        onClick={onMakeCard}
        style={{
          background: V_PB.indigo, color: V_PB.sand, border: 'none', padding: '10px 16px',
          borderRadius: 8, fontFamily: V_PT.body, fontWeight: 600, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <line x1="1.5" y1="5" x2="12.5" y2="5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Make a card ↗
      </button>
    </div>
  );
}

// ── HERO — Latest match, lead element ──
function V_LatestHero({ onScrubBack }) {
  const p = V_P;
  const last = p.progressionLong.find(d => d.md === 25); // MD25 = MD9-equiv = City Stars
  const stats = p.lastSession.keyStats;
  return (
    <section style={{ background: V_PB.paper, padding: '32px 36px', borderBottom: `1px solid ${V_PB.indigoLine}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 360px', gap: 32, alignItems: 'center' }}>
        {/* Score + scope */}
        <div>
          <V_Arc value={p.lastSession.score} size={160} stroke={12} font={V_PT.display} color={V_PB.yellow} />
          <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: V_PB.yellow, color: V_PB.indigo, padding: '4px 10px', borderRadius: 999, fontFamily: V_PT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em' }}>
              ★ MAN OF THE MATCH
            </span>
          </div>
        </div>

        {/* Match label + stats inline */}
        <div>
          <V_Eyebrow>LATEST MATCH</V_Eyebrow>
          <V_Display size={48} style={{ marginTop: 4 }}>
            MD{last.md} · vs {last.opp}
          </V_Display>
          <div style={{ fontFamily: V_PT.body, fontSize: 14, color: V_PB.indigoMute, marginTop: 4, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span>{last.date} · 2025</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: V_PB.indigoMute }} />
            <span>Won 3–2</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: V_PB.indigoMute }} />
            <span>{p.lastSession.minutes}'</span>
          </div>

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0, borderTop: `1px solid ${V_PB.indigoLine}`, borderBottom: `1px solid ${V_PB.indigoLine}` }}>
            {stats.slice(0, 6).map((s, i) => (
              <div key={s.k} style={{
                padding: '14px 12px',
                borderRight: i < 5 ? `1px solid ${V_PB.indigoLine}` : 'none',
              }}>
                <V_Display size={28}>{s.v}</V_Display>
                <div style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.18em', fontWeight: 700, color: V_PB.indigoMute, marginTop: 4 }}>
                  {s.k.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach note for this match */}
        <div style={{
          background: V_PB.sand, border: `1px solid ${V_PB.indigoLine}`, borderRadius: 10,
          padding: '16px 18px',
        }}>
          <V_Eyebrow>COACH NOTE · MD{last.md}</V_Eyebrow>
          <div style={{ fontFamily: V_PT.body, fontSize: 13.5, color: V_PB.indigo, lineHeight: 1.55, marginTop: 8 }}>
            “{last.note}”
          </div>
          <div style={{ marginTop: 10, fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>
            — COACH SARA · {last.date.toUpperCase()}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── PLAYHEAD DETAIL — when scrubbed off the latest ──
function V_PlayheadDetail({ md, data }) {
  const d = data.find(x => x.md === md) || data[data.length - 1];
  const isLatest = d.md === 25;
  if (isLatest) return null; // Latest hero already shown above

  if (d.upcoming) {
    return (
      <section style={{ background: V_PB.paper, padding: '28px 36px', borderBottom: `1px solid ${V_PB.indigoLine}` }}>
        <V_Eyebrow>UPCOMING · MD{d.md}</V_Eyebrow>
        <V_Display size={32} style={{ marginTop: 6 }}>vs {d.opp}</V_Display>
        <div style={{ fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigoMute, marginTop: 4 }}>
          {d.date} · 2025 · No data yet.
        </div>
      </section>
    );
  }

  if (d.dnp) {
    return (
      <section style={{ background: V_PB.paper, padding: '28px 36px', borderBottom: `1px solid ${V_PB.indigoLine}` }}>
        <V_Eyebrow color={V_PB.coral}>DID NOT PLAY · MD{d.md}</V_Eyebrow>
        <V_Display size={32} style={{ marginTop: 6 }}>vs {d.opp}</V_Display>
        <div style={{ fontFamily: V_PT.body, fontSize: 14, color: V_PB.indigo, marginTop: 8, maxWidth: 540, lineHeight: 1.55 }}>
          “{d.note}”
        </div>
        <div style={{ marginTop: 8, fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>— COACH SARA · {d.date.toUpperCase()}</div>
      </section>
    );
  }

  const isMotm = d.motm;
  const isPoor = d.poor;
  return (
    <section style={{ background: V_PB.paper, padding: '28px 36px', borderBottom: `1px solid ${V_PB.indigoLine}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 360px', gap: 28, alignItems: 'center' }}>
        <V_Arc value={d.score} size={120} stroke={10} font={V_PT.display}
          color={isMotm ? V_PB.yellow : isPoor ? V_PB.coral : V_PB.indigo} />
        <div>
          <V_Eyebrow color={isMotm ? V_PB.indigo : isPoor ? V_PB.coral : V_PB.indigoMute}>
            {isMotm ? '★ MOTM · ' : isPoor ? 'POOR FORM · ' : ''}{d.kind === 'training' ? 'FRIENDLY · ' : ''}MD{d.md}
          </V_Eyebrow>
          <V_Display size={36} style={{ marginTop: 4 }}>vs {d.opp}</V_Display>
          <div style={{ fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigoMute, marginTop: 4, display: 'flex', gap: 10 }}>
            <span>{d.date}</span><span>·</span>
            <span>{d.result === 'W' ? 'Won' : d.result === 'L' ? 'Lost' : 'Drew'}</span>
            {d.g > 0 && <><span>·</span><span><strong style={{ color: V_PB.indigo }}>{d.g}</strong> goal{d.g > 1 ? 's' : ''}</span></>}
            {d.a > 0 && <><span>·</span><span><strong style={{ color: V_PB.indigo }}>{d.a}</strong> assist{d.a > 1 ? 's' : ''}</span></>}
          </div>
        </div>
        <div style={{ background: V_PB.sand, border: `1px solid ${V_PB.indigoLine}`, borderRadius: 10, padding: '14px 16px' }}>
          <V_Eyebrow>COACH NOTE</V_Eyebrow>
          {d.note ? (
            <>
              <div style={{ fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigo, lineHeight: 1.55, marginTop: 6 }}>
                “{d.note}”
              </div>
              <div style={{ marginTop: 8, fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>— COACH SARA</div>
            </>
          ) : (
            <div style={{ marginTop: 6, fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigoMute }}>
              No note for this match · <a style={{ color: V_PB.indigo, fontWeight: 600 }}>Add note ↗</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── COMPRESSED SEASON-NUMBERS STRIP ──
function V_SeasonNumbers({ data }) {
  const played = data.filter(d => !d.dnp && !d.upcoming);
  const matches = played.length;
  const goals = played.reduce((s, d) => s + (d.g || 0), 0);
  const assists = played.reduce((s, d) => s + (d.a || 0), 0);
  const motms = played.filter(d => d.motm).length;
  return (
    <section style={{ background: V_PB.sand, padding: '20px 36px', borderBottom: `1px solid ${V_PB.indigoLine}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, 1fr) auto', gap: 0, alignItems: 'center' }}>
        <V_Eyebrow style={{ paddingRight: 22 }}>SEASON · TO DATE</V_Eyebrow>
        {[
          { k: 'Matches', v: matches },
          { k: 'Goals',   v: goals },
          { k: 'Assists', v: assists },
          { k: 'MOTMs',   v: motms },
        ].map((s, i, arr) => (
          <div key={s.k} style={{
            padding: '4px 22px',
            borderLeft: `1px solid ${V_PB.indigoLine}`,
            borderRight: i === arr.length - 1 ? `1px solid ${V_PB.indigoLine}` : 'none',
            display: 'flex', alignItems: 'baseline', gap: 10,
          }}>
            <V_Display size={32}>{s.v}</V_Display>
            <div style={{ fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, color: V_PB.indigoMute }}>
              {s.k.toUpperCase()}
            </div>
          </div>
        ))}
        <div style={{ paddingLeft: 22, fontFamily: V_PT.mono, fontSize: 11, fontWeight: 700, color: V_PB.green, letterSpacing: '0.12em' }}>
          ↑ +12 SINCE MD3
        </div>
      </div>
    </section>
  );
}

// ── IDP POSTSCRIPT — closing section ──
function V_IDPPostscript() {
  const idp = V_P.idp;
  const statusMeta = {
    'on-track': { tag: 'ON TRACK', color: V_PB.green },
    'unlocked': { tag: 'UNLOCKED', color: V_PB.yellow },
    'watch':    { tag: 'TO WATCH', color: V_PB.coral },
    'at-risk':  { tag: 'AT RISK',  color: V_PB.coral },
  };
  return (
    <section style={{ background: V_PB.indigo, color: V_PB.sand, padding: '48px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 32, alignItems: 'baseline', marginBottom: 24 }}>
        <V_Eyebrow color={V_PB.yellow} style={{ borderTop: `2px solid ${V_PB.yellow}`, paddingTop: 8 }}>THE PLAN</V_Eyebrow>
        <div>
          <V_Display size={52} color={V_PB.sand}>
            <span style={{ background: V_PB.yellow, color: V_PB.indigo, padding: '0 10px' }}>{idp.headline}.</span>
          </V_Display>
          <div style={{ fontFamily: V_PT.body, fontSize: 13.5, color: 'rgba(238,228,200,0.7)', marginTop: 12, display: 'flex', gap: 16 }}>
            <span>Horizon · {idp.horizon}</span>
            <span>·</span>
            <span>Author · {idp.author}</span>
            <span>·</span>
            <span>Next review · {idp.nextReview}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        {/* Goals — numbered */}
        <div>
          {idp.goals.map((g, i) => {
            const sm = statusMeta[g.status];
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '64px 1fr 110px', gap: 16,
                padding: '18px 0',
                borderBottom: i === idp.goals.length - 1 ? 'none' : `1px solid rgba(238,228,200,0.16)`,
                alignItems: 'baseline',
              }}>
                <V_Display size={44} color={V_PB.yellow}>0{i + 1}</V_Display>
                <div>
                  <V_Display size={22} color={V_PB.sand}>{g.g}.</V_Display>
                  <div style={{ fontFamily: V_PT.body, fontSize: 13.5, color: 'rgba(238,228,200,0.78)', marginTop: 6, lineHeight: 1.55, maxWidth: 540 }}>
                    {g.note}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: sm.color === V_PB.yellow ? V_PB.yellow : 'transparent',
                    color: sm.color === V_PB.yellow ? V_PB.indigo : sm.color,
                    border: sm.color === V_PB.yellow ? 'none' : `1px solid ${sm.color}`,
                    padding: '4px 10px', borderRadius: 999,
                    fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700,
                  }}>{sm.tag}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ratings sidebar */}
        <div>
          <V_Eyebrow color={V_PB.yellow} style={{ marginBottom: 16 }}>RATINGS</V_Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Attitude',     idp.ratings.attitude],
              ['Effort',       idp.ratings.effort],
              ['Coachability', idp.ratings.coachability],
              ['Sportsmanship',idp.ratings.sportsmanship],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid rgba(238,228,200,0.12)` }}>
                <div style={{ fontFamily: V_PT.body, fontSize: 14, fontWeight: 600, color: V_PB.sand }}>{k}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{
                      width: 18, height: 18, borderRadius: 3,
                      background: n <= v ? V_PB.yellow : 'transparent',
                      border: n <= v ? 'none' : `1px solid rgba(238,228,200,0.3)`,
                      color: n <= v ? V_PB.indigo : 'transparent',
                      fontFamily: V_PT.display, fontSize: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button style={{
            marginTop: 22, width: '100%', background: V_PB.yellow, color: V_PB.indigo,
            border: 'none', borderRadius: 999, padding: '14px 18px',
            fontFamily: V_PT.body, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>Open the IDP →</button>
        </div>
      </div>
    </section>
  );
}

// ── SHARE-CARD MODAL ──
function V_ShareCardModal({ open, onClose }) {
  const [format, setFormat] = React.useState('square');
  const p = V_P;
  if (!open) return null;
  const sizes = {
    square: { w: 480, h: 480, label: 'Square · 1:1' },
    story:  { w: 320, h: 568, label: 'Story · 9:16' },
    card:   { w: 540, h: 340, label: 'Card · 16:10' },
  };
  const sz = sizes[format];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(11,8,40,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: V_PB.sand, borderRadius: 14, padding: '24px 28px',
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28,
        maxWidth: 980, width: '100%', maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 60px rgba(11,8,40,0.4)',
      }}>
        {/* preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <V_Eyebrow style={{ alignSelf: 'flex-start' }}>PREVIEW · {sz.label.toUpperCase()}</V_Eyebrow>
          <div style={{
            background: V_PB.indigo, color: V_PB.sand, width: sz.w, height: sz.h,
            padding: 28, position: 'relative', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <V_Glyph size={56} num={p.num} name={`${p.firstName} ${p.lastName}`} motm={true} />
              <div>
                <div style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.22em', color: V_PB.yellow, fontWeight: 700 }}>★ MOTM · MD9</div>
                <div style={{ fontFamily: V_PT.display, fontSize: 22, color: V_PB.sand, letterSpacing: '-0.01em' }}>{p.firstName} {p.lastName}</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <V_Display size={format === 'story' ? 80 : 110} color={V_PB.yellow} style={{ WebkitTextStroke: `2px ${V_PB.indigo}` }}>91</V_Display>
                <div style={{ fontFamily: V_PT.mono, fontSize: 11, letterSpacing: '0.22em', color: 'rgba(238,228,200,0.7)', fontWeight: 700, marginTop: 6 }}>COMPOSITE</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'space-around', borderTop: `1px solid rgba(238,228,200,0.2)`, paddingTop: 12 }}>
              {[['2', 'GOALS'], ['1', 'ASSIST'], ['88%', 'PASS'], ['8/10', 'DUELS']].map(([v, k]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <V_Display size={20} color={V_PB.sand}>{v}</V_Display>
                  <div style={{ fontFamily: V_PT.mono, fontSize: 8.5, letterSpacing: '0.18em', color: 'rgba(238,228,200,0.6)', fontWeight: 700, marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 12, right: 16, fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(238,228,200,0.5)', fontWeight: 700 }}>
              FAIRPL.AI
            </div>
          </div>
        </div>

        {/* controls */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <V_Display size={24}>Make a card</V_Display>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: V_PB.indigo, fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ fontFamily: V_PT.body, fontSize: 13, color: V_PB.indigoMute, marginTop: 4, lineHeight: 1.5 }}>
            Export Leo's MOTM at MD9 for parents.
          </div>

          <V_Eyebrow style={{ marginTop: 22 }}>FORMAT</V_Eyebrow>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(sizes).map(([k, s]) => (
              <button key={k} onClick={() => setFormat(k)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: format === k ? V_PB.indigo : V_PB.paper, color: format === k ? V_PB.sand : V_PB.indigo,
                border: `1px solid ${format === k ? V_PB.indigo : V_PB.indigoLine}`,
                padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                fontFamily: V_PT.body, fontSize: 13.5, fontWeight: 600, textAlign: 'left',
              }}>
                <span>{s.label}</span>
                <span style={{ fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.16em', opacity: 0.7 }}>{s.w}×{s.h}</span>
              </button>
            ))}
          </div>

          <V_Eyebrow style={{ marginTop: 22 }}>EXPORT</V_Eyebrow>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{
              background: V_PB.yellow, color: V_PB.indigo, border: 'none', padding: '12px 14px', borderRadius: 8,
              fontFamily: V_PT.body, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Download PNG ↓</button>
            <button style={{
              background: 'transparent', color: V_PB.indigo, border: `1px solid ${V_PB.indigoLine}`,
              padding: '12px 14px', borderRadius: 8,
              fontFamily: V_PT.body, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Send via WhatsApp ↗</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DESKTOP TOP — latest-match-first ──
function DirectionCv2_DesktopTop({ data, dataLabel }) {
  const playedData = data || V_P.progressionLong;
  const latestMd = (playedData.findLast ? playedData.findLast(d => !d.upcoming) : [...playedData].reverse().find(d => !d.upcoming))?.md || playedData[0].md;
  const [currentMd, setCurrentMd] = React.useState(latestMd);
  const [shareOpen, setShareOpen] = React.useState(false);
  return (
    <div style={{ width: '100%', background: V_PB.sand, fontFamily: V_PT.body, color: V_PB.indigo, position: 'relative' }}>
      <V_Nav />
      <V_IdentityStrip onMakeCard={() => setShareOpen(true)} />
      {currentMd === latestMd ? <V_LatestHero /> : <V_PlayheadDetail md={currentMd} data={playedData} />}
      <div style={{ padding: '24px 36px 28px' }}>
        <V_Filmstrip data={playedData} currentMd={currentMd} onSelect={setCurrentMd} dark />
        {dataLabel && (
          <div style={{ marginTop: 10, fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.22em', color: V_PB.indigoMute, fontWeight: 700, textAlign: 'center' }}>
            DEMO CASE · {dataLabel}
          </div>
        )}
      </div>
      <V_SeasonNumbers data={playedData} />
      <V_ShareCardModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

// ── DESKTOP SCROLLED — IDP postscript ──
function DirectionCv2_DesktopScrolled() {
  return (
    <div style={{ width: '100%', background: V_PB.sand, fontFamily: V_PT.body, color: V_PB.indigo }}>
      {/* mini sticky-style top */}
      <div style={{ background: V_PB.sand, borderBottom: `1px solid ${V_PB.indigoLine}`, padding: '12px 36px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <V_Glyph size={28} num={V_P.num} name={`${V_P.firstName} ${V_P.lastName}`} />
        <div style={{ fontFamily: V_PT.body, fontSize: 13, fontWeight: 600 }}>{V_P.firstName} {V_P.lastName}</div>
        <span style={{ fontFamily: V_PT.mono, fontSize: 10, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>· #{V_P.num} · {V_P.positionLabel}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.22em', color: V_PB.indigoMute, fontWeight: 700 }}>SCOPE · MD9</span>
      </div>

      {/* Mini filmstrip */}
      <div style={{ padding: '20px 36px' }}>
        <V_Filmstrip data={V_P.progressionLong} currentMd={25} onSelect={() => {}} dark frameW={104} frameH={138} />
      </div>

      <V_IDPPostscript />
    </div>
  );
}

// ── MOBILE — sticky scope bar + Show all affordance ──
function DirectionCv2_Mobile() {
  const p = V_P;
  const fullData = p.progressionLong;
  const [scope, setScope] = React.useState('latest'); // 'latest' or 'season'
  const [showAll, setShowAll] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [currentMd, setCurrentMd] = React.useState(25);

  const mScrollRef = React.useRef(null);
  React.useEffect(() => {
    const el = mScrollRef.current; if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 200);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Visible matches — latest 7 unless showAll
  const visible = showAll
    ? fullData.filter(d => !d.upcoming).slice().reverse()
    : fullData.filter(d => !d.upcoming).slice(-7).reverse();
  const totalPlayed = fullData.filter(d => !d.upcoming).length;

  const md = fullData.find(d => d.md === currentMd) || fullData[fullData.length - 1];

  return (
    <div style={{ width: '100%', height: '100%', background: V_PB.sand, fontFamily: V_PT.body, color: V_PB.indigo, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Sticky strip — appears once scrolled past identity */}
      {scrolled && (
        <div style={{
          position: 'absolute', top: 44, left: 0, right: 0, zIndex: 20,
          background: V_PB.paper, borderBottom: `1px solid ${V_PB.indigoLine}`,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 12px rgba(11,8,40,0.08)',
        }}>
          <button style={{ background: 'transparent', border: 'none', color: V_PB.indigo, fontSize: 18, cursor: 'pointer', width: 24 }}>‹</button>
          <V_Glyph size={26} num={p.num} name={`${p.firstName} ${p.lastName}`} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: V_PT.body, fontSize: 13, fontWeight: 700, color: V_PB.indigo }}>{p.firstName} {p.lastName}</div>
            <div style={{ fontFamily: V_PT.mono, fontSize: 8.5, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>#{p.num} · {p.positionLabel}</div>
          </div>
          <div style={{ display: 'inline-flex', background: V_PB.sand, border: `1px solid ${V_PB.indigoLine}`, borderRadius: 999, padding: 2 }}>
            {[['latest', 'Latest'], ['season', 'Season']].map(([k, l]) => {
              const active = scope === k;
              return (
                <button key={k} onClick={() => setScope(k)} style={{
                  padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: active ? V_PB.indigo : 'transparent',
                  color: active ? V_PB.sand : V_PB.indigo,
                  fontFamily: V_PT.body, fontSize: 11, fontWeight: 600,
                }}>{l}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* iOS top */}
      <div style={{ padding: '52px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <button style={{ background: V_PB.paper, border: `1px solid ${V_PB.indigoLine}`, color: V_PB.indigo, width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: 'pointer' }}>‹</button>
        <div style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.22em', color: V_PB.indigoMute, fontWeight: 700 }}>PLAYER · #{p.num}</div>
        <button style={{ background: V_PB.paper, border: `1px solid ${V_PB.indigoLine}`, color: V_PB.indigo, width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>↗</button>
      </div>

      <div ref={mScrollRef} style={{ flex: 1, overflowY: 'auto' }}>
        {/* Identity */}
        <div style={{ padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <V_Glyph size={64} num={p.num} name={`${p.firstName} ${p.lastName}`} motm={p.lastSession.motm} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.22em', color: V_PB.indigoMute, fontWeight: 700 }}>
              {p.positionLabel} · #{p.num}
            </div>
            <V_Display size={28} style={{ marginTop: 2 }}>{p.firstName} {p.lastName}</V_Display>
            <div style={{ fontFamily: V_PT.body, fontSize: 11.5, color: V_PB.indigoMute, marginTop: 3 }}>
              {p.age} yrs · {p.foot}-foot · {p.roster}
            </div>
          </div>
          <button style={{
            background: V_PB.indigo, color: V_PB.sand, border: 'none', padding: '8px 10px', borderRadius: 7,
            fontFamily: V_PT.body, fontSize: 11, fontWeight: 600,
          }}>Card ↗</button>
        </div>

        {/* Latest hero — primary */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{ background: V_PB.indigo, color: V_PB.sand, borderRadius: 12, padding: '18px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: V_PT.mono, fontSize: 9.5, letterSpacing: '0.22em', color: V_PB.yellow, fontWeight: 700 }}>★ MOTM · LATEST · MD25</div>
              <span style={{ fontFamily: V_PT.mono, fontSize: 9.5, color: 'rgba(238,228,200,0.65)', letterSpacing: '0.16em', fontWeight: 600 }}>W 3–2</span>
            </div>
            <V_Display size={28} color={V_PB.sand} style={{ marginTop: 4 }}>vs City Stars</V_Display>
            <div style={{ fontFamily: V_PT.body, fontSize: 12, color: 'rgba(238,228,200,0.7)', marginTop: 2 }}>Mar 15 · 2025 · 70'</div>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '110px 1fr', gap: 14, alignItems: 'center' }}>
              <V_Arc value={91} size={110} stroke={9} font={V_PT.display} color={V_PB.yellow} textColor={V_PB.sand} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[['2','GOALS'],['1','ASSIST'],['88%','PASS'],['8/10','DUELS']].map(([v,k]) => (
                  <div key={k} style={{ background: 'rgba(238,228,200,0.06)', borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontFamily: V_PT.display, fontSize: 18, color: V_PB.sand, letterSpacing: '-0.02em' }}>{v}</div>
                    <div style={{ fontFamily: V_PT.mono, fontSize: 8.5, letterSpacing: '0.18em', color: 'rgba(238,228,200,0.6)', fontWeight: 700 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach note */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid rgba(238,228,200,0.18)` }}>
              <div style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.22em', color: V_PB.yellow, fontWeight: 700 }}>COACH NOTE</div>
              <div style={{ fontFamily: V_PT.body, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(238,228,200,0.88)', marginTop: 4 }}>
                “{md.note}”
              </div>
            </div>
          </div>
        </div>

        {/* Vertical filmstrip */}
        <div style={{ padding: '20px 16px 8px' }}>
          <V_Eyebrow>SEASON FILMSTRIP</V_Eyebrow>
          <div style={{ fontFamily: V_PT.mono, fontSize: 10.5, letterSpacing: '0.16em', color: V_PB.indigoMute, marginTop: 4, fontWeight: 600 }}>
            {showAll ? `MD1–MD${visible[0].md} · ALL ${totalPlayed}` : `LATEST 7 OF ${totalPlayed}`}
          </div>
        </div>

        <div style={{ padding: '0 16px 8px', position: 'relative' }}>
          {/* connecting rail */}
          <div style={{
            position: 'absolute', left: 60, top: 12, bottom: 12, width: 2,
            background: V_PB.indigoLine,
          }} />

          {visible.map(d => {
            const isCurrent = d.md === currentMd;
            const isMotm = d.motm;
            const isPoor = d.poor;
            const isDnp = d.dnp;
            const isTraining = d.kind === 'training';

            // border treatment
            let cardBorder = `1px solid ${V_PB.indigoLine}`;
            if (isMotm) cardBorder = `2px solid ${V_PB.yellow}`;
            else if (isPoor) cardBorder = `2px solid ${V_PB.coral}`;
            if (isTraining && !isMotm && !isPoor) cardBorder = `1px dashed ${V_PB.indigoLine}`;

            return (
              <button key={d.md} onClick={() => !isDnp && setCurrentMd(d.md)} style={{
                width: '100%', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12,
                background: 'transparent', border: 'none', padding: '6px 0', cursor: 'pointer',
                alignItems: 'center', textAlign: 'left',
              }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 70 }}>
                  <div style={{ width: 56 }}>
                    <div style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700 }}>
                      MD{d.md}
                    </div>
                    <div style={{ fontFamily: V_PT.body, fontSize: 11, color: V_PB.indigo, fontWeight: 600, marginTop: 1 }}>
                      {d.date}
                    </div>
                  </div>
                  <div style={{
                    position: 'relative', zIndex: 1, width: 18, height: 18, borderRadius: '50%',
                    background: isCurrent ? V_PB.yellow : isDnp ? V_PB.coralSoft : V_PB.paper,
                    border: `2px solid ${V_PB.indigo}`, marginLeft: -3,
                  }}>
                    {isMotm && <span style={{ position: 'absolute', top: -16, left: 1, color: V_PB.yellow, fontSize: 12 }}>★</span>}
                  </div>
                </div>

                <div style={{
                  background: isCurrent ? V_PB.indigo : isDnp ? V_PB.sandDeep : V_PB.paper,
                  color: isCurrent ? V_PB.sand : V_PB.indigo,
                  border: cardBorder,
                  borderRadius: 10, padding: '8px 12px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isDnp && (
                    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                      <V_DnpStripes id={`m-dnp-${d.md}`} />
                      <rect width="100%" height="100%" fill={`url(#m-dnp-${d.md})`} />
                    </svg>
                  )}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontFamily: V_PT.body, fontSize: 13, fontWeight: 600 }}>
                      {isTraining && <span style={{ fontFamily: V_PT.mono, fontSize: 9, letterSpacing: '0.16em', color: isCurrent ? V_PB.yellow : V_PB.indigoMid, fontWeight: 700, marginRight: 6 }}>FRIENDLY</span>}
                      vs {d.opp}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <V_ResultDot result={d.result} />
                      {isDnp ? (
                        <span style={{ fontFamily: V_PT.mono, fontSize: 10, fontWeight: 700, color: V_PB.coral, letterSpacing: '0.12em' }}>DNP</span>
                      ) : (
                        <span style={{
                          fontFamily: V_PT.display, fontSize: 20,
                          color: isCurrent ? V_PB.yellow : isMotm ? V_PB.yellow : isPoor ? V_PB.coral : V_PB.indigo,
                          letterSpacing: '-0.02em',
                          WebkitTextStroke: !isCurrent && isMotm ? `1px ${V_PB.indigo}` : '',
                        }}>{d.score}</span>
                      )}
                    </div>
                  </div>
                  {!isDnp && (d.g > 0 || d.a > 0) && (
                    <div style={{ position: 'relative', display: 'flex', gap: 6, marginTop: 4 }}>
                      {d.g > 0 && <span style={{ background: isCurrent ? V_PB.yellow : V_PB.indigo, color: isCurrent ? V_PB.indigo : V_PB.sand, fontFamily: V_PT.mono, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>{d.g}G</span>}
                      {d.a > 0 && <span style={{ background: 'transparent', color: isCurrent ? V_PB.sand : V_PB.indigo, border: `1px solid ${isCurrent ? 'rgba(238,228,200,0.4)' : V_PB.indigoLine}`, fontFamily: V_PT.mono, fontSize: 9, fontWeight: 700, padding: '0 5px', borderRadius: 3 }}>{d.a}A</span>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Show all affordance */}
          {!showAll && totalPlayed > 7 && (
            <button onClick={() => setShowAll(true)} style={{
              width: '100%', marginTop: 10, background: 'transparent', color: V_PB.indigo,
              border: `1px dashed ${V_PB.indigoLine}`, borderRadius: 999, padding: '10px 14px',
              fontFamily: V_PT.body, fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
            }}>Show all {totalPlayed} ↓</button>
          )}
        </div>

        {/* Compressed numbers */}
        <div style={{ padding: '20px 16px 8px' }}>
          <V_Eyebrow>SEASON · TO DATE</V_Eyebrow>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {(() => {
              const played = fullData.filter(d => !d.dnp && !d.upcoming);
              const goals = played.reduce((s, d) => s + d.g, 0);
              const assists = played.reduce((s, d) => s + d.a, 0);
              const motms = played.filter(d => d.motm).length;
              return [
                ['Matches', played.length],
                ['Goals', goals],
                ['Assists', assists],
                ['MOTMs', motms],
              ];
            })().map(([k, v]) => (
              <div key={k} style={{ background: V_PB.paper, border: `1px solid ${V_PB.indigoLine}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                <V_Display size={22}>{v}</V_Display>
                <div style={{ fontFamily: V_PT.mono, fontSize: 8.5, letterSpacing: '0.18em', color: V_PB.indigoMute, fontWeight: 700, marginTop: 2 }}>{k.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* IDP postscript — compact */}
        <div style={{ background: V_PB.indigo, color: V_PB.sand, padding: '20px 16px', marginTop: 16 }}>
          <V_Eyebrow color={V_PB.yellow}>THE PLAN</V_Eyebrow>
          <V_Display size={24} color={V_PB.sand} style={{ marginTop: 4 }}>
            <span style={{ background: V_PB.yellow, color: V_PB.indigo, padding: '0 6px' }}>{p.idp.headline}.</span>
          </V_Display>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.idp.goals.map((g, i) => {
              const sm = { 'on-track': V_PB.green, 'unlocked': V_PB.yellow, 'watch': V_PB.coral, 'at-risk': V_PB.coral }[g.status];
              const tag = { 'on-track': 'ON TRACK', 'unlocked': 'UNLOCKED', 'watch': 'TO WATCH', 'at-risk': 'AT RISK' }[g.status];
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: V_PT.display, fontSize: 18, color: V_PB.yellow }}>0{i + 1}</span>
                  <div style={{ fontFamily: V_PT.body, fontSize: 13, fontWeight: 600, color: V_PB.sand, lineHeight: 1.3 }}>{g.g}</div>
                  <span style={{
                    background: sm === V_PB.yellow ? V_PB.yellow : 'transparent',
                    color: sm === V_PB.yellow ? V_PB.indigo : sm,
                    border: sm === V_PB.yellow ? 'none' : `1px solid ${sm}`,
                    padding: '2px 6px', borderRadius: 999,
                    fontFamily: V_PT.mono, fontSize: 8, letterSpacing: '0.16em', fontWeight: 700,
                  }}>{tag}</span>
                </div>
              );
            })}
          </div>

          <button style={{
            marginTop: 16, width: '100%', background: V_PB.yellow, color: V_PB.indigo,
            border: 'none', borderRadius: 999, padding: '12px 14px',
            fontFamily: V_PT.body, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>Open the IDP →</button>
        </div>
      </div>
    </div>
  );
}

// ── BONUS — share-card modal mounted on a backdrop ──
function DirectionCv2_ShareCard() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: V_PB.sand }}>
      {/* faux page behind */}
      <div style={{ filter: 'blur(2px)', opacity: 0.4 }}>
        <V_Nav />
        <V_IdentityStrip />
      </div>
      <V_ShareCardModal open={true} onClose={() => {}} />
    </div>
  );
}

// ── DEMO CASES — three season lengths ──
function DirectionCv2_Case9() {
  // First 10 of progressionLong = "9 played + 1 MOTM"
  const data = V_P.progressionLong.slice(0, 10).map((d, i) => ({ ...d, md: i + 1 }));
  return <DirectionCv2_DesktopTop data={data} dataLabel="9-MATCH SEASON · LATEST 7 SHOWN" />;
}

function DirectionCv2_Case15() {
  // First 15 — paginated middle window
  const data = V_P.progressionLong.slice(0, 15).map((d, i) => ({ ...d, md: i + 1 }));
  return <DirectionCv2_DesktopTop data={data} dataLabel="15-MATCH SEASON · MID-WINDOW PAGINATION" />;
}

function DirectionCv2_Case30() {
  // Full 30-match long view
  return <DirectionCv2_DesktopTop data={V_P.progressionLong} dataLabel="30-MATCH SEASON · LATEST 7 OF 30" />;
}

Object.assign(window, {
  DirectionCv2_DesktopTop, DirectionCv2_DesktopScrolled,
  DirectionCv2_Mobile, DirectionCv2_ShareCard,
  DirectionCv2_Case9, DirectionCv2_Case15, DirectionCv2_Case30,
});
