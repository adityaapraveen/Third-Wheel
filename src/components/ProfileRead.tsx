"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  dimensions,
  dimensionLabels,
  type Persona,
  type Signal,
} from "@/lib/persona/schema";
import { Avatar } from "./Avatar";
import { EvidenceDrawer } from "./EvidenceDrawer";
function Signals({
  title,
  signals,
  empty,
}: {
  title: string;
  signals: Signal[];
  empty: string;
}) {
  return (
    <section className="read-section">
      <h3>{title}</h3>
      {signals.length ? (
        <div className="signal-list">
          {signals.map((s) => (
            <div key={s.label}>
              <span>{s.label}</span>
              <span className="confidence-small">
                {s.confidence}% <span>confidence</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}
export function ProfileRead({
  person,
  dateHref,
  onDate,
  onBack,
}: {
  person: Persona;
  dateHref?: string;
  onDate?: () => void;
  onBack?: () => void;
}) {
  const [receipts, setReceipts] = useState(false);
  return (
    <div className="page-wrap profile-page">
      {onBack ? (
        <button className="back-link" onClick={onBack}>
          <ChevronLeft size={16} /> Back to your cast
        </button>
      ) : (
        <Link className="back-link" href="/demo">
          <ChevronLeft size={16} /> Back to the cast
        </Link>
      )}
      <div className="profile-hero">
        <div className="profile-portrait">
          <Avatar person={person} loading="eager" />
          <div className="portrait-sticker">
            <Sparkles size={18} /> YOUR REPRESENTATIVE
            <br />
            HAS ENTERED THE VILLA.
          </div>
          <span className="portrait-caption">
            {person.fictional
              ? "FICTIONAL CAST MEMBER"
              : "CONSENTED PUBLIC-INTEREST CARD"}
          </span>
        </div>
        <div className="profile-intro">
          <span className="eyebrow">MEET THE HUMAN. THEN MEET THE AGENT.</span>
          <h1>
            {person.name}
            <span className="lime">.</span>
          </h1>
          <p className="profile-headline">{person.headline}</p>
          <div className="source-badges">
            {(["linkedin", "instagram"] as const).map((source) =>
              person.fictional ? (
                <span className={`source-pill ${source}`} key={source}>
                  {source === "linkedin" ? "in" : "◎"}{" "}
                  {source === "linkedin" ? "LinkedIn" : "Instagram"} fixture
                </span>
              ) : (
                <a
                  className={`source-pill ${source}`}
                  key={source}
                  href={
                    source === "linkedin"
                      ? person.sources.linkedinUrl
                      : person.sources.instagramUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source === "linkedin" ? "in" : "◎"}{" "}
                  {source === "linkedin" ? "LinkedIn" : "Instagram"}{" "}
                  <Check size={12} />
                </a>
              ),
            )}
            <span
              className={`source-pill ${person.identityConfidence < 65 ? "uncertain" : "lock"}`}
            >
              <ShieldCheck size={13} /> Source Lock {person.identityConfidence}%
            </span>
          </div>
          {person.identityConfidence < 65 && (
            <p className="warning">
              Source Lock uncertain. These profiles may belong to different
              people.
            </p>
          )}
          <div className="the-read">
            <span className="micro lime">THE READ</span>
            <h2>“{person.oneLineRead}”</h2>
          </div>
          <div className="button-row">
            {dateHref ? (
              <Link className="button primary" href={dateHref}>
                Take the first date <ArrowUpRight size={17} />
              </Link>
            ) : onDate ? (
              <button className="button primary" onClick={onDate}>
                Choose a date <ArrowUpRight size={17} />
              </button>
            ) : null}
            <button
              className="button secondary"
              onClick={() => setReceipts(true)}
            >
              <FileText size={16} /> See the receipts
            </button>
          </div>
          <p className="caption">
            {person.fictional
              ? "Fictional preferences, authored for this experiment."
              : "Romantic needs and preferences are not inferred. Neutral sliders mean “unknown.”"}{" "}
            {person.analysisMode === "fallback"
              ? "Deterministic public-interest fallback."
              : ""}
          </p>
        </div>
      </div>
      <div className="profile-details">
        <div className="read-main">
          <Signals
            title="Needs"
            signals={person.needs}
            empty="Not inferred from social profiles. Romantic needs belong to the participant to describe."
          />
          <Signals
            title="Hobbies"
            signals={person.hobbies}
            empty="No clearly evidenced hobbies in the public snippets."
          />
          <Signals
            title="Interests"
            signals={person.interests}
            empty="Not enough source material to identify specific interests."
          />
          <div className="two-cols">
            <section className="read-section">
              <h3>Social rhythm</h3>
              <p>{person.socialRhythm}</p>
            </section>
            <section className="read-section">
              <h3>Communication style</h3>
              <p>{person.communicationStyle}</p>
            </section>
          </div>
          <section className="read-section statement-section">
            <span className="micro">WOULD TALK FOR TWO HOURS ABOUT</span>
            <h3>
              {person.twoHourTopic}
              <span className="lime"> ↗</span>
            </h3>
          </section>
          <section className="read-section">
            <h3>Ideal low-pressure date</h3>
            <p>{person.idealLowPressureDate}</p>
          </section>
          <section className="strategy">
            <Bookmark size={20} />
            <div>
              <span className="micro">AGENT STRATEGY</span>
              <h3>{person.agent.openingStyle}</h3>
              <p>{person.agent.conversationStyle}</p>
            </div>
          </section>
        </div>
        <aside className="read-sidebar">
          <div className="panel">
            <span className="eyebrow">THE ENERGY, ON PAPER</span>
            {dimensions.map((d) => (
              <div className="trait" key={d}>
                <div>
                  <span>{dimensionLabels[d]}</span>
                  <span>
                    {person.datingRead[d]}
                    <span className="muted"> / 100</span>
                  </span>
                </div>
                <div className="trait-track">
                  <span style={{ width: `${person.datingRead[d]}%` }} />
                </div>
              </div>
            ))}
            <p className="caption">
              {person.fictional
                ? "A fictional character vector, not a psychological assessment."
                : "Unknown traits stay at a neutral 50. Not a psychological assessment."}
            </p>
          </div>
          <div className="panel source-quality">
            <span className="eyebrow">HOW MUCH DO WE KNOW?</span>
            {(["linkedin", "instagram", "overall"] as const).map((s) => (
              <div key={s}>
                <span>
                  {s === "linkedin"
                    ? "LinkedIn"
                    : s === "instagram"
                      ? "Instagram"
                      : "Overall evidence"}
                </span>
                <strong>{person.confidence[s]}%</strong>
                <div className="quality-track">
                  <span style={{ width: `${person.confidence[s]}%` }} />
                </div>
              </div>
            ))}
            <button className="text-button" onClick={() => setReceipts(true)}>
              Show the evidence <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="identity-note">
            <ShieldCheck size={20} />
            <p>
              {person.identitySignals[0]}
              <br />
              <span className="muted">
                {person.fictional
                  ? "Fixture identity, not externally verified."
                  : "A name match is a clue, not proof of identity."}
              </span>
            </p>
          </div>
        </aside>
      </div>
      {receipts && (
        <EvidenceDrawer person={person} onClose={() => setReceipts(false)} />
      )}
    </div>
  );
}
