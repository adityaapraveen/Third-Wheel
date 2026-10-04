import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { LifeStateSchema } from "@/lib/life/schema";
import { stepLife } from "@/lib/life/engine";
import { guard, limitedJSON } from "@/lib/server";
export const runtime = "nodejs";
export const maxDuration = 120;
const Input = z.object({
  state: LifeStateSchema,
  accessCode: z.string().max(200).optional(),
});
export async function POST(req: NextRequest) {
  try {
    const { state, accessCode } = Input.parse(await limitedJSON(req, 160000));
    guard(req, "life", 8, accessCode);
    if (state.participants[0].id === state.participants[1].id)
      throw new Error("Choose two different agents.");
    const next = await stepLife(state, req.signal);
    return NextResponse.json({ state: next });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not advance the simulation.",
      },
      { status: 400 },
    );
  }
}
