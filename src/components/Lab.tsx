"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ExternalLink,
  FlaskConical,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useSession } from "@/store/session";
import { profileUrl } from "@/lib/validation";
import { consumeEvents } from "@/lib/stream";
import { rankAll } from "@/lib/matching/ranking";
import { demo } from "@/lib/demo";
import type { Persona, DateRecord } from "@/lib/persona/schema";
import { PersonCard } from "./PersonCard";
import { ProfileRead } from "./ProfileRead";
import { DateRoom } from "./DateRoom";
import { RankingList } from "./RankingList";
const stages = [
  "Checking links",
  "Reading Instagram",
  "Reading LinkedIn",
  "Locking identity",
  "Building agent",
];
export function Lab() {
  const { people, dates, addPerson, addDate, removePerson, clear } =
    useSession();
  const [hydrated, setHydrated] = useState(false),
    [linkedin, setLinkedin] = useState(""),
    [instagram, setInstagram] = useState(""),
    [consent, setConsent] = useState(false),
    [accessCode, setAccessCode] = useState(""),
    [status, setStatus] = useState<{
      scraping: boolean;
      model: boolean;
      accessCodeRequired: boolean;
    } | null>(null),
    [busy, setBusy] = useState(false),
    [step, setStep] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState<Persona | null>(null),
    [profile, setProfile] = useState<string | null>(null),
    [view, setView] = useState<"cast" | "date" | "rankings">("cast"),
    [selectedA, setSelectedA] = useState(""),
    [selectedB, setSelectedB] = useState(""),
    [datePair, setDatePair] = useState<[string, string] | null>(null),
    [replay, setReplay] = useState<DateRecord | undefined>(),
    [clearConfirm, setClearConfirm] = useState(false);
  useEffect(() => {
    setHydrated(true);
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);
  const rankings = useMemo(() => rankAll(people, dates), [people, dates]);
  const a = people.find((p) => p.id === selectedA) || people[0],
    b =
      people.find((p) => p.id === selectedB && p.id !== a?.id) ||
      people.find((p) => p.id !== a?.id);
  function save(person: Persona) {
    if (!addPerson(person)) {
      setError("This person is already in your cast.");
      return;
    }
    setPending(null);
    setProfile(person.id);
    setLinkedin("");
    setInstagram("");
    setConsent(false);
    setStep("");
  }
  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let li: string, ig: string;
    try {
      li = profileUrl(linkedin, "linkedin");
      ig = profileUrl(instagram, "instagram");
      if (!consent)
        throw new Error(
          "Confirm that you have consent from the adult participant.",
        );
      if (
        people.some(
          (p) => p.sources.linkedinUrl === li || p.sources.instagramUrl === ig,
        )
      )
        throw new Error("This person is already in your cast.");
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    setBusy(true);
    setStep(stages[0]);
    let received = false;
    try {
      await consumeEvents(
        await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkedinUrl: li,
            instagramUrl: ig,
            consent,
            accessCode,
          }),
        }),
        (event) => {
          if (event.type === "progress") setStep(event.step as string);
          if (event.type === "person") {
            received = true;
            const p = event.person as Persona;
            if (event.uncertain) {
              setPending(p);
              setStep("Source Lock uncertain");
            } else save(p);
          }
        },
      );
      if (!received)
        throw new Error("Profile stream ended early. Please retry.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function openDate(x: string, y: string, date?: DateRecord) {
    setDatePair([x, y]);
    setReplay(date);
    setProfile(null);
    setView("date");
  }
  const pairPeople = datePair?.map((id) => people.find((p) => p.id === id));
  if (!hydrated)
    return (
      <div className="page-wrap empty-state">
        <LoaderCircle className="spin" />
        <p>Finding your representatives…</p>
      </div>
    );
  if (profile) {
    const person = people.find((p) => p.id === profile);
    if (person)
      return (
        <ProfileRead
          person={person}
          onBack={() => setProfile(null)}
          onDate={
            people.length > 1
              ? () => {
                  setProfile(null);
                  setSelectedA(person.id);
                  setView("date");
                }
              : undefined
          }
        />
      );
  }
  if (pairPeople?.[0] && pairPeople[1])
    return (
      <DateRoom
        key={datePair?.join("-") + (replay?.id || "")}
        a={pairPeople[0]}
        b={pairPeople[1]}
        record={replay}
        onFinished={addDate}
        onRankings={() => {
          setSelectedA(datePair![0]);
          setDatePair(null);
          setView("rankings");
        }}
        onBack={() => setDatePair(null)}
        accessCode={accessCode}
      />
    );
  return (
    <div className="page-wrap lab-page">
      <div className="lab-heading">
        <div>
          <span className="eyebrow pink">
            <FlaskConical size={15} /> THE LAB / YOUR OWN EXPERIMENT
          </span>
          <h1>
            Bring your
            <br />
            own <span className="serif lime">plot twist.</span>
          </h1>
          <p>
            Two public links. One consenting adult. An agent ready to meet the
            room.
          </p>
        </div>
        <div className="lab-privacy">
          <LockKeyhole size={22} />
          <p>
            Saved in this browser.
            <br />
            <span>No database. No secret enrichment.</span>
          </p>
        </div>
      </div>
      <div className="lab-layout">
        <section className="lab-input panel">
          <span className="eyebrow">ADD A REPRESENTATIVE</span>
          <h2>Who’s joining the cast?</h2>
          <p className="muted">
            We read public interests and conversation signals. Romantic needs
            are yours to describe.
          </p>
          {status && !status.scraping && (
            <div className="config-notice">
              <Zap size={16} />
              <div>
                <strong>Public-profile reader isn't connected yet.</strong>
                <p>
                  Set APIFY_TOKEN in the server environment, or explore the
                  fictional cast below.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={analyze}>
            <label htmlFor="linkedin">
              LinkedIn profile <span>PUBLIC PERSON PROFILE</span>
            </label>
            <div className="url-input">
              <b>in</b>
              <input
                id="linkedin"
                type="url"
                required
                maxLength={400}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/you/"
                disabled={busy}
              />
            </div>
            <label htmlFor="instagram">
              Instagram profile <span>PUBLIC ACCOUNTS ONLY</span>
            </label>
            <div className="url-input">
              <b>◎</b>
              <input
                id="instagram"
                type="url"
                required
                maxLength={400}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://www.instagram.com/you/"
                disabled={busy}
              />
            </div>
            {status?.accessCodeRequired && (
              <>
                <label htmlFor="access-code">Lab access code</label>
                <input
                  id="access-code"
                  className="plain-input"
                  type="password"
                  maxLength={200}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoComplete="off"
                />
              </>
            )}
            <label className="consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                disabled={busy}
              />
              <span>
                I’m an adult reading my own profiles, or I have this adult
                participant’s consent to use both public sources.
              </span>
            </label>
            <button
              className="button primary full"
              type="submit"
              disabled={busy || !!pending}
            >
              {busy ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Sparkles size={16} />
              )}{" "}
              {busy ? "Your agent is reading the room…" : "Read this person"}
            </button>
          </form>
          {busy && (
            <ol className="progress-steps" aria-live="polite">
              {stages.map((s, i) => (
                <li
                  className={stages.indexOf(step) >= i ? "current" : ""}
                  key={s}
                >
                  {stages.indexOf(step) > i ? (
                    <Check size={13} />
                  ) : stages.indexOf(step) === i ? (
                    <LoaderCircle size={13} className="spin" />
                  ) : (
                    <span />
                  )}
                  {s}
                </li>
              ))}
            </ol>
          )}
          {error && (
            <div className="warning" role="alert">
              <strong>Couldn’t finish the read.</strong>
              <p>{error}</p>
              <button
                className="text-button"
                onClick={() => {
                  setError("");
                  document.getElementById("linkedin")?.focus();
                }}
              >
                Check links & retry <ArrowUpRight size={14} />
              </button>
            </div>
          )}
          {pending && (
            <div className="identity-pending">
              <ShieldCheck size={20} />
              <h3>Source Lock uncertain · {pending.identityConfidence}%</h3>
              <p>
                The profiles might not belong to the same person. Confirm both
                links before adding this card.
              </p>
              <ul>
                {pending.identitySignals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="button-row">
                <a
                  href={pending.sources.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-button"
                >
                  LinkedIn <ExternalLink size={13} />
                </a>
                <a
                  href={pending.sources.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-button"
                >
                  Instagram <ExternalLink size={13} />
                </a>
              </div>
              <button
                className="button secondary full"
                onClick={() => save(pending)}
              >
                I confirm both sources belong together
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setPending(null);
                  setStep("");
                }}
              >
                Discard this read
              </button>
            </div>
          )}
          <div className="source-contract">
            <ShieldCheck size={17} />
            <p>
              Private Instagram is blocked. Follower counts aren't personality.
              Evidence can be incomplete. You have the final say.
            </p>
          </div>
        </section>
        <section className="lab-session">
          <div className="section-top">
            <div>
              <span className="eyebrow">YOUR REPRESENTATIVES</span>
              <h2>
                The room <span className="muted">({people.length})</span>
              </h2>
            </div>
            {people.length > 0 && (
              <button
                className="icon-button"
                onClick={() => setClearConfirm(!clearConfirm)}
                aria-label="Clear saved cast"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
          {clearConfirm && (
            <div className="warning">
              <p>Remove all saved profiles and dates from this browser?</p>
              <div className="button-row">
                <button
                  className="button small secondary"
                  onClick={() => {
                    clear();
                    setClearConfirm(false);
                    setDatePair(null);
                  }}
                >
                  Clear local session
                </button>
                <button
                  className="text-button"
                  onClick={() => setClearConfirm(false)}
                >
                  Keep the cast
                </button>
              </div>
            </div>
          )}
          {people.length === 0 ? (
            <div className="lab-empty">
              <div className="empty-cast-icon">
                <Users size={35} />
              </div>
              <h3>
                A room full of possibilities.
                <br />
                Currently, an empty room.
              </h3>
              <p>
                Add your first participant using the two public links.
                <br />
                Or test the complete Lab flow with fictional agents.
              </p>
              <button
                className="button secondary"
                onClick={() => {
                  demo.people
                    .slice(0, 3)
                    .forEach((p) =>
                      addPerson({
                        ...p,
                        sources: {
                          linkedinUrl: `fixture:${p.id}:linkedin`,
                          instagramUrl: `fixture:${p.id}:instagram`,
                        },
                      }),
                    );
                }}
              >
                Try with 3 fictional agents <Plus size={15} />
              </button>
              <Link className="text-button" href="/demo">
                Explore the 25-person demo <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              <div className="session-tabs">
                {(["cast", "date", "rankings"] as const).map((v) => (
                  <button
                    className={view === v ? "selected" : ""}
                    key={v}
                    onClick={() => setView(v)}
                    disabled={v !== "cast" && people.length < 2}
                  >
                    {v === "cast"
                      ? "Your cast"
                      : v === "date"
                        ? "Date Night"
                        : "Rankings"}
                  </button>
                ))}
              </div>
              {view === "cast" && (
                <>
                  <div className="session-cast">
                    {people.map((p, i) => (
                      <div key={p.id}>
                        <PersonCard
                          person={p}
                          index={i}
                          onOpen={() => setProfile(p.id)}
                        />
                        <button
                          className="remove-person"
                          onClick={() => removePerson(p.id)}
                        >
                          Remove from this browser
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="button primary full"
                    onClick={() => setView("date")}
                    disabled={people.length < 2}
                  >
                    <Zap size={16} />{" "}
                    {people.length < 2
                      ? "Add one more person for Date Night"
                      : "Start Date Night"}
                  </button>
                </>
              )}
              {view === "date" && a && b && (
                <div className="date-picker panel">
                  <span className="eyebrow">
                    PICK TWO. LET THEM DO THE REST.
                  </span>
                  <h3>Who’s meeting tonight?</h3>
                  <label>
                    Agent A
                    <select
                      value={a.id}
                      onChange={(e) => setSelectedA(e.target.value)}
                    >
                      {people.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Agent B
                    <select
                      value={b.id}
                      onChange={(e) => setSelectedB(e.target.value)}
                    >
                      {people
                        .filter((p) => p.id !== a.id)
                        .map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    className="button primary full"
                    onClick={() => openDate(a.id, b.id)}
                  >
                    <Zap size={16} /> Enter the dating room
                  </button>
                  <p className="caption">
                    One chosen pair. Six real alternating agent turns. Rankings
                    update when the date finishes.
                    {status && !status.model
                      ? " No model key: the runner will clearly label its fallback simulation."
                      : ""}
                  </p>
                </div>
              )}
              {view === "rankings" && a && (
                <>
                  <label className="person-selector">
                    RANKING FOR
                    <select
                      value={a.id}
                      onChange={(e) => setSelectedA(e.target.value)}
                    >
                      {people.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <RankingList
                    person={a}
                    people={people}
                    rankings={rankings}
                    onReplay={(id) => {
                      const d = dates.find((d) => d.id === id);
                      if (d)
                        openDate(d.participantIds[0], d.participantIds[1], d);
                    }}
                  />
                </>
              )}
            </>
          )}
          <p className="caption">
            <Link2 size={13} /> Profiles and dates persist locally across
            refreshes. Clear your cast to delete them.
          </p>
        </section>
      </div>
    </div>
  );
}
