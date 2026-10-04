import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LifeStateSchema, type LifeState } from "@/lib/life/schema";
type Store = { world: LifeState | null; save: (world: LifeState) => void };
export const useLife = create<Store>()(
  persist(
    (set) => ({
      world: null,
      save: (world) => set({ world: LifeStateSchema.parse(world) }),
    }),
    { name: "third-wheel-life-v1", partialize: (s) => ({ world: s.world }) },
  ),
);
