// Shared brand tokens + player data for the Player Profile redesign.
// Carries forward the sand-first / indigo / yellow palette from Direction C v3
// of the Match Analysis page so this feels like the same product universe.

const PB = {
  sand:        '#EEE4C8',
  sandDeep:    '#E0D2A8',
  sandDeeper:  '#D4C290',
  paper:       '#F8F2DE',
  paperHi:     '#FBF6E6',
  indigo:      '#1B1550',
  indigoMid:   '#2E2674',
  indigoSoft:  'rgba(27,21,80,0.10)',
  indigoSofter:'rgba(27,21,80,0.06)',
  indigoMute:  'rgba(27,21,80,0.55)',
  indigoLine:  'rgba(27,21,80,0.16)',
  yellow:      '#FCD718',
  yellowSoft:  'rgba(252,215,24,0.22)',
  coral:       '#EB4D6D',     // warnings only
  coralSoft:   'rgba(235,77,109,0.14)',
  forest:      '#063D30',
  green:       '#3A8F6B',
  ink:         '#0B0828',
};

const PT = {
  display: '"Anton", "Inter", system-ui, sans-serif',     // stand-in for Clash Display
  body:    'Inter, system-ui, sans-serif',                 // stand-in for Satoshi
  mono:    '"JetBrains Mono", ui-monospace, monospace',    // stand-in for Fragment Mono
};

