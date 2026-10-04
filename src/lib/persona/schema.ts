import { z } from "zod";
export const dimensions = [
  "socialEnergy",
  "spontaneity",
  "ambitionPace",
  "curiosity",
  "routinePreference",
  "adventurePreference",
] as const;
export const dimensionLabels: Record<Dimension, string> = {
  socialEnergy: "Social energy",
  spontaneity: "Spontaneity",
  ambitionPace: "Ambition pace",
  curiosity: "Curiosity",
  routinePreference: "Routine",
  adventurePreference: "Adventure",
};
export type Dimension = (typeof dimensions)[number];
const score = z.number().min(0).max(100);
export const SignalSchema = z.object({
  label: z.string().min(1).max(160),
  confidence: score,
  evidenceIds: z.array(z.string()).min(1).max(8),
});
export const EvidenceSchema = z.object({
  id: z.string().max(80),
  source: z.enum(["linkedin", "instagram"]),
  text: z.string().max(260),
  context: z.string().max(120),
});
export const PersonaSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  headline: z.string().max(200),
  avatarUrl: z.string().max(2000),
  fictional: z.boolean(),
  analysisMode: z.enum(["model", "fallback", "fixture"]),
  sources: z.object({
    linkedinUrl: z.string().max(400),
    instagramUrl: z.string().max(400),
  }),
  identityConfidence: score,
  identitySignals: z.array(z.string().max(180)).max(12),
  needs: z.array(SignalSchema).max(8),
  hobbies: z.array(SignalSchema).max(8),
  interests: z.array(SignalSchema).max(8),
  values: z.array(SignalSchema).max(8),
  conversationHooks: z.array(SignalSchema).max(8),
  socialRhythm: z.string().max(300),
  communicationStyle: z.string().max(300),
  datingRead: z.object({
    socialEnergy: score,
    spontaneity: score,
    ambitionPace: score,
    curiosity: score,
    routinePreference: score,
    adventurePreference: score,
  }),
  matchPreferences: z.object({
    traits: z
      .array(
        z.object({
          dimension: z.enum(dimensions),
          desiredValue: score,
          importance: z.number().min(0).max(1),
        }),
      )
      .max(6),
    origin: z.enum(["self-reported", "fictional", "neutral"]),
  }),
  agent: z.object({
    openingStyle: z.string().max(200),
    conversationStyle: z.string().max(200),
    likelyGoodTopics: z.array(z.string().max(100)).max(8),
    dateEnergy: z.string().max(100),
  }),
  oneLineRead: z.string().max(250),
  twoHourTopic: z.string().max(200),
  idealLowPressureDate: z.string().max(250),
  confidence: z.object({ overall: score, linkedin: score, instagram: score }),
  evidence: z.array(EvidenceSchema).max(32),
});
export type Persona = z.infer<typeof PersonaSchema>;
export type Signal = z.infer<typeof SignalSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Message = {
  agentId: string;
  message: string;
  publicConfessional: string;
  engagementDelta: number;
};
export type Outcome = {
  agentId: string;
  candidateId: string;
  score: number;
  wantsAnotherDate: boolean;
  summary: string;
};
export type DateRecord = {
  id: string;
  participantIds: [string, string];
  round: number;
  curveball: string;
  messages: Message[];
  outcomes: Outcome[];
  mode: "model" | "fallback" | "fixture";
  createdAt: string;
};
export type Ranking = {
  candidateId: string;
  rank: number;
  compatibilityScore: number;
  dateScore: number | null;
  finalScore: number;
  confidence: number;
  why: string;
  friction: string;
  sharedThreads: string[];
  dateId: string | null;
};
export type DemoData = {
  version: number;
  disclosure: string;
  people: Persona[];
  dates: DateRecord[];
  rankings: Record<string, Ranking[]>;
};
export type DateEvent = {
  type:
    | "date_started"
    | "agent_thinking"
    | "agent_message"
    | "curveball"
    | "confessional"
    | "chemistry_update"
    | "date_finished"
    | "error";
  agentId?: string;
  message?: Message;
  text?: string;
  value?: number;
  date?: DateRecord;
};
