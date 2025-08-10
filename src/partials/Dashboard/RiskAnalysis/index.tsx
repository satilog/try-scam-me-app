"use client";

import React from "react";
import { Speaker } from "../Speakers";
import { CheckCircle2, AlertTriangle, Siren, Info } from "lucide-react";

type RiskLevel = "neutral" | "safe" | "cautious" | "alert";
type IconType = React.ComponentType<{ className?: string }>;

interface RiskAnalysisProps {
  level?: RiskLevel;            // explicit level (optional)
  rationale?: string;           // short explanation
  knownCallerName?: string;     // shown when safe
  speakers?: Speaker[];         // derive level if provided
  defaultLevel?: RiskLevel;     // preview when no data
  defaultRationale?: string;    // preview text
  className?: string;
}

const ORDER: RiskLevel[] = ["neutral", "safe", "cautious", "alert"];

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  level,
  rationale,
  knownCallerName,
  speakers = [],
  defaultLevel = "neutral",
  defaultRationale,
  className,
}) => {
  const derived: RiskLevel = level ?? deriveFromSpeakers(speakers) ?? defaultLevel;

  // Use knownCallerName if provided, otherwise just use the first speaker's name
  const knownName = knownCallerName || speakers[0]?.name;

  const theme = THEME[derived];

  const title =
    derived === "alert" ? "Alert" :
    derived === "cautious" ? "Caution" :
    derived === "safe" ? "Safe" : "Neutral";

  const subtitle =
    derived === "alert" ? "Highly likely to be a scammer." :
    derived === "cautious" ? "Potential scammer. Proceed carefully." :
    derived === "safe" ? (knownName ? `Known caller: ${knownName}` : "Known caller.") :
    "Listening… awaiting more evidence.";

  const rationaleText =
    rationale ?? defaultRationale ?? autoRationale(derived, Boolean(knownName));

  const stepIndex = ORDER.indexOf(derived);
  const leftPct = (stepIndex / (ORDER.length - 1)) * 100;

  return (
    <div className={["flex flex-col items-center text-center", className ?? ""].join(" ")}>
      {/* Centered status icon */}
      <div className={["h-36 w-36 rounded-full flex items-center justify-center border-4", theme.iconBg, theme.iconBorder].join(" ")}>
        <theme.Icon className={["h-24 w-24", theme.icon].join(" ")} />
      </div>

      {/* One-word title + brief text */}
      <h3 className={["mt-3 text-3xl font-semibold tracking-wide", theme.title].join(" ")}>{title}</h3>
      <p className="mt-1 text-md text-dark-85">{subtitle}</p>

      {/* Rationale */}
      <p className={["mt-2 text-md", theme.rationale].join(" ")}>{rationaleText}</p>

      {/* 4-step risk scale */}
      {/* <div className="mt-6 w-full">
        <div className="relative">
          <div className="h-2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `calc(${leftPct}% - 10px)` }}
          >
            <div className={["h-5 w-5 rounded-full ring-4 ring-white shadow", theme.dot].join(" ")} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 text-[11px] text-dark-85 opacity-75">
          {ORDER.map((l) => (
            <div
              key={l}
              className={["text-center uppercase tracking-wide", l === derived ? theme.labelActive : ""].join(" ")}
            >
              {labelFor(l)}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default RiskAnalysis;

/* ---------------- helpers & theme ---------------- */

function deriveFromSpeakers(speakers: Speaker[]): RiskLevel | null {
  if (!speakers || speakers.length === 0) return null;
  const hasHigh = speakers.some((s: any) => s.scamRisk === "high");
  const hasMed  = speakers.some((s: any) => s.scamRisk === "medium");
  const hasKnown = speakers.some((s: any) => s.isKnown === true);
  if (hasHigh) return "alert";
  if (hasMed) return "cautious";
  if (hasKnown) return "safe";
  return "neutral";
}

function autoRationale(level: RiskLevel, hasKnown: boolean) {
  switch (level) {
    case "alert":
      return "Urgency, payment/OTP requests, and identity spoofing cues detected.";
    case "cautious":
      return "Inconsistent claims and pressure language observed.";
    case "safe":
      return hasKnown
        ? "Matches your safe list with no suspicious behavior."
        : "No suspicious signals detected.";
    default:
      return "Not enough speech analyzed yet to make a determination.";
  }
}

function labelFor(l: RiskLevel) {
  if (l === "neutral") return "Neutral";
  if (l === "safe") return "Safe";
  if (l === "cautious") return "Caution";
  return "Alert";
}

const THEME: Record<
  RiskLevel,
  {
    Icon: IconType;     // single Icon prop (fixed)
    iconBg: string;
    iconBorder: string;
    icon: string;
    title: string;
    rationale: string;
    dot: string;
    labelActive: string;
  }
> = {
  neutral: {
    Icon: Info,
    iconBg: "bg-elevation",
    iconBorder: "border-dark-85",
    icon: "text-dark-85",
    title: "text-dark",
    rationale: "text-dark-85",
    dot: "bg-dark-85",
    labelActive: "text-dark font-medium",
  },
  safe: {
    Icon: CheckCircle2,
    iconBg: "bg-success-bg",
    iconBorder: "border-success",
    icon: "text-success",
    title: "text-success",
    rationale: "text-success",
    dot: "bg-success",
    labelActive: "text-success font-medium",
  },
  cautious: {
    Icon: AlertTriangle,
    iconBg: "bg-warning-bg",
    iconBorder: "border-warning",
    icon: "text-warning",
    title: "text-warning",
    rationale: "text-warning",
    dot: "bg-warning",
    labelActive: "text-warning font-medium",
  },
  alert: {
    Icon: Siren,        // only one icon key
    iconBg: "bg-danger-bg",
    iconBorder: "border-danger",
    icon: "text-danger",
    title: "text-danger",
    rationale: "text-danger",
    dot: "bg-danger",
    labelActive: "text-danger font-medium",
  },
};
