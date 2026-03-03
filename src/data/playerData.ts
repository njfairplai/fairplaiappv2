export const player = {
  name: "Kiyan Makkawi",
  firstName: "Kiyan",
  lastName: "Makkawi",
  initials: "KM",
  age: 12,
  jerseyNumber: 7,
  position: "Central Midfielder",
  team: "U12 Red",
  academy: "MAK Academy",
  compositeScore: 81,
};

export const currentMatch = {
  opponent: "Al Wasl Academy",
  date: "Feb 24 2026",
  dateShort: "Feb 24",
  result: "Played",
  score: 81,
};

export const highlights = [
  {
    id: 1,
    title: "Goal",
    subtitle: "34th minute",
    duration: "0:12",
    label: "⚽ Goal",
    eventType: "⚽ Goal",
    minute: "34'",
    color: "#22c55e",
  },
  {
    id: 2,
    title: "Key Pass",
    subtitle: "67th minute",
    duration: "0:08",
    label: "🎯 Key Pass",
    eventType: "🎯 Key Pass",
    minute: "67'",
    color: "#4A4AFF",
  },
  {
    id: 3,
    title: "Sprint Recovery",
    subtitle: "78th minute",
    duration: "0:15",
    label: "⚡ Sprint Recovery",
    eventType: "⚡ Sprint Recovery",
    minute: "78'",
    color: "#9333ea",
  },
];

export const matchStats = {
  distance: { value: "7.4 km", seasonAvg: "6.8 km", trend: "up" },
  topSpeed: { value: "27.3 km/h", seasonAvg: "25.1 km/h", trend: "up" },
  sprints: { value: "14 sprints", seasonAvg: "11", trend: "up" },
};

export const radarData = [
  { category: "Physical",   score: 82, avg: 76 },
  { category: "Positional", score: 74, avg: 70 },
  { category: "Passing",    score: 68, avg: 65 },
  { category: "Dribbling",  score: 71, avg: 68 },
  { category: "Control",    score: 65, avg: 62 },
  { category: "Defending",  score: 70, avg: 67 },
];

export const seasonProgressData = [
  { match: "Jan 6",  score: 65 },
  { match: "Jan 13", score: 69 },
  { match: "Jan 20", score: 72 },
  { match: "Jan 27", score: 68 },
  { match: "Feb 3",  score: 75 },
  { match: "Feb 10", score: 71 },
  { match: "Feb 17", score: 78 },
  { match: "Feb 24", score: 81 },
];

export const categoryGrades = [
  {
    category: "Physical",
    grade: "A",
    gradeColor: "#27AE60",
    label: "Elite",
    score: 82,
    subMetrics: ["7.4km", "27.3 km/h top", "14 sprints"],
  },
  {
    category: "Passing",
    grade: "B",
    gradeColor: "#4A4AFF",
    label: "Good",
    score: 68,
    subMetrics: ["73% completion", "4 key passes", "6 progressive"],
  },
  {
    category: "Dribbling",
    grade: "B",
    gradeColor: "#4A4AFF",
    label: "Good",
    score: 71,
    subMetrics: ["68% success", "12 attempts", "84m carried"],
  },
  {
    category: "Control",
    grade: "B-",
    gradeColor: "#4A4AFF",
    label: "Above Average",
    score: 65,
    subMetrics: ["71% retention", "34 touches", "8 tight space"],
  },
  {
    category: "Defending",
    grade: "B",
    gradeColor: "#4A4AFF",
    label: "Good",
    score: 70,
    subMetrics: ["6 duels won", "3 interceptions", "9 pressing"],
  },
  {
    category: "Impact",
    grade: "A-",
    gradeColor: "#27AE60",
    label: "Excellent",
    score: 87,
    subMetrics: ["1 goal", "2 assists", "3 chances created"],
  },
];

export const percentileData = [
  { metric: "Sprint Speed", percentile: 84, topPct: "Top 16%" },
  { metric: "Distance Covered", percentile: 79, topPct: "Top 21%" },
  { metric: "Pass Completion", percentile: 61, topPct: "Top 39%" },
  { metric: "Dribble Success", percentile: 67, topPct: "Top 33%" },
  { metric: "Defensive Actions", percentile: 55, topPct: "Top 45%" },
  { metric: "Goals + Assists", percentile: 88, topPct: "Top 12%" },
];

export type MatchRecord = {
  id: number;
  day: number;
  month: string;
  opponent: string;
  competition: string;
  duration: string;
  score: number;
  tier: "green" | "amber" | "red";
};

export const matchHistory: MatchRecord[] = [
  { id: 1, day: 24, month: "Feb", opponent: "Al Wasl Academy", competition: "UAE Youth League", duration: "90min", score: 81, tier: "green" },
  { id: 2, day: 17, month: "Feb", opponent: "Al Ain FC",         competition: "UAE Youth League", duration: "90min", score: 78, tier: "green" },
  { id: 3, day: 10, month: "Feb", opponent: "Shabab Al Ahli",    competition: "Friendly",         duration: "85min", score: 71, tier: "amber" },
  { id: 4, day: 3,  month: "Feb", opponent: "Dubai SC",          competition: "UAE Youth League", duration: "90min", score: 75, tier: "green" },
  { id: 5, day: 27, month: "Jan", opponent: "Sharjah FC",        competition: "UAE Youth League", duration: "80min", score: 68, tier: "amber" },
  { id: 6, day: 20, month: "Jan", opponent: "Ajman FC",          competition: "Cup",              duration: "90min", score: 72, tier: "amber" },
  { id: 7, day: 13, month: "Jan", opponent: "Al Jazira",         competition: "UAE Youth League", duration: "90min", score: 69, tier: "amber" },
  { id: 8, day: 6,  month: "Jan", opponent: "Baniyas SC",        competition: "Friendly",         duration: "75min", score: 65, tier: "red" },
];