// THE PLAYER — Leo P., the MOTM from MD6 in the match analysis universe.
// Center mid, U13 Lions, age 13. Roster: Lions U13 Spring.
const PLAYER = {
  id: 'leo',
  firstName: 'Leo',
  lastName:  'Pereira',
  num: 8,
  age: 13,
  position: ['CM', 'CAM'],
  positionLabel: 'CENTRAL MIDFIELDER',
  academy: 'MAK Academy',
  roster: 'Lions U13 Spring',
  status: 'active',
  nationality: 'POR',
  height: '1.62 m',
  weight: '49 kg',
  foot: 'Right',
  signedOn: 'Sep 2023',
  // composite season score (0–100). Trend is vs prior month.
  season: { score: 79, trend: +6, band: 'green', minutes: 612, matches: 11 },
  // most-recent match — MD6 vs City Stars
  lastSession: {
    label: 'vs City Stars',
    date: 'Sat 15 Mar',
    competition: 'U13 Spring · MD6',
    result: 'W 3–2',
    score: 91,
    delta: +12,                      // vs season avg
    band: 'green',
    minutes: 70,
    distance: 7.4,
    topSpeed: 27.3,
    sprints: 14,
    keyStats: [
      { k: 'Goals',       v: '2' },
      { k: 'Assists',     v: '1' },
      { k: 'Key passes',  v: '4' },
      { k: 'Pass %',      v: '88%' },
      { k: 'Duels won',   v: '8/10' },
      { k: 'Distance',    v: '7.4 km' },
    ],
    motm: true,
  },
  // 6-axis radar — values for both scopes
  radar: {
    session: { Physical: 92, Positional: 75, Passing: 82, Dribbling: 90, Control: 88, Defending: 70 },
    season:  { Physical: 78, Positional: 72, Passing: 81, Dribbling: 84, Control: 80, Defending: 68 },
  },
  // Position-aware key stats — for MID we surface key passes + pass%, plus mins + distance
  seasonKeyStats: [
    { k: 'Key passes / 90', v: '2.4', delta: '+0.6' },
    { k: 'Pass completion', v: '82%', delta: '+3%'  },
    { k: 'Goals',           v: '7'  , delta: '+4'   },
    { k: 'Assists',         v: '6'  , delta: '+2'   },
    { k: 'Minutes',         v: '612', delta: '+88'  },
    { k: 'Distance / 90',   v: '7.1 km', delta: '+0.4' },
  ],
  // Season progression — composite per match across the season
  progression: [
    { md: 1, label: 'Jan 13 · Westbridge',  score: 65, result: 'W' },
    { md: 2, label: 'Jan 20 · Greenford',   score: 69, result: 'D' },
    { md: 3, label: 'Jan 27 · Hayes Rovers',score: 72, result: 'W' },
    { md: 4, label: 'Feb 03 · Beckton',     score: 68, result: 'L' },
    { md: 5, label: 'Feb 17 · Stratford E.',score: 75, result: 'W' },
    { md: 6, label: 'Feb 24 · Forest H.',   score: 71, result: 'D' },
    { md: 7, label: 'Mar 02 · Olympic Park',score: 78, result: 'W' },
    { md: 8, label: 'Mar 09 · Royal Wharf', score: 81, result: 'W' },
    { md: 9, label: 'Mar 15 · City Stars',  score: 91, result: 'W', motm: true, latest: true },
  ],
  // Extended progression — full 30-match season for v2 pagination cases.
  // Includes: training matches, a DNP (injured), poor-form matches, MOTM (gold star),
  // results and per-match goals/assists/notes. Only matches up to MD9 are "played";
  // we generate up to MD30 for visualization (a long-season case).
  progressionFull: [
    { md: 1,  date:'Jan 13', opp:'Westbridge',   score: 65, result:'W', kind:'comp',     g:0, a:0, note:"Bedded in nicely. Quiet first half, grew into it." },
    { md: 2,  date:'Jan 20', opp:'Greenford',    score: 69, result:'D', kind:'comp',     g:0, a:1, note:"Found the LW twice. Press triggers still slow." },
    { md: 3,  date:'Jan 27', opp:'Hayes Rovers', score: 72, result:'W', kind:'comp',     g:1, a:0, note:"Goal from 18y. Worked hard out of possession." },
    { md: 4,  date:'Feb 03', opp:'Beckton',      score: 58, result:'L', kind:'comp', poor:true, g:0, a:0, note:"Quiet game. Better when we play him as the #10 not the #8." },
    { md: 5,  date:'Feb 10', opp:'Hackney FC',   score: 73, result:'W', kind:'training',  g:1, a:1, note:"Friendly vs Hackney. Tested press-resistance drills — promising." },
    { md: 6,  date:'Feb 17', opp:'Stratford E.', score: 75, result:'W', kind:'comp',     g:0, a:1, note:"Pre-assist switch was the moment. Lower-body fatigue late." },
    { md: 7,  date:'Feb 24', opp:'Forest H.',    score: 71, result:'D', kind:'comp',     g:0, a:1, note:"Cut-back assist for our goal. Cap minutes back-to-back next time." },
    { md: 8,  date:'Mar 02', opp:'Olympic Park', score: 78, result:'W', kind:'comp',     g:0, a:0, note:"Counter-press recovery on tape. No goal involvement but engine was on." },
    { md: 9,  date:'Mar 09', opp:'Royal Wharf',  score: 81, result:'W', kind:'comp',     g:1, a:0, note:"Right-foot driven from outside the box. Press-resistance is sharp." },
    { md:10, date:'Mar 15', opp:'City Stars',   score: 91, result:'W', kind:'comp', motm:true, g:2, a:1, note:"Goal #2 arrival is the clip we keep. Two careless turnovers early; fixed by adjustment." },

    // Following 5 are projected/upcoming; we render them as future-state for the long-season case
    { md:11, date:'Mar 22', opp:'Tottenham JR',  score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:12, date:'Mar 29', opp:'East End',      score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:13, date:'Apr 05', opp:'Bromley',       score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:14, date:'Apr 12', opp:'Crystal P.',    score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:15, date:'Apr 19', opp:'Wandsworth',    score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },

    // Past-season-extension synthesis (autumn 2024) — used to demonstrate the 30-match window.
    // We splice these as MDs 1..15 of the long view by synthesizing an autumn block.
    // (See `progressionLong` below.)
  ],

  // 30-match long view — autumn + spring synthesised. Has DNP, training, MOTM, poor-form.
  progressionLong: [
    { md: 1,  date:'Sep 14', opp:'Brentford JR',  score: 58, result:'L', kind:'comp', poor:true, g:0, a:0, note:"Pre-season rust. Body shape off." },
    { md: 2,  date:'Sep 21', opp:'Wycombe',       score: 62, result:'D', kind:'comp', g:0, a:0, note:"Quiet. Trust the process." },
    { md: 3,  date:'Sep 28', opp:'Watford U13',   score: 66, result:'W', kind:'comp', g:0, a:1, note:"Through-ball for the opener." },
    { md: 4,  date:'Oct 05', opp:'Reading',       score: 0,  result:'·', kind:'comp', dnp:true,  g:0, a:0, note:"Hamstring strain in warm-up. 7-day rest." },
    { md: 5,  date:'Oct 12', opp:'Charlton',      score: 0,  result:'·', kind:'comp', dnp:true,  g:0, a:0, note:"Continued rest. Cleared for training Mon." },
    { md: 6,  date:'Oct 19', opp:'AFC Wimbledon', score: 64, result:'D', kind:'comp', g:0, a:0, note:"Returned. Capped at 45'. Fine." },
    { md: 7,  date:'Oct 26', opp:'Millwall U13',  score: 70, result:'W', kind:'comp', g:1, a:0, note:"First goal of the comp. Composure visible again." },
    { md: 8,  date:'Nov 02', opp:'Eltham',        score: 73, result:'W', kind:'training', g:1, a:1, note:"Friendly. Free role; played him as a #10. Liked it." },
    { md: 9,  date:'Nov 09', opp:'QPR Academy',   score: 67, result:'L', kind:'comp', g:0, a:0, note:"Outrun in transition. Recovery sprints to focus on." },
    { md:10, date:'Nov 16', opp:'Fulham U13',    score: 71, result:'W', kind:'comp', g:0, a:1, note:"Cleaner press today. Switch to LW = our 2nd." },
    { md:11, date:'Nov 23', opp:'Crystal P.',    score: 55, result:'L', kind:'comp', poor:true, g:0, a:0, note:"Lost. He looked tired by 50'. Manage minutes." },
    { md:12, date:'Nov 30', opp:'Sutton U13',    score: 75, result:'W', kind:'comp', g:1, a:1, note:"Bounce-back. Goal off a corner." },
    { md:13, date:'Dec 07', opp:'Bromley JR',    score: 78, result:'W', kind:'comp', g:0, a:2, note:"Two assists. The #10 conversation is real." },
    { md:14, date:'Dec 14', opp:'AFC Hayes',     score: 72, result:'D', kind:'training', g:1, a:0, note:"Indoor friendly. Goal + a blocked shot." },
    { md:15, date:'Dec 21', opp:'East End',      score: 81, result:'W', kind:'comp', motm:true, g:2, a:0, note:"First MOTM. Two-goal half. Talked role with him after." },
    // winter break
    { md:16, date:'Jan 13', opp:'Westbridge',    score: 65, result:'W', kind:'comp', g:0, a:0, note:"Bedded in nicely. Quiet first half, grew into it." },
    { md:17, date:'Jan 20', opp:'Greenford',     score: 69, result:'D', kind:'comp', g:0, a:1, note:"Found the LW twice. Press triggers still slow." },
    { md:18, date:'Jan 27', opp:'Hayes Rovers',  score: 72, result:'W', kind:'comp', g:1, a:0, note:"Goal from 18y. Worked hard out of possession." },
    { md:19, date:'Feb 03', opp:'Beckton',       score: 58, result:'L', kind:'comp', poor:true, g:0, a:0, note:"Quiet game. Better as the #10 not the #8." },
    { md:20, date:'Feb 10', opp:'Hackney FC',    score: 73, result:'W', kind:'training', g:1, a:1, note:"Friendly. Tested press-resistance drills." },
    { md:21, date:'Feb 17', opp:'Stratford E.',  score: 75, result:'W', kind:'comp', g:0, a:1, note:"Pre-assist switch. Lower-body fatigue late." },
    { md:22, date:'Feb 24', opp:'Forest H.',     score: 71, result:'D', kind:'comp', g:0, a:1, note:"Cut-back assist." },
    { md:23, date:'Mar 02', opp:'Olympic Park',  score: 78, result:'W', kind:'comp', g:0, a:0, note:"Counter-press recovery on tape." },
    { md:24, date:'Mar 09', opp:'Royal Wharf',   score: 81, result:'W', kind:'comp', g:1, a:0, note:"Right-foot driven. Press-resistance sharp." },
    { md:25, date:'Mar 15', opp:'City Stars',    score: 91, result:'W', kind:'comp', motm:true, g:2, a:1, latest:true, note:"Goal #2 arrival is the clip. Two early turnovers; fixed." },
    // upcoming
    { md:26, date:'Mar 22', opp:'Tottenham JR',  score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:27, date:'Mar 29', opp:'East End',      score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:28, date:'Apr 05', opp:'Bromley',       score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:29, date:'Apr 12', opp:'Crystal P.',    score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
    { md:30, date:'Apr 19', opp:'Wandsworth',    score: 0, result:'·', kind:'comp', upcoming:true, g:0, a:0, note:'' },
  ],

  // Benchmarking — same six metrics, three reference groups
  bench: {
    metrics: ['Composite', 'Pass %', 'Key passes /90', 'Distance /90', 'Top speed', 'Duels won %'],
    units:   ['',          '%',      '',                'km',           'km/h',      '%'         ],
    player:  [79,           82,       2.4,               7.1,            27.3,        61          ],
    academy: [68,           74,       1.6,               6.4,            25.6,        54          ],
    position:[71,           78,       2.0,               6.8,            25.9,        56          ],
    age_group:[70,          76,       1.8,               6.7,            25.4,        55          ],
  },
  // Heatmap — vertical pitch, 0..1 grid (x: left-right, y: bottom-up own goal)
  // We store as cells of "intensity" from 0..1
  heatmap: {
    session: [
      // CM-typical: hot center, slight right side bias on overlap
      { x: 0.50, y: 0.50, w: 1.0 }, { x: 0.55, y: 0.55, w: 0.9 },
      { x: 0.45, y: 0.45, w: 0.8 }, { x: 0.60, y: 0.62, w: 0.7 },
      { x: 0.40, y: 0.40, w: 0.6 }, { x: 0.62, y: 0.42, w: 0.7 },
      { x: 0.50, y: 0.66, w: 0.6 }, { x: 0.50, y: 0.34, w: 0.55 },
      { x: 0.66, y: 0.70, w: 0.5 }, { x: 0.36, y: 0.52, w: 0.5 },
      { x: 0.52, y: 0.78, w: 0.45 }, // arrival into the box for goal #2
      { x: 0.46, y: 0.28, w: 0.35 },
    ],
  },
  // Highlights — clip cards
  highlights: [
    { id:'h1', md:9, ev:'goal',     label:'vs City Stars · MD6', minute:33, dur:42, headline:"Late-arrival finish · 2–1", motm:true,  latest:true },
    { id:'h2', md:9, ev:'goal',     label:'vs City Stars · MD6', minute:62, dur:38, headline:"Box arrival · 3–2", motm:true,  latest:true },
    { id:'h3', md:9, ev:'assist',   label:'vs City Stars · MD6', minute:11, dur:24, headline:"Through-ball assist", latest:true },
    { id:'h4', md:9, ev:'key_pass', label:'vs City Stars · MD6', minute:47, dur:18, headline:"Press-break carry, then split" },
    { id:'h5', md:8, ev:'goal',     label:'vs Royal Wharf · MD8', minute:18, dur:36, headline:"Right-foot driven · 1–0" },
    { id:'h6', md:8, ev:'key_pass', label:'vs Royal Wharf · MD8', minute:54, dur:22, headline:"First-time switch to LW" },
    { id:'h7', md:7, ev:'sprint',   label:'vs Olympic Park · MD7', minute:29, dur:14, headline:"7.2 m/s recovery" },
    { id:'h8', md:7, ev:'tackle',   label:'vs Olympic Park · MD7', minute:65, dur:12, headline:"Tackle on the edge" },
    { id:'h9', md:6, ev:'assist',   label:'vs Forest H. · MD6',    minute:42, dur:20, headline:"Cut-back assist" },
    { id:'h10',md:5, ev:'key_pass', label:'vs Stratford E. · MD5', minute:16, dur:18, headline:"Pre-assist switch" },
    { id:'h11',md:4, ev:'goal',     label:'vs Beckton · MD4',      minute:71, dur:30, headline:"Consolation finish" },
    { id:'h12',md:3, ev:'sprint',   label:'vs Hayes Rovers · MD3', minute:38, dur:12, headline:"Counter-press recovery" },
  ],
  // Coach notes — chronological, newest first
  notes: [
    { date:'Mar 15', author:'Coach Sara', text:"Goal #2 arrival is the clip we keep — show it back at training. Two careless turnovers in own half disappeared once we adjusted the tempo." },
    { date:'Mar 09', author:'Coach Sara', text:"Press-resistance is sharp this month. Wants the ball in tight spaces — give him permission." },
    { date:'Feb 24', author:'Coach Sara', text:"Lower-body fatigue showed late. Cap minutes next time we play back-to-back." },
    { date:'Feb 03', author:'Coach Tom',  text:"Quiet game. Better when we play him as the #10 not the #8. Discuss role this week." },
  ],
  // IDP — Individual Development Plan
  idp: {
    lastSaved: 'Mar 11, 2025 · 18:42',
    author: 'Coach Sara',
    headline: "Become the team's first decision-maker",
    horizon: 'End of Spring season',
    goals: [
      { g:'Press-resistance in own half',  status:'on-track',  note:"Fewer turnovers when receiving with back to play. Keep the body shape." },
      { g:'Arrival timing into the box',   status:'unlocked',  note:"Tuesday's drill working — goal #2 vs City Stars is the proof." },
      { g:'Defensive transition (5 sec)',  status:'watch',     note:"Reads the moment but jogs the recovery. Talk through the trigger." },
      { g:'Right-foot crossing variety',   status:'on-track',  note:"Clipped > drilled this month. Cutback still missing." },
    ],
    ratings: { attitude: 5, effort: 5, coachability: 4, sportsmanship: 5 },
    nextReview: 'Apr 02',
  },
};

const RADAR_AXES = ['Physical', 'Positional', 'Passing', 'Dribbling', 'Control', 'Defending'];

const evMeta = {
  goal:     { letter: 'G', label: 'GOAL'      },
  assist:   { letter: 'A', label: 'ASSIST'    },
  key_pass: { letter: 'K', label: 'KEY PASS'  },
  tackle:   { letter: 'T', label: 'TACKLE'    },
  sprint:   { letter: 'S', label: 'SPRINT'    },
  save:     { letter: '★', label: 'SAVE'      },
};

// ── Reusable mini SVGs ───────────────────────────────

// Polygon radar — non-interactive. Pass 6 values (0..100) in axes order.
function PolyRadar({ values, valuesB, size=260, fill=PB.indigo, fillB=PB.indigoMute, stroke=PB.indigo, strokeB=PB.indigoMute, ringColor=PB.indigoLine, axisColor=PB.indigoMute, font=PT.mono }){
  const cx = size/2, cy = size/2, r = size/2 - 32;
  const axes = RADAR_AXES;
  const ang = (i) => (Math.PI * 2 * i) / axes.length - Math.PI/2;
  const pt  = (i, v) => [cx + Math.cos(ang(i)) * r * (v/100), cy + Math.sin(ang(i)) * r * (v/100)];
  const poly = (vs) => vs.map((v,i)=>pt(i,v).join(',')).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* concentric */}
      {[20,40,60,80,100].map((v,i)=>(
        <polygon key={i} points={poly(axes.map(()=>v))} fill="none" stroke={ringColor} strokeWidth={1} strokeDasharray={i===4?'':'2 3'} />
      ))}
      {/* spokes */}
      {axes.map((a,i)=>{
        const [x,y] = pt(i,100);
        return <line key={a} x1={cx} y1={cy} x2={x} y2={y} stroke={ringColor} strokeWidth={1} />;
      })}
      {/* season (background) */}
      {valuesB && (
        <polygon points={poly(axes.map(a=>valuesB[a]))} fill={fillB} fillOpacity={0.18} stroke={strokeB} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 3" />
      )}
      {/* main */}
      <polygon points={poly(axes.map(a=>values[a]))} fill={fill} fillOpacity={0.22} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      {axes.map(a => values[a]).map((v,i)=>{
        const [x,y] = pt(i,v);
        return <circle key={i} cx={x} cy={y} r={3} fill={stroke} />;
      })}
      {/* labels */}
      {axes.map((a,i)=>{
        const [x,y] = pt(i, 116);
        return (
          <text key={a} x={x} y={y} fill={axisColor} fontFamily={font} fontSize={9.5} textAnchor="middle" dominantBaseline="middle" style={{letterSpacing:'0.16em'}}>{a.toUpperCase()}</text>
        );
      })}
    </svg>
  );
}

