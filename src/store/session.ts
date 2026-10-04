import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Persona, DateRecord } from "@/lib/persona/schema";
type Session = {
  people: Persona[];
  dates: DateRecord[];
  addPerson: (person: Persona) => boolean;
  addDate: (date: DateRecord) => void;
  removePerson: (id: string) => void;
  clear: () => void;
};
export const useSession = create<Session>()(
  persist(
    (set, get) => ({
      people: [],
      dates: [],
      addPerson: (person) => {
        if (
          get().people.some(
            (p) =>
              p.sources.linkedinUrl === person.sources.linkedinUrl ||
              p.sources.instagramUrl === person.sources.instagramUrl,
          )
        )
          return false;
        set((s) => ({ people: [...s.people, person] }));
        return true;
      },
      addDate: (date) =>
        set((s) => ({
          dates: [...s.dates.filter((d) => d.id !== date.id), date],
        })),
      removePerson: (id) =>
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          dates: s.dates.filter((d) => !d.participantIds.includes(id)),
        })),
      clear: () => set({ people: [], dates: [] }),
    }),
    {
      name: "third-wheel-session-v1",
      version: 1,
      partialize: (s) => ({ people: s.people, dates: s.dates }),
    },
  ),
);
