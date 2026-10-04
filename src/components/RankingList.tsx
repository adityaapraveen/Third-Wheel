"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import type { Persona, Ranking } from "@/lib/persona/schema";
import { scoreLabel } from "@/lib/matching/compatibility";
import { isMutual } from "@/lib/matching/ranking";
import { Avatar } from "./Avatar";
export function RankingList({
  person,
  people,
  rankings,
  onReplay,
}: {
  person: Persona;
  people: Persona[];
  rankings: Record<string, Ranking[]>;
  onReplay?: (id: string) => void;
}) {
  const [mutuals, setMutuals] = useState(false),
    [expanded, setExpanded] = useState<string | null>(null);
  const all = rankings[person.id] || [];
  const rows = all.filter(
    (r) => !mutuals || isMutual(rankings, person.id, r.candidateId),
  );
  return (
    <>
      <div className="ranking-toolbar">
        <p>
          <SlidersHorizontal size={15} />
          {all.length} candidates · ranked for {person.name.split(" ")[0]}
        </p>
        <button
          className={`filter-chip ${mutuals ? "selected" : ""}`}
          onClick={() => setMutuals(!mutuals)}
          aria-pressed={mutuals}
        >
          <Heart size={14} /> Mutual top 5
        </button>
      </div>
      <div className="ranking-list">
        {rows.map((r) => {
          const candidate = people.find((p) => p.id === r.candidateId);
          if (!candidate) return null;
          const reciprocal = rankings[candidate.id]?.find(
            (x) => x.candidateId === person.id,
          );
          const mutual = isMutual(rankings, person.id, candidate.id);
          return (
            <article
              className={`ranking-row ${r.rank === 1 ? "top-match" : ""}`}
              key={r.candidateId}
            >
              <button
                className="ranking-main"
                onClick={() =>
                  setExpanded(expanded === r.candidateId ? null : r.candidateId)
                }
                aria-expanded={expanded === r.candidateId}
              >
                <span className="rank-number">
                  {String(r.rank).padStart(2, "0")}
                </span>
                <Avatar person={candidate} />
                <span className="ranking-person">
                  <strong>
                    {candidate.name}{" "}
                    {mutual && (
                      <span className="mutual-small">
                        <Heart size={11} /> MUTUAL
                      </span>
                    )}
                  </strong>
                  <span>{scoreLabel(r.finalScore)}</span>
                </span>
                <span className="reciprocal">
                  <span>
                    YOU RANK THEM <b>#{r.rank}</b>
                  </span>
                  <span>
                    THEY RANK YOU <b>#{reciprocal?.rank ?? "—"}</b>
                  </span>
                </span>
                <span className="ranking-score">
                  {r.finalScore}
                  <small>MATCH</small>
                </span>
                <ChevronDown
                  className={expanded === r.candidateId ? "rotated" : ""}
                  size={18}
                />
              </button>
              {expanded === r.candidateId && (
                <div className="ranking-expanded">
                  <div>
                    <h4>Why it works</h4>
                    <p>{r.why}</p>
                    <h4>Potential friction</h4>
                    <p>{r.friction}</p>
                  </div>
                  <div>
                    <h4>Shared threads</h4>
                    <div className="tags">
                      {r.sharedThreads.length ? (
                        r.sharedThreads.map((s) => <span key={s}>{s}</span>)
                      ) : (
                        <span>Different interests, new questions</span>
                      )}
                    </div>
                    <p className="score-breakdown">
                      Pre-date {r.compatibilityScore} ·{" "}
                      {r.dateScore !== null
                        ? `Post-date ${r.dateScore} · 70/30 blend`
                        : "Not yet dated"}
                      <br />
                      Evidence confidence <strong>{r.confidence}%</strong>
                    </p>
                    <div className="button-row">
                      {r.dateId &&
                        (onReplay ? (
                          <button
                            className="button small secondary"
                            onClick={() => onReplay(r.dateId!)}
                          >
                            <Play size={13} /> Replay date
                          </button>
                        ) : (
                          <Link
                            className="button small secondary"
                            href={`/demo/date/${r.dateId}`}
                          >
                            <Play size={13} /> Replay date
                          </Link>
                        ))}
                      {!onReplay && (
                        <Link
                          className="text-button"
                          href={`/demo/person/${candidate.id}`}
                        >
                          The read <ArrowUpRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {!rows.length && (
          <div className="empty-state">
            No mutual top-five connections yet. New conversations can change the
            plot.
          </div>
        )}
      </div>
      <p className="ranking-note">
        Compatibility is not democracy. A conversation score is a hypothesis,
        not a verdict on a person.
      </p>
    </>
  );
}
