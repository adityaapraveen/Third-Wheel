"use client";
import { useState } from "react";
import type { Persona } from "@/lib/persona/schema";
export function Avatar({
  person,
  className = "",
  loading = "lazy",
}: {
  person: Pick<Persona, "avatarUrl" | "name" | "id">;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`avatar ${className}`}
      style={
        {
          "--avatar-hue": `${[...person.id].reduce((s, c) => s + c.charCodeAt(0), 0) % 360}deg`,
        } as React.CSSProperties
      }
    >
      {person.avatarUrl && !failed ? (
        <img
          src={person.avatarUrl}
          alt={person.name}
          loading={loading}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          {person.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
      )}
    </div>
  );
}
