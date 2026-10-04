import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PersonaSchema } from "@/lib/persona/schema";
import { DateOrchestrator } from "@/lib/agents/DateOrchestrator";
import { guard, limitedJSON, eventResponse } from "@/lib/server";
const Input = z.object({
  a: PersonaSchema,
  b: PersonaSchema,
  accessCode: z.string().max(200).optional(),
});
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(req: NextRequest) {
  try {
    const { a, b, accessCode } = Input.parse(await limitedJSON(req));
    guard(req, "date", 3, accessCode);
    if (a.id === b.id) throw new Error("Choose two different agents.");
    return eventResponse(async (send) => {
      await new DateOrchestrator(a, b).run(send, req.signal);
    }, req.signal);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid date request",
      },
      { status: 400 },
    );
  }
}
