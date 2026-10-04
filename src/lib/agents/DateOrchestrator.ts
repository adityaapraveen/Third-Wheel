import { DatingAgent } from "./DatingAgent";
import { curveballFor } from "../matching/roundRobin";
import type { Persona, DateRecord, DateEvent } from "../persona/schema";
export class DateOrchestrator {
  constructor(
    readonly a: Persona,
    readonly b: Persona,
  ) {}
  async run(
    emit: (event: DateEvent) => void,
    signal?: AbortSignal,
  ): Promise<DateRecord> {
    const agents = [new DatingAgent(this.a), new DatingAgent(this.b)];
    const date: DateRecord = {
      id: `live-${crypto.randomUUID()}`,
      participantIds: [this.a.id, this.b.id],
      round: 0,
      curveball: curveballFor(this.a.id, this.b.id),
      messages: [],
      outcomes: [],
      mode: "model",
      createdAt: new Date().toISOString(),
    };
    emit({ type: "date_started", text: date.id, date });
    let chemistry = 48;
    for (let turn = 0; turn < 6; turn++) {
      if (signal?.aborted) throw new Error("Date cancelled");
      if (turn === 3) emit({ type: "curveball", text: date.curveball });
      const agent = agents[turn % 2],
        other = agents[(turn + 1) % 2];
      emit({ type: "agent_thinking", agentId: agent.persona.id });
      const message = await agent.respond(
        other.persona,
        date.messages,
        turn >= 3 ? date.curveball : null,
        turn,
      );
      date.messages.push(message);
      emit({ type: "agent_message", agentId: agent.persona.id, message });
      chemistry = Math.min(
        100,
        Math.max(0, chemistry + message.engagementDelta),
      );
      emit({ type: "chemistry_update", value: chemistry });
      if (turn === 2 || turn === 5)
        emit({
          type: "confessional",
          agentId: agent.persona.id,
          text: message.publicConfessional,
        });
    }
    for (const agent of agents) agent.memory = [...date.messages];
    for (let i = 0; i < 2; i++) {
      if (signal?.aborted) throw new Error("Date cancelled");
      date.outcomes.push(await agents[i].reflect(agents[1 - i].persona));
    }
    if (agents.some((a) => a.usedFallback)) date.mode = "fallback";
    emit({ type: "date_finished", date });
    return date;
  }
}
