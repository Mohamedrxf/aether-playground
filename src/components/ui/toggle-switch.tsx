import { cn } from "@/lib/utils";

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
  glowWhenEnabled?: boolean;
}

export function ToggleSwitch({ 
  enabled, 
  onToggle, 
  label,
  glowWhenEnabled = true 
}: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 group"
    >
      {label && (
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-all duration-300",
          enabled 
            ? "bg-primary" 
            : "bg-secondary",
          enabled && glowWhenEnabled && "shadow-glow animate-glow-pulse"
        )}
      >
        <div
          className={cn(
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-foreground transition-all duration-300",
            enabled && "translate-x-5"
          )}
        />
      </div>
    </button>
  );
}
