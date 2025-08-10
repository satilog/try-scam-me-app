"use client";

import React, { useState, useEffect } from "react";
import { Speaker } from "../Speakers";
import { CheckCircle2, AlertTriangle, Siren, Info, LucideProps } from "lucide-react";

type RiskLevel = "neutral" | "safe" | "cautious" | "alert";
type IconType = React.ComponentType<LucideProps>;

interface RiskAnalysisProps {
  level?: RiskLevel; // explicit level (optional)
  rationale?: string; // short explanation
  knownCallerName?: string; // shown when safe
  speakers?: Speaker[]; // derive level if provided
  defaultLevel?: RiskLevel; // preview when no data
  defaultRationale?: string; // preview text
  isCallerSafe?: boolean; // override to force safe state
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
  isCallerSafe = false,
  className,
}) => {
  // Track the highest risk level reached (sticky alert behavior)
  const [maxRiskLevel, setMaxRiskLevel] = useState<RiskLevel>(defaultLevel);
  // Track the best rationale message (sticky rationale behavior)
  const [bestRationale, setBestRationale] = useState<string>("");

  // Determine current risk level
  const currentLevel: RiskLevel = isCallerSafe 
    ? "safe" 
    : (level ?? deriveFromSpeakers(speakers) ?? defaultLevel);

  // Update max risk level if current level is higher (unless safe overrides)
  useEffect(() => {
    if (isCallerSafe) {
      // Safe always takes precedence - reset to safe
      setMaxRiskLevel("safe");
    } else if (currentLevel === "alert") {
      // Once alert is reached, keep it
      setMaxRiskLevel("alert");
    } else if (currentLevel === "cautious" && maxRiskLevel !== "alert") {
      // Only update to cautious if we haven't reached alert yet
      setMaxRiskLevel("cautious");
    } else if (maxRiskLevel === "neutral") {
      // Only update from neutral if we're still at neutral
      setMaxRiskLevel(currentLevel);
    }
  }, [currentLevel, isCallerSafe, maxRiskLevel]);

  // Update rationale with sticky behavior - preserve meaningful messages
  useEffect(() => {
    const currentRationale = rationale || defaultRationale || "";
    
    // Don't replace existing meaningful rationale with error messages or generic text
    const isErrorMessage = currentRationale.toLowerCase().includes("unable to aggregate") ||
                          currentRationale.toLowerCase().includes("error") ||
                          currentRationale.toLowerCase().includes("analyzing conversation");
    
    // Only update rationale if:
    // 1. We don't have a rationale yet, OR
    // 2. Current rationale is meaningful (not an error message), OR  
    // 3. We're overriding with safe caller rationale
    if (!bestRationale || (!isErrorMessage && currentRationale.trim()) || isCallerSafe) {
      setBestRationale(currentRationale);
    }
  }, [rationale, defaultRationale, bestRationale, isCallerSafe]);

  // Use the sticky max risk level for display
  const derived: RiskLevel = maxRiskLevel;

  // Use knownCallerName if provided, otherwise just use the first speaker's name
  const knownName = knownCallerName || speakers[0]?.name;

  const theme = THEME[derived];

  const title =
    derived === "alert"
      ? "Alert"
      : derived === "cautious"
      ? "Caution"
      : derived === "safe"
      ? "Safe"
      : "Neutral";

  const subtitle =
    derived === "alert"
      ? "Highly likely to be a scammer."
      : derived === "cautious"
      ? "Potential scammer. Proceed carefully."
      : derived === "safe"
      ? knownName
        ? `Known caller: ${knownName}`
        : "Known caller."
      : "Listening… awaiting more evidence.";

  const rationaleText =
    bestRationale || autoRationale(derived, Boolean(knownName));

  const stepIndex = ORDER.indexOf(derived);
  const leftPct = (stepIndex / (ORDER.length - 1)) * 100;

  return (
    <div
      className={[
        "flex flex-col items-center text-center",
        className ?? "",
      ].join(" ")}
    >
      {/* Centered status icon */}
      {derived === "alert" ? (
        <div
          className={[
            "h-36 w-36 rounded-full flex items-center justify-center border-4",
            theme.iconBg,
            theme.iconBorder,
          ].join(" ")}
        >
          <theme.Icon strokeWidth={1.5} className={["h-24 w-24", theme.icon].join(" ")} />
        </div>
      ) : (
        <theme.Icon strokeWidth={1.5} className={["h-36 w-36", theme.icon].join(" ")} />
      )}

      {/* One-word title + brief text */}
      <h3
        className={[
          "mt-3 text-3xl font-semibold tracking-wide",
          theme.title,
        ].join(" ")}
      >
        {title}
      </h3>
      <p className="mt-1 text-md text-dark-85">{subtitle}</p>

      {/* Rationale */}
      <p className={["mt-2 text-md", theme.rationale].join(" ")}>
        {rationaleText}
      </p>

    </div>
  );
};

export default RiskAnalysis;

/* ---------------- helpers & theme ---------------- */

function deriveFromSpeakers(speakers: Speaker[]): RiskLevel | null {
  if (!speakers || speakers.length === 0) return null;
  const hasHigh = speakers.some((s: any) => s.scamRisk === "high");
  const hasMed = speakers.some((s: any) => s.scamRisk === "medium");
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
    Icon: IconType; // single Icon prop (fixed)
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
    iconBg: "bg-neutral-bg",
    iconBorder: "border-neutral",
    icon: "text-neutral",
    title: "text-neutral",
    rationale: "text-neutral",
    dot: "bg-neutral",
    labelActive: "text-neutral font-medium",
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
    Icon: Siren, // only one icon key
    iconBg: "bg-danger-bg",
    iconBorder: "border-danger",
    icon: "text-danger",
    title: "text-danger",
    rationale: "text-danger",
    dot: "bg-danger",
    labelActive: "text-danger font-medium",
  },
};
