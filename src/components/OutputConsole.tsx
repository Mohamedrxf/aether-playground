import { useState } from "react";
import { ChevronUp, ChevronDown, Terminal, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OutputLine {
  type: "stdout" | "stderr" | "status";
  content: string;
  timestamp?: string;
}

interface OutputConsoleProps {
  output: OutputLine[];
  isRunning?: boolean;
  executionTime?: number;
  onClear?: () => void;
}

export function OutputConsole({ 
  output, 
  isRunning = false,
  executionTime,
  onClear
}: OutputConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [height, setHeight] = useState(200);

  const hasErrors = output.some(line => line.type === "stderr");
  const hasOutput = output.length > 0;

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl border border-border/30 overflow-hidden transition-all duration-300",
        "bg-console-bg"
      )}
      style={{ height: isExpanded ? height : 48 }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 h-12 bg-secondary/30 border-b border-border/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Output</span>
          
          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-aether-warning animate-pulse" />
              <span className="text-xs text-aether-warning">Running...</span>
            </div>
          )}
          
          {!isRunning && hasOutput && (
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-aether-error" />
                  <span className="text-xs text-aether-error">Error</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-aether-success" />
                  <span className="text-xs text-aether-success">Success</span>
                </>
              )}
            </div>
          )}
          
          {executionTime !== undefined && !isRunning && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{executionTime}ms</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasOutput && onClear && (
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Console content */}
      {isExpanded && (
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          {output.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 italic">
              Output will appear here after running your code...
            </div>
          ) : (
            <div className="space-y-1">
              {output.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2 animate-fade-in-up",
                    line.type === "stdout" && "text-console-stdout",
                    line.type === "stderr" && "text-console-stderr",
                    line.type === "status" && "text-console-status"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {line.type === "stderr" && (
                    <span className="text-console-stderr">✗</span>
                  )}
                  {line.type === "stdout" && (
                    <span className="text-console-stdout">›</span>
                  )}
                  {line.type === "status" && (
                    <span className="text-console-status">⊙</span>
                  )}
                  <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resize handle */}
      {isExpanded && (
        <div
          className="h-1 cursor-ns-resize bg-border/20 hover:bg-primary/30 transition-colors"
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startHeight = height;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const delta = startY - moveEvent.clientY;
              setHeight(Math.max(100, Math.min(500, startHeight + delta)));
            };
            
            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        />
      )}
    </div>
  );
}

export type { OutputLine };
