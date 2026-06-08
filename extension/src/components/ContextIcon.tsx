import {
  Briefcase,
  Flask,
  Users,
  Bag,
  Microphone,
  Ghost,
} from "@phosphor-icons/react";
import type { TabContext } from "@tabby/types";

interface ContextIconProps {
  context: TabContext;
  size?: number;
}

const CONTEXT_COLORS: Record<TabContext, string> = {
  work: "var(--context-work)",
  research: "var(--context-research)",
  social: "var(--context-social)",
  entertainment: "var(--context-entertainment)",
  shopping: "var(--context-shopping)",
  unknown: "var(--context-unknown)",
};

const CONTEXT_ICONS: Record<TabContext, typeof Briefcase> = {
  work: Briefcase,
  research: Flask,
  social: Users,
  entertainment: Microphone,
  shopping: Bag,
  unknown: Ghost,
};

// ─── Component ───────────────────────────────────────────────

const ContextIcon = ({ context, size = 16 }: ContextIconProps) => {
  const Icon = CONTEXT_ICONS[context];
  const color = CONTEXT_COLORS[context];

  return <Icon size={size} color={color} weight="fill" />;
};

export default ContextIcon;
