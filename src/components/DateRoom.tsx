"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  FileText,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  Persona,
  DateRecord,
  DateEvent,
  Message,
} from "@/lib/persona/schema";
import { Avatar } from "./Avatar";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { consumeEvents } from "@/lib/stream";
export function DateRoom({
  a,
  b,
  record,
  onFinished,
  onBack,
  nextHref,
  accessCode,
  onRankings,
}: {
  a: Persona;
  b: Persona;
  record?: DateRecord;
  onFinished?: (date: DateRecord) => void;
  onBack?: () => void;
  nextHref?: string;
  accessCode?: string;
  onRankings?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]),
    [started, setStarted] = useState(false),
    [playing, setPlaying] = useState(false),
    [finished, setFinished] = useState<DateRecord | null>(null),
    [curveball, setCurveball] = useState(false),
    [thinking, setThinking] = useState<string | null>(null),
    [chemistry, setChemistry] = useState(48),
    [confessional, setConfessional] = useState<{
      id: string;
      text: string;
    } | null>(null),
    [live, setLive] = useState(false),
    [error, setError] = useState(""),
    [speed, setSpeed] = useState(1),
    [receipts, setReceipts] = useState<Persona | null>(null),
    [mode, setMode] = useState(record?.mode || "model"),
    [scenario, setScenario] = useState(record?.curveball || "");
  const reduced = useReducedMotion(),
    scrollRef = useRef<HTMLDivElement>(null),
    controller = useRef<AbortController | null>(null),
    run = useRef(0);
  useEffect(
    () => () => {
      controller.current?.abort();
      run.current++;
    },
    [],
  );
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "nearest",
    });
  }, [messages, curveball, reduced]);
  useEffect(() => {
    if (!record || !playing || live || finished) return;
    if (messages.length === record.messages.length) {
      const t = setTimeout(() => {
        setFinished(record);
        setPlaying(false);
        setThinking(null);
      }, 1200 / speed);
      return () => clearTimeout(t);
    }
    const idx = messages.length;
    setThinking(record.messages[idx].agentId);
    const t = setTimeout(() => {
      if (idx === Math.floor(record.messages.length / 2)) setCurveball(true);
      const m = record.messages[idx];
      setMessages((prev) => [...prev, m]);
      setChemistry((v) => Math.min(100, v + m.engagementDelta));
      setConfessional({ id: m.agentId, text: m.publicConfessional });
      setThinking(null);
    }, 2100 / speed);
    return () => clearTimeout(t);
  }, [playing, messages.length, live, finished, record, speed]);
  function reset() {
    controller.current?.abort();
    run.current++;
    setMessages([]);
    setStarted(false);
    setPlaying(false);
    setFinished(null);
    setCurveball(false);
    setThinking(null);
    setChemistry(48);
    setConfessional(null);
    setLive(false);
    setError("");
    setMode(record?.mode || "model");
  }
  async function startLive() {
    reset();
    const runId = run.current;
    setLive(true);
    setStarted(true);
    setPlaying(true);
    setMode("model");
    controller.current = new AbortController();
    let chain = Promise.resolve();
    let receivedFinish = false;
    const handle = (e: DateEvent) => {
      if (run.current !== runId) return;
      if (e.type === "date_started" && e.date) setScenario(e.date.curveball);
      if (e.type === "curveball" && e.text) setScenario(e.text);
      if (e.type === "agent_thinking") setThinking(e.agentId!);
      if (e.type === "agent_message" && e.message) {
        setMessages((v) => [...v, e.message!]);
        setThinking(null);
      }
      if (e.type === "curveball") setCurveball(true);
      if (e.type === "chemistry_update") setChemistry(e.value!);
      if (e.type === "confessional")
        setConfessional({ id: e.agentId!, text: e.text! });
      if (e.type === "date_finished" && e.date) {
        setFinished(e.date);
        setMode(e.date.mode);
        setPlaying(false);
        setThinking(null);
        onFinished?.(e.date);
        receivedFinish = true;
      }
    };
    try {
      const res = await fetch("/api/date/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a, b, accessCode }),
        signal: controller.current.signal,
      });
      await consumeEvents(res, (event) => {
        chain = chain.then(async () => {
          if (run.current !== runId) return;
          handle(event as DateEvent);
          if (
            ["agent_message", "curveball", "confessional"].includes(
              event.type as string,
            )
          )
            await new Promise((r) => setTimeout(r, 850));
        });
      });
      await chain;
      if (run.current === runId && !receivedFinish)
        throw new Error("Date stream ended early. Please retry.");
    } catch (e) {
      if (
        e instanceof Error &&
        e.name !== "AbortError" &&
        run.current === runId
      ) {
        run.current++;
        controller.current?.abort();
        setError(e.message);
        setPlaying(false);
        setThinking(null);
      }
    }
  }
  const participants = [a, b];
  const actual = finished || record;
  return (
    <div className="page-wrap date-page">
      <div className="date-topbar">
        {onBack ? (
          <button className="back-link" onClick={onBack}>
            <ChevronLeft size={16} /> Back to your cast
          </button>
        ) : (
          <Link href="/demo?tab=dates" className="back-link">
            <ChevronLeft size={16} /> Back to Date Night
          </Link>
        )}
        <span className="micro">
          {record
            ? `ROUND ${String(record.round).padStart(2, "0")} / THE EXPERIMENT`
            : "YOUR CAST / LIVE SESSION"}
        </span>
      </div>
      <div className="date-title">
        <div>
          <span className="eyebrow">
            TWO AGENTS HAVE BEEN LEFT UNSUPERVISED
          </span>
          <h1>
            Date Night<span className="pink">.</span>
          </h1>
        </div>
        <span className={`on-air ${live && playing ? "live" : ""}`}>
          <span />
          {live
            ? playing
              ? "LIVE AGENT RUN"
              : error
                ? "DATE INTERRUPTED"
                : finished
                  ? mode === "fallback"
                    ? "FALLBACK SIMULATION"
                    : "LIVE DATE COMPLETE"
                  : "READY FOR LIVE DATE"
            : record
              ? "PRECOMPUTED REPLAY"
              : "READY FOR LIVE DATE"}
        </span>
      </div>
      <div className="date-layout">
        <section className="date-stage">
          <div className="date-participants">
            {participants.map((p, i) => (
              <div
                className={`date-participant ${i ? "right" : ""}`}
                key={p.id}
              >
                <Avatar person={p} />
                <div>
                  <span className="micro">
                    {p.fictional ? "FICTIONAL AGENT" : "PUBLIC-INTEREST AGENT"}
                  </span>
                  <h2>
                    {p.name.split(" ")[0]}
                    <span className="lime">.exe</span>
                  </h2>
                  <span>{p.agent.dateEnergy}</span>
                </div>
                <button
                  className="icon-button"
                  aria-label={`See ${p.name}'s receipts`}
                  onClick={() => setReceipts(p)}
                >
                  <FileText size={17} />
                </button>
              </div>
            ))}
          </div>
          <div className="conversation">
            <div className="scene-label">
              <span /> SCENE 01: THE FIRST IMPRESSION <span />
            </div>
            {!started && (
              <div className="date-ready">
                <div className="ready-icon">
                  <Sparkles size={32} />
                </div>
                <h3>The humans can relax.</h3>
                <p>Their representatives have it from here.</p>
                <button
                  className="button primary"
                  onClick={
                    record
                      ? () => {
                          setStarted(true);
                          setPlaying(true);
                        }
                      : startLive
                  }
                >
                  <Play size={16} />
                  {record ? "Watch this date" : "Start live Date Night"}
                </button>
                <span className="caption">
                  {record
                    ? record?.mode === "fixture"
                      ? "Authored fictional simulation · no API calls"
                      : record?.mode === "fallback"
                        ? "Precomputed fallback simulation · no API calls"
                        : "Precomputed agent transcript · no API calls"
                    : "6 alternating agent turns · uses your server model"}
                </span>
              </div>
            )}
            <AnimatePresence>
              {messages.map((m, i) => {
                const p = m.agentId === a.id ? a : b;
                return (
                  <div key={`${i}-${m.agentId}`}>
                    {curveball &&
                      i ===
                        Math.floor(
                          (record && !live ? record.messages.length : 6) / 2,
                        ) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="curveball"
                        >
                          <div>
                            <Zap size={17} />
                            <span>PLOT TWIST / CURVEBALL CARD</span>
                          </div>
                          <h3>
                            {scenario ||
                              actual?.curveball ||
                              "A spontaneous scenario enters the conversation."}
                          </h3>
                        </motion.div>
                      )}
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`agent-message ${p.id === b.id ? "from-b" : ""}`}
                    >
                      <Avatar person={p} />
                      <div>
                        <span className="micro">
                          {p.name.split(" ")[0].toUpperCase()}.EXE
                        </span>
                        <p>{m.message}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
            {thinking && (
              <div className={`thinking ${thinking === b.id ? "from-b" : ""}`}>
                <span />
                <span />
                <span />
                <small>
                  {thinking === a.id
                    ? a.name.split(" ")[0]
                    : b.name.split(" ")[0]}
                  .exe is reading the room
                </small>
              </div>
            )}
            <div ref={scrollRef} />
            {finished && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="date-results"
              >
                <span className="eyebrow">THE PRIVATE VOTE, NOW REVEALED</span>
                <h3>Same date. Two opinions.</h3>
                <div className="outcome-grid">
                  {finished.outcomes.map((o) => {
                    const p = o.agentId === a.id ? a : b,
                      other = o.agentId === a.id ? b : a;
                    return (
                      <div className="outcome" key={o.agentId}>
                        <span className="micro">
                          {p.name.split(" ")[0]} → {other.name.split(" ")[0]}
                        </span>
                        <strong>{o.score}</strong>
                        <p>“{o.summary}”</p>
                        <span
                          className={`vote ${o.wantsAnotherDate ? "yes" : ""}`}
                        >
                          <Heart size={12} />
                          {o.wantsAnotherDate
                            ? "Another conversation, please"
                            : "Different pace"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="caption">
                  {finished.mode === "fixture"
                    ? "Fictional authored outcomes."
                    : finished.mode === "fallback"
                      ? "Fallback simulation: safe templates; scores from the deterministic scorer."
                      : "Agent conversation outcomes, not the real person’s romantic opinion."}
                </p>
              </motion.div>
            )}
          </div>
          {started && (
            <div className="playback-controls">
              {!live && !finished && (
                <button
                  className="icon-button"
                  aria-label={playing ? "Pause replay" : "Resume replay"}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
              )}
              <span className="micro">
                {messages.length} / {live ? 6 : record?.messages.length || 6}{" "}
                TURNS
              </span>
              <span className="playback-track">
                <span
                  style={{
                    width: `${(messages.length / (live ? 6 : record?.messages.length || 6)) * 100}%`,
                  }}
                />
              </span>
              {!live && (
                <button
                  className="speed-button"
                  onClick={() => setSpeed(speed === 1 ? 2 : 1)}
                >
                  {speed}×
                </button>
              )}
              {live && playing && (
                <button className="text-button" onClick={reset}>
                  Cancel run
                </button>
              )}
            </div>
          )}
        </section>
        <aside className="date-sidebar">
          <div className="chemistry-card">
            <span className="eyebrow">THE CONVERSATION METER</span>
            <div className="chemistry-value">
              {chemistry}
              <span>%</span>
              <Heart size={22} />
            </div>
            <div className="chemistry-track">
              <motion.span animate={{ width: `${chemistry}%` }} />
            </div>
            <p>
              {chemistry > 65
                ? "The spreadsheet says chemistry."
                : "The room is warming up."}
            </p>
            <span className="caption">
              A playful engagement indicator. Not a human assessment.
            </span>
          </div>
          <div className="confessional-card">
            <span className="micro">
              <span className="record-dot" /> THE CONFESSIONAL
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={confessional?.text || "none"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {confessional ? (
                  <>
                    <p>“{confessional.text}”</p>
                    <span className="micro">
                      —{" "}
                      {confessional.id === a.id
                        ? a.name.split(" ")[0]
                        : b.name.split(" ")[0]}
                      .exe
                    </span>
                  </>
                ) : (
                  <p className="muted">
                    A little commentary from the sidelines. Watch the date to
                    hear it.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <span className="caption">
              A public summary, never hidden reasoning.
            </span>
          </div>
          <div className="date-rule">
            <span>THE GROUND RULES</span>
            <p>
              Be curious. Stay grounded.
              <br />
              Let the humans have the final say.
            </p>
          </div>
          {record && !live && (
            <button className="button secondary full" onClick={startLive}>
              <Zap size={15} /> Run live agents
            </button>
          )}
          {live && mode === "fallback" && (
            <div className="warning">
              Fallback simulation. Model content was unavailable; safe
              interest-based templates were used.
            </div>
          )}
          {error && (
            <div className="warning" role="alert">
              {error}
              <button className="text-button" onClick={startLive}>
                Retry live date
              </button>
            </div>
          )}
        </aside>
      </div>
      {finished && (
        <div className="date-actions">
          <button
            className="button secondary"
            onClick={() => {
              reset();
              if (record) {
                setStarted(true);
                setPlaying(true);
              } else void startLive();
            }}
          >
            <RotateCcw size={16} />
            {record ? "Replay date" : "Run another date"}
          </button>
          <button className="button secondary" onClick={() => setReceipts(a)}>
            <FileText size={16} /> See the receipts
          </button>
          {nextHref && (
            <Link href={nextHref} className="button secondary">
              Next date <ArrowUpRight size={16} />
            </Link>
          )}
          {onRankings && (
            <button className="button primary" onClick={onRankings}>
              Open rankings <ArrowUpRight size={16} />
            </button>
          )}
          {record && (
            <Link href={`/demo/rankings/${a.id}`} className="button primary">
              Open rankings <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      )}
      {receipts && (
        <EvidenceDrawer person={receipts} onClose={() => setReceipts(null)} />
      )}
    </div>
  );
}
