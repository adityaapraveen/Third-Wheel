"use client";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Persona } from "@/lib/persona/schema";
import { Avatar } from "./Avatar";
export function PersonCard({
  person,
  index = 0,
  onOpen,
}: {
  person: Persona;
  index?: number;
  onOpen?: () => void;
}) {
  const body = (
    <>
      <div className="cast-photo">
        <Avatar person={person} />
        <span className="agent-tag">
          <span className="status-dot" /> AGENT{" "}
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="card-open">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="person-info">
        <span className="micro">{person.headline.split(" · ")[0]}</span>
        <h3>{person.name}</h3>
        <p>{person.oneLineRead}</p>
        <div className="tags">
          {person.interests.slice(0, 3).map((s) => (
            <span key={s.label}>{s.label}</span>
          ))}
        </div>
        <span className="card-foot">
          <Sparkles size={13} /> {person.agent.dateEnergy}
        </span>
      </div>
    </>
  );
  return onOpen ? (
    <button className="person-card" onClick={onOpen}>
      {body}
    </button>
  ) : (
    <Link href={`/demo/person/${person.id}`} className="person-card">
      {body}
    </Link>
  );
}
