"use client";
import { useEffect, useRef } from "react";
import { X, Quote, ExternalLink, Link2 } from "lucide-react";
import type { Persona } from "@/lib/persona/schema";
export function EvidenceDrawer({
  person,
  onClose,
}: {
  person: Persona;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      className="evidence-dialog"
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-inner">
        <div className="section-top">
          <div>
            <span className="eyebrow">NO VIBES WITHOUT EVIDENCE</span>
            <h2>
              The receipts<span className="lime">.</span>
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close receipts"
          >
            <X />
          </button>
        </div>
        <p className="muted">
          {person.fictional
            ? "Authored source fixtures for this fictional character. These are not real social profiles."
            : "Short snippets from exactly the two submitted public sources. Inferences can be wrong."}
        </p>
        <div className="receipt-signals">
          {[...person.needs, ...person.hobbies, ...person.interests]
            .slice(0, 8)
            .map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <span>{s.label}</span>
                <span className="micro">
                  {s.confidence}% confidence · {s.evidenceIds.join(", ")}
                </span>
              </div>
            ))}
        </div>
        {person.evidence.map((e) => (
          <article className="receipt" key={e.id}>
            <div>
              <span
                className={
                  e.source === "linkedin"
                    ? "source-pill linkedin"
                    : "source-pill instagram"
                }
              >
                {e.source === "linkedin" ? "in" : "◎"} {e.source}
              </span>
              <span className="micro">{e.id}</span>
            </div>
            <blockquote>
              <Quote size={16} />
              {e.text}
            </blockquote>
            <span className="micro">{e.context}</span>
            {!person.fictional && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={
                  e.source === "linkedin"
                    ? person.sources.linkedinUrl
                    : person.sources.instagramUrl
                }
              >
                View public source <ExternalLink size={13} />
              </a>
            )}
          </article>
        ))}
        <p className="caption">
          <Link2 size={14} /> Evidence confidence is separate from
          compatibility.
        </p>
      </div>
    </dialog>
  );
}
