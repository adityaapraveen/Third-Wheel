import data from "@/data/demo.generated.json";
import type { DemoData } from "./persona/schema";
export const demo = data as unknown as DemoData;
export const findPerson = (id: string) => demo.people.find((p) => p.id === id);
export const findDate = (id: string) => demo.dates.find((d) => d.id === id);
