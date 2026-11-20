import { DEFAULT_PLAYBACK_SPEED } from "@/features/designer/lib/animation-timing";
import { DEFAULT_NEW_PLAY_COURT_VIEW } from "@/features/designer/lib/court-view-settings";
import type {
  DesignerAction,
  DesignerFrame,
  DesignerObject,
} from "@/features/designer/model/designer";
import type { StoredPlay } from "@/features/library/model/library";

export const PLAYBANK_SOURCE_PREFIX = "pb_";

type Spot = { n: number; x: number; y: number; ball?: boolean };

export type PlayBankCategory =
  | "Half-court"
  | "ATO"
  | "BLOB"
  | "SLOB"
  | "Press break";

export interface PlayBankEntry {
  catalogId: string;
  title: string;
  category: PlayBankCategory;
  summary: string;
  tags: string[];
  offense: Spot[];
  defense: Spot[];
  actions?: Array<{
    type: DesignerAction["type"];
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
}

function offenseObj(spot: Spot): DesignerObject {
  return {
    id: `o${spot.n}`,
    kind: "offense",
    x: spot.x,
    y: spot.y,
    label: String(spot.n),
    hasBall: Boolean(spot.ball),
  };
}

function defenseObj(spot: Spot): DesignerObject {
  return {
    id: `d${spot.n}`,
    kind: "defense",
    x: spot.x,
    y: spot.y,
    label: String(spot.n),
    defenseStyle: "mark",
  };
}

function buildFrame(entry: PlayBankEntry): DesignerFrame {
  const objects = [
    ...entry.offense.map(offenseObj),
    ...entry.defense.map(defenseObj),
  ];
  const actions: DesignerAction[] = (entry.actions ?? []).map((action, index) => ({
    id: `a${index + 1}`,
    type: action.type,
    x1: action.x1,
    y1: action.y1,
    x2: action.x2,
    y2: action.y2,
  }));
  return {
    id: `${entry.catalogId}-f1`,
    name: "Frame 1",
    objects,
    actions,
    actionSequence: actions.map((action) => action.id),
  };
}

export function playbankLibraryId(catalogId: string) {
  return `${PLAYBANK_SOURCE_PREFIX}${catalogId}`;
}

export function isPlaybankLibraryId(playId: string) {
  return playId.startsWith(PLAYBANK_SOURCE_PREFIX);
}

export function playbankEntryToStoredPlay(entry: PlayBankEntry): StoredPlay {
  const now = new Date().toISOString();
  return {
    id: playbankLibraryId(entry.catalogId),
    title: entry.title,
    courtType: "half",
    courtView: { ...DEFAULT_NEW_PLAY_COURT_VIEW },
    frames: [buildFrame(entry)],
    animSpeed: DEFAULT_PLAYBACK_SPEED,
    animPauseMs: 800,
    type: "play",
    season: "PlayBank",
    team: "FastCourt Catalog",
    series: entry.category,
    tags: ["playbank", ...entry.tags],
    playNotes: entry.summary,
    favorite: false,
    createdAt: now,
    updatedAt: now,
    source: "manual",
  };
}

export const PLAYBANK_CATALOG: PlayBankEntry[] = [
  {
    catalogId: "horns_flare",
    title: "Horns Flare",
    category: "Half-court",
    summary: "Horns entry — 5 ballscreens, 4 flares weak. Read reject vs ICE.",
    tags: ["horns", "flare", "half-court"],
    offense: [
      { n: 1, x: 0.5, y: 0.72, ball: true },
      { n: 4, x: 0.38, y: 0.42 },
      { n: 5, x: 0.62, y: 0.42 },
      { n: 2, x: 0.12, y: 0.28 },
      { n: 3, x: 0.88, y: 0.28 },
    ],
    defense: [
      { n: 1, x: 0.5, y: 0.62 },
      { n: 4, x: 0.38, y: 0.34 },
      { n: 5, x: 0.62, y: 0.34 },
      { n: 2, x: 0.16, y: 0.3 },
      { n: 3, x: 0.84, y: 0.3 },
    ],
    actions: [
      { type: "screen", x1: 0.62, y1: 0.42, x2: 0.52, y2: 0.68 },
      { type: "cut", x1: 0.88, y1: 0.28, x2: 0.72, y2: 0.18 },
    ],
  },
  {
    catalogId: "side_pnr_get",
    title: "Side PNR Get",
    category: "Half-court",
    summary: "Wing get, side ballscreen. 3 fills corner, 4 lifts for throwback.",
    tags: ["pnr", "side", "get"],
    offense: [
      { n: 1, x: 0.78, y: 0.58, ball: true },
      { n: 5, x: 0.68, y: 0.46 },
      { n: 2, x: 0.9, y: 0.18 },
      { n: 3, x: 0.18, y: 0.52 },
      { n: 4, x: 0.22, y: 0.22 },
    ],
    defense: [
      { n: 1, x: 0.72, y: 0.52 },
      { n: 5, x: 0.6, y: 0.4 },
      { n: 2, x: 0.86, y: 0.22 },
      { n: 3, x: 0.24, y: 0.5 },
      { n: 4, x: 0.26, y: 0.26 },
    ],
    actions: [
      { type: "screen", x1: 0.68, y1: 0.46, x2: 0.76, y2: 0.55 },
      { type: "dribble", x1: 0.78, y1: 0.58, x2: 0.86, y2: 0.4 },
    ],
  },
  {
    catalogId: "spain_pnr",
    title: "Spain PNR",
    category: "Half-court",
    summary: "Backscreener 4 on the roller’s man after the ballscreen.",
    tags: ["spain", "pnr"],
    offense: [
      { n: 1, x: 0.5, y: 0.7, ball: true },
      { n: 5, x: 0.5, y: 0.48 },
      { n: 4, x: 0.5, y: 0.28 },
      { n: 2, x: 0.12, y: 0.42 },
      { n: 3, x: 0.88, y: 0.42 },
    ],
    defense: [
      { n: 1, x: 0.5, y: 0.6 },
      { n: 5, x: 0.5, y: 0.4 },
      { n: 4, x: 0.5, y: 0.22 },
      { n: 2, x: 0.16, y: 0.42 },
      { n: 3, x: 0.84, y: 0.42 },
    ],
    actions: [
      { type: "screen", x1: 0.5, y1: 0.48, x2: 0.5, y2: 0.66 },
      { type: "screen", x1: 0.5, y1: 0.28, x2: 0.5, y2: 0.4 },
    ],
  },
  {
    catalogId: "floppy",
    title: "Floppy",
    category: "Half-court",
    summary: "Double staggered off the block for the shooter. 1 exits opposite.",
    tags: ["floppy", "shooter"],
    offense: [
      { n: 2, x: 0.5, y: 0.16 },
      { n: 4, x: 0.38, y: 0.2 },
      { n: 5, x: 0.62, y: 0.2 },
      { n: 1, x: 0.5, y: 0.68, ball: true },
      { n: 3, x: 0.88, y: 0.5 },
    ],
    defense: [
      { n: 2, x: 0.5, y: 0.24 },
      { n: 4, x: 0.36, y: 0.26 },
      { n: 5, x: 0.64, y: 0.26 },
      { n: 1, x: 0.5, y: 0.58 },
      { n: 3, x: 0.84, y: 0.48 },
    ],
    actions: [{ type: "cut", x1: 0.5, y1: 0.16, x2: 0.18, y2: 0.28 }],
  },
  {
    catalogId: "ato_hammer",
    title: "ATO Hammer",
    category: "ATO",
    summary: "After timeout — hammer screen weak as 1 rejects the ballscreen.",
    tags: ["ato", "hammer"],
    offense: [
      { n: 1, x: 0.7, y: 0.62, ball: true },
      { n: 5, x: 0.62, y: 0.48 },
      { n: 4, x: 0.22, y: 0.22 },
      { n: 2, x: 0.12, y: 0.48 },
      { n: 3, x: 0.88, y: 0.22 },
    ],
    defense: [
      { n: 1, x: 0.66, y: 0.54 },
      { n: 5, x: 0.56, y: 0.4 },
      { n: 4, x: 0.26, y: 0.26 },
      { n: 2, x: 0.18, y: 0.46 },
      { n: 3, x: 0.84, y: 0.26 },
    ],
    actions: [
      { type: "screen", x1: 0.22, y1: 0.22, x2: 0.16, y2: 0.42 },
      { type: "dribble", x1: 0.7, y1: 0.62, x2: 0.82, y2: 0.46 },
    ],
  },
  {
    catalogId: "blob_stack",
    title: "BLOB Stack",
    category: "BLOB",
    summary: "Baseline stack — 4 screens first, 2 pops, 5 dives if denied.",
    tags: ["blob", "stack"],
    offense: [
      { n: 1, x: 0.5, y: 0.08, ball: true },
      { n: 4, x: 0.5, y: 0.22 },
      { n: 2, x: 0.5, y: 0.32 },
      { n: 5, x: 0.5, y: 0.42 },
      { n: 3, x: 0.5, y: 0.52 },
    ],
    defense: [
      { n: 1, x: 0.5, y: 0.16 },
      { n: 4, x: 0.42, y: 0.26 },
      { n: 2, x: 0.58, y: 0.34 },
      { n: 5, x: 0.42, y: 0.44 },
      { n: 3, x: 0.58, y: 0.54 },
    ],
    actions: [{ type: "cut", x1: 0.5, y1: 0.32, x2: 0.18, y2: 0.28 }],
  },
  {
    catalogId: "slob_zipper",
    title: "SLOB Zipper",
    category: "SLOB",
    summary: "Sideline zipper for 2, then DHO into side PNR.",
    tags: ["slob", "zipper", "dho"],
    offense: [
      { n: 1, x: 0.08, y: 0.55, ball: true },
      { n: 2, x: 0.22, y: 0.18 },
      { n: 4, x: 0.22, y: 0.32 },
      { n: 5, x: 0.42, y: 0.42 },
      { n: 3, x: 0.86, y: 0.28 },
    ],
    defense: [
      { n: 1, x: 0.16, y: 0.52 },
      { n: 2, x: 0.28, y: 0.22 },
      { n: 4, x: 0.28, y: 0.34 },
      { n: 5, x: 0.46, y: 0.38 },
      { n: 3, x: 0.82, y: 0.3 },
    ],
    actions: [
      { type: "cut", x1: 0.22, y1: 0.18, x2: 0.22, y2: 0.55 },
      { type: "handoff", x1: 0.08, y1: 0.55, x2: 0.22, y2: 0.55 },
    ],
  },
  {
    catalogId: "press_break_diamond",
    title: "Press Break Diamond",
    category: "Press break",
    summary: "1 in the middle, 2/3 wide, 4 safety. Attack the trap sideline.",
    tags: ["press", "diamond"],
    offense: [
      { n: 4, x: 0.5, y: 0.12, ball: true },
      { n: 1, x: 0.5, y: 0.4 },
      { n: 2, x: 0.12, y: 0.38 },
      { n: 3, x: 0.88, y: 0.38 },
      { n: 5, x: 0.5, y: 0.72 },
    ],
    defense: [
      { n: 4, x: 0.5, y: 0.2 },
      { n: 1, x: 0.5, y: 0.48 },
      { n: 2, x: 0.2, y: 0.4 },
      { n: 3, x: 0.8, y: 0.4 },
      { n: 5, x: 0.5, y: 0.64 },
    ],
    actions: [{ type: "pass", x1: 0.5, y1: 0.12, x2: 0.5, y2: 0.4 }],
  },
];