// Simple area-line chart: pts is array of {x: index, y: 0..100}
function MiniSeasonLine({ data, w=560, h=180, accent=PB.indigo, fill='rgba(27,21,80,0.08)', highlightLast=true, font=PT.mono, padX=18, padY=18 }){
  const innerW = w - padX*2, innerH = h - padY*2;
  const xs = data.map((_,i)=> padX + (innerW * i)/(data.length-1));
  const ys = data.map(d => padY + innerH - (innerH * d.score / 100));
  const path = xs.map((x,i)=>`${i===0?'M':'L'} ${x} ${ys[i]}`).join(' ');
  const areaPath = `${path} L ${xs[xs.length-1]} ${padY+innerH} L ${xs[0]} ${padY+innerH} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {/* baseline thresholds */}
      {[60, 80].map(t => {
        const y = padY + innerH - (innerH * t / 100);
        return <line key={t} x1={padX} x2={w-padX} y1={y} y2={y} stroke={PB.indigoLine} strokeDasharray="2 4" strokeWidth={1} />;
      })}
      <path d={areaPath} fill={fill} />
      <path d={path} stroke={accent} strokeWidth={2} fill="none" />
      {data.map((d,i)=>{
        const isLast = highlightLast && i === data.length-1;
        return (
          <g key={i}>
            <circle cx={xs[i]} cy={ys[i]} r={isLast ? 5.5 : 3} fill={isLast ? PB.yellow : accent} stroke={isLast ? PB.indigo : 'transparent'} strokeWidth={isLast ? 2 : 0} />
            {isLast && (
              <text x={xs[i]} y={ys[i]-12} fontFamily={font} fontSize={9.5} fill={PB.indigo} textAnchor="middle" style={{letterSpacing:'0.18em', fontWeight:700}}>{d.score}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Vertical pitch heatmap. cells: [{x,y,w}] in 0..1.
function PitchHeatmap({ cells, w=220, h=320, surface=PB.paper, line=PB.indigo, hot=PB.yellow, ink=PB.indigo, label="" }){
  // Draw radial-gradient discs per cell.
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
      <defs>
        <radialGradient id="hotDisc" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor={hot} stopOpacity="0.85" />
          <stop offset="60%" stopColor={hot} stopOpacity="0.32" />
          <stop offset="100%" stopColor={hot} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} fill={surface} />
      {/* pitch markings */}
      <g fill="none" stroke={line} strokeOpacity="0.55" strokeWidth="1.2">
        <rect x={6} y={6} width={w-12} height={h-12} rx={2} />
        <line x1={6} y1={h/2} x2={w-6} y2={h/2} />
        <circle cx={w/2} cy={h/2} r={Math.min(w,h)/9} />
        {/* boxes */}
        <rect x={w*0.22} y={6} width={w*0.56} height={h*0.16} />
        <rect x={w*0.36} y={6} width={w*0.28} height={h*0.07} />
        <rect x={w*0.22} y={h*0.84-6} width={w*0.56} height={h*0.16} />
        <rect x={w*0.36} y={h*0.93-6} width={w*0.28} height={h*0.07} />
      </g>
      {/* heat */}
      {cells.map((c, i) => {
        const cx = c.x * (w-12) + 6;
        const cy = (1 - c.y) * (h-12) + 6;
        const rr = 26 + c.w * 22;
        return <circle key={i} cx={cx} cy={cy} r={rr} fill="url(#hotDisc)" />;
      })}
      {label && (
        <text x={w/2} y={h-12} fontFamily={PT.mono} fontSize={9.5} fill={ink} textAnchor="middle" style={{letterSpacing:'0.2em', fontWeight:700, opacity:0.7}}>{label}</text>
      )}
    </svg>
  );
}

// Circular score arc. value 0..100.
function ScoreArc({ value, size=120, stroke=10, color, ring=PB.indigoSoft, font=PT.display, label, sub, textColor }){
  const r = size/2 - stroke;
  const c = 2 * Math.PI * r;
  const off = c - (c * value)/100;
  const arcColor = color || (value >= 80 ? PB.yellow : value >= 60 ? PB.indigo : PB.coral);
  const tColor = textColor || PB.indigo;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={arcColor} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} fontFamily={font} fontSize={size*0.36} fill={tColor} textAnchor="middle" dominantBaseline="middle" style={{letterSpacing:'-0.02em'}}>{value}</text>
      {sub && (
        <text x={size/2} y={size/2 + size*0.24} fontFamily={PT.mono} fontSize={size*0.085} fill={PB.indigoMute} textAnchor="middle" style={{letterSpacing:'0.18em'}}>{sub}</text>
      )}
    </svg>
  );
}

// Player avatar — geometric placeholder (no real photo). Position-aware accent.
function PlayerGlyph({ size=140, num, name, ringColor=PB.indigo, motm=false }){
  const initials = name.split(' ').map(s=>s[0]).slice(0,2).join('');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={PB.indigoMid} />
          <stop offset="100%" stopColor={PB.indigo} />
        </linearGradient>
      </defs>
      {motm && <circle cx={size/2} cy={size/2} r={size/2-2} fill="none" stroke={PB.yellow} strokeWidth={3} strokeDasharray="4 4" />}
      <circle cx={size/2} cy={size/2} r={size/2-8} fill="url(#avatarBg)" />
      <text x={size/2} y={size/2 - size*0.06} fontFamily={PT.display} fontSize={size*0.32} fill={PB.sand} textAnchor="middle" dominantBaseline="middle" style={{letterSpacing:'-0.02em'}}>{initials}</text>
      <text x={size/2} y={size/2 + size*0.20} fontFamily={PT.mono} fontSize={size*0.10} fill={PB.yellow} textAnchor="middle" style={{letterSpacing:'0.22em'}}>#{num}</text>
    </svg>
  );
}

Object.assign(window, {
  PB, PT, PLAYER, RADAR_AXES, evMeta,
  PolyRadar, MiniSeasonLine, PitchHeatmap, ScoreArc, PlayerGlyph,
});
