import { Play, Zap, Settings, FileCode2, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileInput } from "@/components/ui/file-input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  autoDetect: boolean;
  onAutoDetectToggle: () => void;
  onRun: () => void;
  isRunning?: boolean;
  detectedLanguage?: string;
}

export function Toolbar({
  fileName,
  onFileNameChange,
  autoDetect,
  onAutoDetectToggle,
  onRun,
  isRunning = false,
  detectedLanguage
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4 glass-panel rounded-t-2xl border-b-0 rounded-b-none">
      {/* Left side - Logo & File */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Cpu className="w-6 h-6 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/30" />
          </div>
          <span className="text-lg font-semibold gradient-text">AETHER</span>
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* File input */}
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-muted-foreground" />
          <FileInput
            value={fileName}
            onChange={onFileNameChange}
            placeholder="main.py"
          />
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-4">
        {/* Auto-detect toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className={cn(
              "w-4 h-4 transition-colors",
              autoDetect ? "text-primary" : "text-muted-foreground"
            )} />
            <ToggleSwitch
              enabled={autoDetect}
              onToggle={onAutoDetectToggle}
              label="Auto-detect"
              glowWhenEnabled={true}
            />
          </div>
          
          {detectedLanguage && autoDetect && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              {detectedLanguage}
            </span>
          )}
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Settings */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </Button>

        {/* Run button */}
        <Button
          variant="gradient"
          size="lg"
          onClick={onRun}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Program
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
