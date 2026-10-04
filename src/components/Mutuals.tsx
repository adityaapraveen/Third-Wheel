"use client";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import type { Persona, Ranking } from "@/lib/persona/schema";
import { isMutual } from "@/lib/matching/ranking";
import { Avatar } from "./Avatar";
export function Mutuals({
  people,
  rankings,
}: {
  people: Persona[];
  rankings: Record<string, Ranking[]>;
}) {
  const pairs = people
    .flatMap((a, i) =>
      people
        .slice(i + 1)
        .filter((b) => isMutual(rankings, a.id, b.id))
        .map((b) => ({
          a,
          b,
          ar: rankings[a.id].find((r) => r.candidateId === b.id)!,
          br: rankings[b.id].find((r) => r.candidateId === a.id)!,
        })),
    )
    .sort(
      (x, y) =>
        y.ar.finalScore + y.br.finalScore - (x.ar.finalScore + x.br.finalScore),
    );
  return (
    <>
      <div className="tab-intro">
        <span className="eyebrow pink">THE FEELING IS MUTUAL</span>
        <h2>Both said “top five.”</h2>
        <p className="muted">
          {pairs.length} reciprocal connections. A little less one-sided.
        </p>
      </div>
      <div className="mutual-grid">
        {pairs.map(({ a, b, ar, br }) => (
          <Link
            className="mutual-card"
            href={`/demo/rankings/${a.id}`}
            key={`${a.id}-${b.id}`}
          >
            <div className="mutual-avatars">
              <Avatar person={a} />
              <Heart size={24} />
              <Avatar person={b} />
            </div>
            <h3>
              {a.name.split(" ")[0]} <span className="muted">&</span>{" "}
              {b.name.split(" ")[0]}
            </h3>
            <div className="mutual-directions">
              <span>
                {a.name.split(" ")[0]} → {b.name.split(" ")[0]}
                <strong>
                  {ar.finalScore} <small>#{ar.rank}</small>
                </strong>
              </span>
              <span>
                {b.name.split(" ")[0]} → {a.name.split(" ")[0]}
                <strong>
                  {br.finalScore} <small>#{br.rank}</small>
                </strong>
              </span>
            </div>
            <span className="text-button">
              Explore the connection <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
