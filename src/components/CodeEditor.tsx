import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  placeholder?: string;
  language?: string;
}

export function CodeEditor({ 
  code, 
  onChange, 
  placeholder = "Paste your code here. Language will be detected automatically.",
  language
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = code.split("\n").length;
    setLineCount(Math.max(lines, 20));
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      onChange(newValue);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-xl bg-editor-bg border border-border/30">
      {/* Language badge */}
      {language && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-primary/20 text-primary border border-primary/30">
            {language}
          </span>
        </div>
      )}
      
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-14 py-4 overflow-hidden select-none bg-editor-line/30 border-r border-border/20"
      >
        <div className="flex flex-col items-end pr-3">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i + 1}
              className="text-xs font-mono leading-6 text-editor-line-number"
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(
          "flex-1 w-full h-full py-4 px-4 resize-none",
          "bg-transparent text-foreground font-mono text-sm leading-6",
          "placeholder:text-muted-foreground/50 placeholder:italic",
          "focus:outline-none",
          "scrollbar-thin"
        )}
      />

      {/* Cursor line highlight overlay - visual only */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}
