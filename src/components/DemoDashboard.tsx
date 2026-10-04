"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Heart,
  Play,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { demo } from "@/lib/demo";
import { PersonCard } from "./PersonCard";
import { Avatar } from "./Avatar";
import { RankingList } from "./RankingList";
import { Mutuals } from "./Mutuals";
const tabs = [
  ["cast", "The cast"],
  ["dates", "Date Night"],
  ["rankings", "Rankings"],
  ["mutuals", "Mutuals"],
] as const;
export function DemoDashboard() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "cast"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState(demo.people[0].id),
    [round, setRound] = useState(0);
  useEffect(() => {
    const t = params.get("tab");
    if (t && tabs.some(([id]) => id === t)) setTab(t);
  }, [params]);
  const people = demo.people;
  const fictional = people.every((p) => p.fictional);
  const person = people.find((p) => p.id === selected)!;
  return (
    <div className="page-wrap demo-page">
      <div className="demo-heading">
        <div>
          <span className="eyebrow">
            <span className="status-dot" /> SEASON 01 / THE EXPERIMENT
          </span>
          <h1>
            Welcome to
            <br />
            the <span className="serif pink">situationship.</span>
          </h1>
          <p>25 personalities. 25 representatives. Let's see who clicks.</p>
        </div>
        <div className="demo-stamp">
          <AsteriskMark />
          <span>
            {fictional ? "FICTIONAL CAST" : "PUBLIC SOURCE CAST"}
            <br />
            REAL CURIOSITY
          </span>
        </div>
      </div>
      <div className="dashboard-stats">
        {[
          [String(people.length), fictional ? "HUMANS*" : "HUMANS"],
          [String(people.length), "AGENTS"],
          [String(demo.dates.length), "DEMO DATES"],
          [String(people.length * (people.length - 1)), "DIRECTIONAL OPINIONS"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
        <p>
          {fictional ? (
            <>
              * Fictional adults.
              <br />
              No real people profiled.
            </>
          ) : (
            <>
              Two sources each.
              <br />
              Hypotheses, not verdicts.
            </>
          )}
        </p>
      </div>
      <div className="dashboard-tabs" role="tablist" aria-label="Demo sections">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={tab === id ? "selected" : ""}
          >
            {id === "dates" && <span className="tiny-live" />}
            {label}
            {id === "cast" && <span>25</span>}
            {id === "mutuals" && <Heart size={14} />}
          </button>
        ))}
        <Link href="/lab">
          Bring your own cast <ArrowUpRight size={15} />
        </Link>
      </div>
      {tab === "cast" && (
        <>
          <div className="cast-toolbar">
            <p>
              <span className="lime">●</span> The representatives are ready.
            </p>
            <label className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a person or interest"
                aria-label="Search the cast"
              />
            </label>
          </div>
          <div className="cast-grid">
            {people
              .filter((p) =>
                (p.name + " " + p.interests.map((s) => s.label).join(" "))
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((p) => (
                <PersonCard person={p} index={people.indexOf(p)} key={p.id} />
              ))}
          </div>
          {!people.some((p) =>
            (p.name + " " + p.interests.map((s) => s.label).join(" "))
              .toLowerCase()
              .includes(search.toLowerCase()),
          ) && (
            <div className="empty-state">
              Nobody by that name or interest. Try another search.
            </div>
          )}
        </>
      )}
      {tab === "dates" && (
        <>
          <div className="tab-intro">
            <span className="eyebrow pink">
              NO HUMANS WERE MADE TO SMALL-TALK
            </span>
            <h2>
              The night's schedule<span className="lime">.</span>
            </h2>
            <p className="muted">
              Five rounds. Sixty different pairings. Every agent gets a few
              plotlines.
            </p>
          </div>
          <div className="round-filters">
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <button
                className={`filter-chip ${round === r ? "selected" : ""}`}
                key={r}
                onClick={() => setRound(r)}
              >
                {r ? `Round ${r}` : "All rounds"}
              </button>
            ))}
          </div>
          <div className="schedule-grid">
            {demo.dates
              .filter((d) => !round || d.round === round)
              .map((d, i) => {
                const a = people.find((p) => p.id === d.participantIds[0])!,
                  b = people.find((p) => p.id === d.participantIds[1])!;
                return (
                  <Link
                    href={`/demo/date/${d.id}`}
                    className="schedule-card"
                    key={d.id}
                  >
                    <div className="schedule-meta">
                      <span className="micro">
                        ROUND {d.round} / DATE {d.id.slice(-2)}
                      </span>
                      <span className="micro">
                        <Check size={12} /> REPLAY READY
                      </span>
                    </div>
                    <div className="schedule-pair">
                      <Avatar person={a} />
                      <span>&</span>
                      <Avatar person={b} />
                    </div>
                    <h3>
                      {a.name.split(" ")[0]} <span className="muted">×</span>{" "}
                      {b.name.split(" ")[0]}
                    </h3>
                    <p>{d.curveball}</p>
                    <div className="schedule-bottom">
                      <span>
                        <Zap size={13} /> {d.outcomes[0].score} /{" "}
                        {d.outcomes[1].score}
                      </span>
                      <span>
                        <Play size={13} /> Watch date
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </>
      )}
      {tab === "rankings" && (
        <>
          <div className="tab-intro">
            <span className="eyebrow">COMPATIBILITY IS NOT DEMOCRACY</span>
            <h2>
              Everyone has an opinion<span className="pink">.</span>
            </h2>
            <p className="muted">
              The same connection can feel different from either side.
            </p>
          </div>
          <label className="person-selector">
            SEE THE ROOM THROUGH{" "}
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {people.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <RankingList
            person={person}
            people={people}
            rankings={demo.rankings}
          />
        </>
      )}
      {tab === "mutuals" && (
        <Mutuals people={people} rankings={demo.rankings} />
      )}
      <div className="demo-disclosure">
        <Users size={17} />
        <p>
          {demo.disclosure} <Link href="/lab">Create a consented cast.</Link>
        </p>
      </div>
    </div>
  );
}
function AsteriskMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 5v54M5 32h54M13 13l38 38M13 51l38-38"
        stroke="currentColor"
        strokeWidth="6"
      />
    </svg>
  );
}
