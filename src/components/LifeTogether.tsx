"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Play,
  Pause,
  SkipForward,
  Home,
  Clock,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { demo } from "@/lib/demo";
import { useSession } from "@/store/session";
import { useLife } from "@/store/life";
import {
  LifeStateSchema,
  startLife,
  clock,
  type LifeState,
} from "@/lib/life/schema";
import { Avatar } from "./Avatar";
import { HouseholdWorld } from "./HouseholdWorld";
import { stepDemoLife } from "@/lib/life/tasks";
export function LifeTogether() {
  const params = useSearchParams(),
    { world, save } = useLife(),
    session = useSession();
  const [ready, setReady] = useState(false),
    [running, setRunning] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [accessCode, setAccessCode] = useState(""),
    [aId, setAId] = useState(""),
    [bId, setBId] = useState(""),
    [budget, setBudget] = useState(12),
    [mode, setMode] = useState<"demo" | "model">("demo"),
    [steps, setSteps] = useState(0);
  const controller = useRef<AbortController | null>(null),
    active = useRef(false),
    inflight = useRef(false),
    mounted = useRef(true);
  const people =
    params.get("source") === "lab" && session.people.length >= 2
      ? session.people
      : demo.people;
  const a = people.find((p) => p.id === (aId || params.get("a"))) || people[0],
    b =
      people.find((p) => p.id === (bId || params.get("b")) && p.id !== a.id) ||
      people.find((p) => p.id !== a.id)!;
  useEffect(() => {
    setReady(true);
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current = false;
      controller.current?.abort();
    };
  }, []);
  function pause() {
    active.current = false;
    setRunning(false);
    controller.current?.abort();
  }
  function create() {
    pause();
    save(
      startLife(
        a,
        b,
        session.dates
          .slice()
          .reverse()
          .find(
            (d) =>
              d.participantIds.includes(a.id) &&
              d.participantIds.includes(b.id),
          ) ||
          demo.dates.find(
            (d) =>
              d.participantIds.includes(a.id) &&
              d.participantIds.includes(b.id),
          ),
      ),
    );
    setError("");
    setSteps(0);
  }
  async function step() {
    if (inflight.current || !useLife.getState().world) return;
    inflight.current = true;
    setBusy(true);
    setError("");
    const before = useLife.getState().world!;
    controller.current = new AbortController();
    try {
      if (mode === "demo") {
        save(stepDemoLife(before));
        setSteps((s) => s + 1);
        return;
      }
      const res = await fetch("/api/life/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: before, accessCode }),
        signal: controller.current.signal,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Simulation step failed.");
      const next = LifeStateSchema.parse(result.state);
      if (controller.current.signal.aborted || !mounted.current) return;
      if (
        useLife.getState().world?.id === before.id &&
        useLife.getState().world?.revision === before.revision
      ) {
        save(next);
        setSteps((s) => s + 1);
      }
    } catch (e) {
      if (mounted.current && e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
        active.current = false;
        setRunning(false);
      }
    } finally {
      inflight.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  // Each request advances one bounded step. No long-running serverless loop.
  useEffect(() => {
    if (!running || !world || busy) return;
    if (budget > 0 && steps >= budget) {
      active.current = false;
      setRunning(false);
      return;
    }
    const timer = setTimeout(
      () => {
        if (active.current) void step();
      },
      mode === "demo" ? 8000 : 9000,
    );
    return () => clearTimeout(timer);
  }, [running, world?.revision, busy, steps, budget, mode]);
  function resume() {
    if (!world) return;
    setSteps(0);
    active.current = true;
    setRunning(true);
  }
  if (!ready)
    return (
      <div className="page-wrap empty-state">Opening the shared home…</div>
    );
  const time = clock(world?.tick || 0);
  return (
    <div className="page-wrap life-page">
      <div className="section-top">
        <div>
          <span className="eyebrow pink">
            <Home size={15} /> THE EXPERIMENT / AFTER THE FIRST DATE
          </span>
          <h1>
            Life <span className="serif lime">together.</span>
          </h1>
          <p className="muted">
            A cozy block world. Little tasks. A life beyond the chat.
          </p>
        </div>
        <span className="source-pill">FICTIONAL SHARED HOUSEHOLD</span>
      </div>
      <div className="life-notice">
        This invents a shared life for two characters. Their relationship, home,
        friends, work events and disagreements are fictional—not facts about, or
        predictions of, real people.
      </div>
      <div className="life-layout">
        <aside className="panel life-controls">
          <span className="eyebrow">CAST THE HOUSEHOLD</span>
          <label>
            Playback mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "demo" | "model")}
              disabled={running || busy}
            >
              <option value="demo">
                Cute world demo · offline &amp; instant
              </option>
              <option value="model">Model conversations · uses API</option>
            </select>
          </label>
          <label>
            Agent A
            <select
              value={a.id}
              onChange={(e) => setAId(e.target.value)}
              disabled={running || busy}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Agent B
            <select
              value={b.id}
              onChange={(e) => setBId(e.target.value)}
              disabled={running || busy}
            >
              {people
                .filter((p) => p.id !== a.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <button
            className="button secondary full"
            disabled={busy}
            onClick={create}
          >
            <RotateCcw size={15} />
            {world ? "Begin a new fictional life" : "Create shared household"}
          </button>
          <label>
            Steps per run
            <select
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              disabled={running}
            >
              {[0, 6, 12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n === 0
                    ? `Until paused${mode === "model" ? " · ongoing model usage" : " · continuous demo"}`
                    : `${n} steps · ${n / 6} simulated days`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lab access code, if configured
            <input
              className="plain-input"
              type="password"
              value={accessCode}
              maxLength={200}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </label>
          <div className="button-row">
            {running || busy ? (
              <button className="button primary" onClick={pause}>
                <Pause size={15} /> Pause
              </button>
            ) : (
              <button
                className="button primary"
                disabled={!world || busy}
                onClick={resume}
              >
                <Play size={15} /> Continue life
              </button>
            )}
            <button
              className="button secondary"
              disabled={!world || running || busy}
              onClick={() => void step()}
            >
              <SkipForward size={15} /> One step
            </button>
          </div>
          {mode === "demo" && (
            <p className="demo-mode-note">
              Presentation mode: a task completes every 8 seconds. No model
              calls. Their little routine repeats with shared responsibilities
              each day.
            </p>
          )}
          <p className="caption">
            Runs while this page is open. Use Until paused for continuous life,
            or choose a step budget; Continue resumes the same life. Refresh
            preserves the story and pauses execution. Closing the page stops new
            requests.
          </p>
          <p className="caption">
            Model mode: up to two model turns per active step, each with one
            repair retry. Quiet work and sleep steps use no model. Agent model
            turns attempted: {world?.modelCalls || 0}. Current run: {steps}
            {budget ? `/${budget}` : ""} steps.
          </p>
          {busy && (
            <p className="lime" aria-live="polite">
              The household is making its next move…
            </p>
          )}
          {error && (
            <div className="warning" role="alert">
              {error}
            </div>
          )}
        </aside>
        <section className="life-feed">
          <div className="life-clock">
            <Clock size={18} />
            <strong>
              Day {time.day} · {String(time.hour).padStart(2, "0")}:00
            </strong>
            <span>{time.phase}</span>
            <span className="micro">{running ? "RUNNING" : "PAUSED"}</span>
          </div>
          {world ? (
            <>
              <HouseholdWorld
                world={world}
                running={running && !busy}
                mode={mode}
              />
              <div className="life-cast">
                {world.participants.map((p) => (
                  <div key={p.id}>
                    <Avatar person={p} />
                    <div>
                      <h3>{p.name.split(" ")[0]}.exe</h3>
                      <span className="caption">{p.agent.dateEnergy}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="life-meters">
                <span>
                  Shared warmth <b>{world.warmth}</b>
                </span>
                <span>
                  Unresolved friction <b>{world.tension}</b>
                </span>
                <small>
                  Fictional story state, not psychological measurements.
                </small>
              </div>
              {!world.events.length && (
                <div className="empty-state">
                  <MessageCircle />
                  <h3>A shared home. A blank chapter.</h3>
                  <p>Continue life, or take one step to see what happens.</p>
                </div>
              )}
              <details className="world-journal" open={!running}>
                <summary>
                  Household journal · {world.events.length} recent events
                </summary>
                <div className="life-events" aria-live="polite">
                  {world.events
                    .slice()
                    .reverse()
                    .map((event) => {
                      const person = world.participants.find(
                        (p) => p.id === event.agentId,
                      );
                      const when = clock(event.tick);
                      return (
                        <article
                          className={`life-event ${event.kind}`}
                          key={event.id}
                        >
                          <div className="micro">
                            DAY {when.day} ·{" "}
                            {String(when.hour).padStart(2, "0")}:00 /{" "}
                            {person?.name.split(" ")[0] || "THE HOUSEHOLD"} /{" "}
                            {event.kind === "text"
                              ? "TEXT MESSAGE"
                              : event.kind === "scene"
                                ? "LIFE UPDATE"
                                : "QUIET TIME"}{" "}
                            {event.mode === "fallback"
                              ? " / FALLBACK"
                              : event.mode === "demo"
                                ? " / AUTHORED DEMO"
                                : ""}
                          </div>
                          <p>{event.text}</p>
                        </article>
                      );
                    })}
                </div>
              </details>
              <details className="life-memory">
                <summary>
                  What the household remembers ({world.memories.length})
                </summary>
                <ul>
                  {world.memories.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                <p className="caption">
                  Visible event summaries—not hidden model reasoning. The most
                  recent 24 memories and 120 events are retained.
                </p>
              </details>
            </>
          ) : (
            <div className="empty-state">
              <Home size={35} />
              <h3>Cast two representatives.</h3>
              <p>Create a fictional household to start the story.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
