"use client";
import type { CSSProperties } from "react";
import type { LifeState } from "@/lib/life/schema";
import { tasksForTick, type HouseholdTask } from "@/lib/life/tasks";
import { clock } from "@/lib/life/schema";

function BlockPerson({
  color,
  hair,
  prop,
  sleeping = false,
}: {
  color: string;
  hair: string;
  prop: HouseholdTask["prop"];
  sleeping?: boolean;
}) {
  return (
    <g className={`block-person ${sleeping ? "asleep" : ""}`}>
      <ellipse cx="0" cy="7" rx="24" ry="7" fill="#405440" opacity=".17" />
      <g className="block-body">
        <rect x="-16" y="-32" width="13" height="31" rx="2" fill="#535168" />
        <rect x="3" y="-32" width="13" height="31" rx="2" fill="#535168" />
        <rect x="-18" y="-5" width="15" height="8" rx="2" fill="#f7ece2" />
        <rect x="3" y="-5" width="15" height="8" rx="2" fill="#f7ece2" />
        <rect x="-20" y="-60" width="40" height="32" rx="3" fill={color} />
        <path d="M-20-60h40v7h-40" fill="white" opacity=".17" />
        <g className="block-arm">
          <rect x="-30" y="-56" width="10" height="30" rx="2" fill={color} />
          <rect x="-30" y="-32" width="10" height="8" fill="#edbd9c" />
        </g>
        <g className="block-arm tool-arm">
          <rect x="20" y="-56" width="10" height="30" rx="2" fill={color} />
          <rect x="20" y="-32" width="10" height="8" fill="#edbd9c" />
          {prop === "mug" && (
            <g>
              <rect
                x="22"
                y="-37"
                width="15"
                height="16"
                rx="2"
                fill="#ffefd0"
              />
              <path
                d="M37-34h5v10h-5"
                fill="none"
                stroke="#ffefd0"
                strokeWidth="3"
              />
              <path
                className="coffee-steam"
                d="M26-41v-9m6 9v-7"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
          {prop === "laptop" && (
            <g>
              <rect
                x="18"
                y="-43"
                width="29"
                height="19"
                rx="2"
                fill="#55677c"
              />
              <rect x="21" y="-40" width="23" height="13" fill="#adedd8" />
              <path
                d="M26-37l-3 3 3 3m10-6 3 3-3 3"
                stroke="#55677c"
                strokeWidth="2"
                fill="none"
              />
            </g>
          )}
          {prop === "pencil" && (
            <path d="M22-26l17-23" stroke="#ffc45c" strokeWidth="6" />
          )}
          {prop === "phone" && (
            <g>
              <rect
                x="24"
                y="-41"
                width="13"
                height="21"
                rx="2"
                fill="#695578"
              />
              <rect x="26" y="-38" width="9" height="13" fill="#f6c2d6" />
            </g>
          )}
          {prop === "flower" && (
            <g>
              <path d="M25-27l14 6" stroke="#80bec2" strokeWidth="8" />
              <path
                className="water-drops"
                d="M39-20l3 6m2-5 4 6"
                stroke="#85c9ee"
                strokeWidth="3"
              />
            </g>
          )}
          {prop === "ball" && (
            <circle
              cx="33"
              cy="-25"
              r="12"
              fill="#f4af77"
              stroke="#a56d51"
              strokeWidth="2"
            />
          )}
          {prop === "pan" && (
            <g>
              <path d="M23-25h15" stroke="#555367" strokeWidth="5" />
              <ellipse cx="45" cy="-25" rx="14" ry="6" fill="#555367" />
              <ellipse cx="45" cy="-27" rx="8" ry="3" fill="#ffc674" />
            </g>
          )}
          {prop === "broom" && (
            <g>
              <path d="M27-41l12 38" stroke="#9d775a" strokeWidth="4" />
              <path d="M32-8h14l5 12H29z" fill="#e8b859" />
            </g>
          )}
        </g>
        <rect x="-23" y="-99" width="46" height="40" rx="4" fill="#edbd9c" />
        <path d="M-23-96q0-10 12-10h24q10 0 10 10v12H-23z" fill={hair} />
        <rect x="-23" y="-86" width="7" height="15" fill={hair} />
        {sleeping ? (
          <path d="M-13-77h7m12 0h7" stroke="#56433e" strokeWidth="3" />
        ) : (
          <>
            <rect x="-12" y="-80" width="5" height="6" fill="#56433e" />
            <rect x="7" y="-80" width="5" height="6" fill="#56433e" />
          </>
        )}
        <path d="M-4-68q4 4 8 0" stroke="#a96563" strokeWidth="2" fill="none" />
        <rect
          x="-17"
          y="-72"
          width="7"
          height="3"
          fill="#ed9699"
          opacity=".7"
        />
        <rect x="10" y="-72" width="7" height="3" fill="#ed9699" opacity=".7" />
      </g>
      {sleeping && (
        <text x="15" y="-115" fill="#8b7ea7" fontSize="20">
          z z
        </text>
      )}
    </g>
  );
}
function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-12-10h24l-3 20H-9z" fill="#cc8d75" />
      <path d="M0-10v-22" stroke="#679374" strokeWidth="4" />
      <path
        d="M0-19q-25-25-17-30 20-2 17 30m0-4q22-29 25-13-3 17-25 13"
        fill="#82ac7b"
      />
    </g>
  );
}
export function HouseholdWorld({
  world,
  running,
  mode,
}: {
  world: LifeState;
  running: boolean;
  mode: "demo" | "model";
}) {
  const tasks = tasksForTick(world.tick),
    time = clock(world.tick),
    night = world.tick % 6 === 5;
  const completed = world.events.filter(
    (e) => e.mode === "demo" && e.kind === "scene",
  ).length;
  return (
    <section
      className={`household-world ${running ? "world-playing" : ""} ${night ? "world-night" : ""}`}
      aria-label="Animated fictional household"
    >
      <div className="world-heading">
        <div>
          <span className="world-kicker">A LITTLE LIFE / BLOCK WORLD</span>
          <h2>Home, sweet pixel.</h2>
        </div>
        <span className="world-live">{running ? "● LIVING" : "Ⅱ RESTING"}</span>
      </div>
      <div className="world-stage">
        <svg
          viewBox="0 0 660 510"
          role="img"
          aria-label={`Day ${time.day}, ${time.phase}. ${world.participants.map((p, i) => `${p.name}: ${tasks[i].label}`).join(". ")}`}
        >
          <defs>
            <pattern
              id="home-floor"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <rect width="30" height="30" fill="#eedcc0" />
              <path d="M0 30h30M30 0v30" stroke="#d8c3a3" strokeWidth="1" />
            </pattern>
            <pattern
              id="garden-grass"
              width="25"
              height="25"
              patternUnits="userSpaceOnUse"
            >
              <rect width="25" height="25" fill="#b9d4ad" />
              <path d="M8 15v-3m4 4v-5" stroke="#91b78c" />
            </pattern>
          </defs>
          <rect
            width="660"
            height="510"
            rx="18"
            fill={night ? "#b8b7cc" : "#d4e7d1"}
          />
          <rect
            x="25"
            y="365"
            width="610"
            height="123"
            rx="12"
            fill="url(#garden-grass)"
          />
          <path
            d="M35 388h590M35 380v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20m35-20v20"
            stroke="#fff3dc"
            strokeWidth="6"
          />
          <rect x="43" y="61" width="574" height="301" rx="8" fill="#9f826f" />
          <rect
            x="52"
            y="69"
            width="556"
            height="283"
            fill="url(#home-floor)"
          />
          <rect x="52" y="69" width="556" height="38" fill="#edbdaf" />
          <path d="M52 107h556" stroke="#c79683" strokeWidth="5" />
          <rect x="285" y="77" width="85" height="58" rx="3" fill="#ffefdb" />
          <rect
            x="292"
            y="83"
            width="71"
            height="45"
            fill={night ? "#768ba7" : "#b3d9e2"}
          />
          <path d="M328 83v45m-36-23h71" stroke="#ffefdb" strokeWidth="5" />
          <text x="75" y="96" className="room-label">
            THE STUDIO
          </text>
          <text x="430" y="96" className="room-label">
            SLOW CORNER
          </text>
          <g>
            <rect
              x="93"
              y="160"
              width="145"
              height="12"
              rx="3"
              fill="#b48b6c"
            />
            <path d="M103 172v35m125-35v35" stroke="#987456" strokeWidth="8" />
            <rect
              x="136"
              y="113"
              width="57"
              height="41"
              rx="4"
              fill="#596278"
            />
            <rect x="141" y="118" width="47" height="30" fill="#adedd8" />
            <path
              className="screen-lines"
              d="M147 127h24m-24 7h33m-33 7h18"
              stroke="#569e8b"
              strokeWidth="3"
            />
            <path d="M163 155v6" stroke="#596278" strokeWidth="5" />
          </g>
          <g>
            <rect
              x="260"
              y="160"
              width="113"
              height="12"
              rx="3"
              fill="#b48b6c"
            />
            <path d="M268 172v35m97-35v35" stroke="#987456" strokeWidth="8" />
            <rect
              x="277"
              y="135"
              width="63"
              height="23"
              rx="2"
              fill="#fff8e7"
            />
            <path
              d="M290 142h22v9h-22m2 0v5m18-5v5"
              stroke="#a5a1b4"
              strokeWidth="2"
              fill="none"
            />
          </g>
          <g>
            <rect
              x="412"
              y="137"
              width="146"
              height="65"
              rx="6"
              fill="#b2a3cc"
            />
            <rect
              x="421"
              y="143"
              width="59"
              height="20"
              rx="3"
              fill="#faf0e4"
            />
            <rect
              x="487"
              y="143"
              width="59"
              height="20"
              rx="3"
              fill="#faf0e4"
            />
            <rect
              x="420"
              y="170"
              width="131"
              height="36"
              rx="3"
              fill="#c9bfdf"
            />
          </g>
          <rect x="65" y="235" width="195" height="15" rx="3" fill="#f7ece0" />
          <rect x="65" y="250" width="195" height="47" rx="3" fill="#8caaa2" />
          <path d="M128 250v47m66-47v47" stroke="#6f928a" strokeWidth="2" />
          <rect x="83" y="219" width="39" height="20" fill="#5b6770" />
          <circle cx="96" cy="229" r="6" fill="#f1c475" />
          <circle cx="110" cy="229" r="5" fill="#f1c475" />
          <rect x="210" y="219" width="18" height="20" rx="3" fill="#d2a080" />
          <text x="72" y="329" className="room-label">
            COFFEE &amp; CHAOS
          </text>
          <rect x="326" y="245" width="206" height="65" rx="8" fill="#e4a3ad" />
          <rect x="337" y="256" width="80" height="43" rx="5" fill="#efbbc1" />
          <rect x="432" y="256" width="88" height="43" rx="5" fill="#efbbc1" />
          <rect x="325" y="258" width="17" height="56" rx="4" fill="#ca8e9b" />
          <rect x="520" y="258" width="17" height="56" rx="4" fill="#ca8e9b" />
          <rect x="357" y="326" width="147" height="13" rx="5" fill="#b58e70" />
          <rect x="397" y="320" width="16" height="9" rx="2" fill="#f9edcb" />
          <Plant x={580} y={297} />
          <Plant x={73} y={148} />
          <g>
            <rect
              x="65"
              y="436"
              width="145"
              height="28"
              rx="5"
              fill="#a18368"
            />
            {[85, 112, 140, 169, 193].map((x, i) => (
              <g key={x}>
                <path d={`M${x} 447v-23`} stroke="#749269" strokeWidth="3" />
                <circle
                  cx={x}
                  cy={421 + (i % 2) * 4}
                  r="7"
                  fill={i % 2 ? "#f7d28f" : "#ed9aaa"}
                />
                <circle cx={x} cy={421 + (i % 2) * 4} r="2" fill="#fff4c9" />
              </g>
            ))}
          </g>
          <g transform="translate(555 448) scale(.48)">
            <BlockPerson color="#d6b665" hair="#776356" prop="ball" />
          </g>
          <g transform="translate(600 448) scale(.48)">
            <BlockPerson color="#9cadd3" hair="#5e514c" prop="ball" />
          </g>
          <text x="293" y="468" className="room-label">
            THE LITTLE OUTSIDE
          </text>
          {world.participants.map((p, i) => (
            <g
              key={p.id}
              className="world-character"
              style={
                {
                  transform: `translate(${tasks[i].x}px, ${tasks[i].y}px)`,
                } as CSSProperties
              }
            >
              <BlockPerson
                color={i ? "#9eaccf" : "#d791a3"}
                hair={i ? "#554a49" : "#826153"}
                prop={tasks[i].prop}
                sleeping={night}
              />
              <g transform="translate(0 24)">
                <rect
                  x="-44"
                  y="-11"
                  width="88"
                  height="20"
                  rx="10"
                  fill="#fff6e7"
                />
                <text textAnchor="middle" y="3" fontSize="11" fill="#63584f">
                  {p.name.split(" ")[0]}
                </text>
              </g>
            </g>
          ))}
        </svg>
        <div className="world-scene-tag">
          {night ? "☾ LIGHTS OUT" : "✿ TWO CHARACTERS. ONE LITTLE HOME."}
        </div>
      </div>
      <div className="world-task-list">
        {world.participants.map((p, i) => (
          <article key={p.id} className="world-task">
            <div className="world-task-title">
              <span className={`pixel-face face-${i}`} aria-hidden="true">
                •ᴗ•
              </span>
              <div>
                <span>{p.name.split(" ")[0]}</span>
                <strong>{tasks[i].label}</strong>
              </div>
              <span className="world-task-state">
                {running ? "DOING" : "READY"}
              </span>
            </div>
            <div className="task-track" key={`${world.tick}:${running}`}>
              <span
                style={{ animationDuration: mode === "demo" ? "8s" : "9s" }}
              />
            </div>
            <p className="world-speech">
              “
              {mode === "demo"
                ? tasks[i].say
                : world.events
                    .slice()
                    .reverse()
                    .find((e) => e.agentId === p.id && e.kind === "text")
                    ?.text || tasks[i].say}
              ”
            </p>
          </article>
        ))}
      </div>
      <div className="world-footnote">
        <span>{completed} completed demo tasks in recent history</span>
        <span>
          {mode === "demo"
            ? "Authored demo · no API calls"
            : "Model dialogue · illustrated routines"}
        </span>
      </div>
    </section>
  );
}
