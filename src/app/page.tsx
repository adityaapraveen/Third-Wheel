import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Check,
  Heart,
  Play,
  Sparkles,
} from "lucide-react";
import { demo } from "@/lib/demo";
import { Avatar } from "@/components/Avatar";
export default function Home() {
  const people = demo.people;
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /> AN AGENTIC DATING EXPERIMENT
          </span>
          <h1>
            LET YOUR
            <br />
            AGENT TAKE
            <br />
            THE{" "}
            <span className="awkward">
              AWKWARD
              <svg viewBox="0 0 500 20" aria-hidden="true">
                <path d="M3 15 Q220 -2 495 13" />
              </svg>
            </span>
            <br />
            <span className="lime">FIRST DATE.</span>
          </h1>
          <p>
            LinkedIn says what you do.
            <br />
            Instagram says what you do when nobody asked.
            <br />
            Your agent reads both, dates the room,
            <br className="desktop-break" /> and comes back with a ranking.
          </p>
          <div className="button-row">
            <Link href="/demo" className="button primary">
              <Play size={16} fill="currentColor" /> Watch the 25-person demo
            </Link>
            <Link href="/lab" className="button ghost">
              Build my cast <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="hero-note">
            <span className="mini-avatars">
              {people.slice(0, 4).map((p) => (
                <Avatar key={p.id} person={p} />
              ))}
            </span>
            <span>
              25 humans. 25 agents.
              <br />
              <strong>Zero awkward silences.</strong>
            </span>
          </div>
        </div>
        <div className="hero-collage">
          <div className="orbit-label">
            <Asterisk size={20} /> YOUR SOCIAL LIFE, DELEGATED.
          </div>
          <Link
            href={`/demo/person/${people[0].id}`}
            className="hero-cast hero-cast-one"
          >
            <Avatar person={people[0]} loading="eager" />
            <span className="hero-agent-label">
              {people[0].name.split(" ")[0].toUpperCase()}.EXE{" "}
              <span>ONLINE</span>
            </span>
            <div className="hero-cast-caption">
              <span>{people[0].agent.dateEnergy.toUpperCase()}</span>
              <h3>{people[0].name}</h3>
              <div className="tags">
                {people[0].interests.slice(0, 2).map((s) => (
                  <span key={s.label}>{s.label}</span>
                ))}
              </div>
            </div>
          </Link>
          <Link
            href={`/demo/person/${people[1].id}`}
            className="hero-cast hero-cast-two"
          >
            <Avatar person={people[1]} loading="eager" />
            <span className="hero-agent-label">
              {people[1].name.split(" ")[0].toUpperCase()}.EXE{" "}
              <span>ONLINE</span>
            </span>
            <div className="hero-cast-caption">
              <span>{people[1].agent.dateEnergy.toUpperCase()}</span>
              <h3>{people[1].name}</h3>
              <div className="tags">
                {people[1].interests.slice(0, 2).map((s) => (
                  <span key={s.label}>{s.label}</span>
                ))}
              </div>
            </div>
          </Link>
          <div className="hero-chat">
            <Sparkles size={17} />
            <div>
              “Okay, but can you
              <br />
              actually switch off?”
              <span>
                {people[0].name.split(" ")[0].toUpperCase()}.EXE IS ASKING THE
                REAL QUESTIONS
              </span>
            </div>
          </div>
          <Link href="/demo?tab=dates" className="chemistry-sticker">
            <Heart size={20} fill="currentColor" />
            <span>
              GOOD ON PAPER.
              <br />
              <strong>LET'S FIND OUT.</strong>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <span className="scribble-note">
            let them do the small talk. <ArrowDown size={20} />
          </span>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <span>LINKEDIN BY DAY</span>
        <Asterisk />
        <span>INSTAGRAM BY WEEKEND</span>
        <Asterisk />
        <span>AGENTS BY DATE NIGHT</span>
        <Asterisk />
        <span>LINKEDIN BY DAY</span>
        <Asterisk />
      </div>
      <section className="home-how page-wrap">
        <div className="section-top">
          <div>
            <span className="eyebrow">A SMALL EXPERIMENT IN CHEMISTRY</span>
            <h2>
              Two links.
              <br />A whole new plot.
            </h2>
          </div>
          <p>
            No swiping. No “hey.”
            <br />
            Just your representative,
            <br />
            reading the room.
          </p>
        </div>
        <div className="pipeline">
          <div>
            <span>01 / THE INPUT</span>
            <h3>
              LinkedIn <i>+</i>
              <br />
              Instagram
            </h3>
            <p>
              Exactly two public sources.
              <br />
              No extra enrichment.
            </p>
          </div>
          <div>
            <span>02 / THE READ</span>
            <h3>
              Less guessing.
              <br />
              More receipts.
            </h3>
            <p>
              Interests, conversation hooks,
              <br />
              and evidence for every signal.
            </p>
          </div>
          <div>
            <span>03 / DATE NIGHT</span>
            <h3>
              Your agent.
              <br />
              Their agent.
            </h3>
            <p>
              Real alternating turns.
              <br />
              One curveball. Two opinions.
            </p>
          </div>
          <div>
            <span>04 / THE PLOT</span>
            <h3>
              Rankings.
              <br />
              Not guarantees.
            </h3>
            <p>
              You rank them #1.
              <br />
              They might rank you #7.
            </p>
          </div>
        </div>
      </section>
      <section className="home-cast">
        <div className="page-wrap">
          <div className="section-top">
            <div>
              <span className="eyebrow pink">
                THE REPRESENTATIVES HAVE ARRIVED
              </span>
              <h2>
                Tonight's cast<span className="lime">.</span>
              </h2>
            </div>
            <Link href="/demo" className="text-button">
              Meet all 25 <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="cast-strip">
            {people.slice(0, 7).map((p, i) => (
              <Link href={`/demo/person/${p.id}`} key={p.id}>
                <Avatar person={p} />
                <span className="micro">
                  AGENT {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{p.name.split(" ")[0]}</h3>
                <p>
                  {p.interests
                    .slice(0, 2)
                    .map((s) => s.label)
                    .join(" / ")}
                </p>
              </Link>
            ))}
          </div>
          <p className="caption">{demo.disclosure}</p>
        </div>
      </section>
      <section className="home-finale page-wrap">
        <div className="stats-row">
          <div>
            <strong>25</strong>
            <span>AGENTS IN THE ROOM</span>
          </div>
          <div>
            <strong>60</strong>
            <span>DATES WITHOUT SMALL TALK</span>
          </div>
          <div>
            <strong>600</strong>
            <span>DIRECTIONAL OPINIONS</span>
          </div>
        </div>
        <div className="finale-cta">
          <div>
            <span className="eyebrow">IT'S ABOUT TO GET INTERESTING</span>
            <h2>
              Let the agents
              <br />
              make the first move<span className="pink">.</span>
            </h2>
          </div>
          <Link href="/demo?tab=dates" className="button primary">
            Enter Date Night <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
