import { useState, useCallback } from "react";
import { Toolbar } from "@/components/Toolbar";
import { CodeEditor } from "@/components/CodeEditor";
import { OutputConsole, OutputLine } from "@/components/OutputConsole";

// Language detection based on file extension and code patterns
const detectLanguage = (fileName: string, code: string): string => {
  // Check file extension first
  const ext = fileName.split(".").pop()?.toLowerCase();
  const extMap: Record<string, string> = {
    py: "Python",
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "React JSX",
    tsx: "React TSX",
    java: "Java",
    cpp: "C++",
    c: "C",
    go: "Go",
    rs: "Rust",
    rb: "Ruby",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    cs: "C#",
    sh: "Bash",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    json: "JSON",
  };

  if (ext && extMap[ext]) return extMap[ext];

  // Pattern-based detection
  if (code.includes("def ") && code.includes(":")) return "Python";
  if (code.includes("function ") || code.includes("const ") || code.includes("=>")) return "JavaScript";
  if (code.includes("public static void main")) return "Java";
  if (code.includes("#include")) return "C/C++";
  if (code.includes("func ") && code.includes("package ")) return "Go";
  if (code.includes("fn ") && code.includes("let ")) return "Rust";

  return "Unknown";
};

// Simulate code execution
const simulateExecution = async (
  code: string,
  language: string,
  onOutput: (line: OutputLine) => void
): Promise<number> => {
  const startTime = Date.now();

  onOutput({ type: "status", content: `Executing ${language} code...` });

  await new Promise((r) => setTimeout(r, 500));

  // Simulate different outputs based on code content
  if (code.includes("print") || code.includes("console.log") || code.includes("System.out")) {
    const matches = code.match(/(?:print|console\.log|System\.out\.println)\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (matches) {
      for (const match of matches) {
        const content = match.match(/["']([^"']+)["']/)?.[1] || "";
        await new Promise((r) => setTimeout(r, 100));
        onOutput({ type: "stdout", content });
      }
    } else {
      onOutput({ type: "stdout", content: "Hello, World!" });
    }
  }

  if (code.includes("error") || code.includes("Error") || code.includes("throw")) {
    await new Promise((r) => setTimeout(r, 200));
    onOutput({ type: "stderr", content: "RuntimeError: An error occurred during execution" });
  }

  await new Promise((r) => setTimeout(r, 300));
  onOutput({ type: "status", content: "Process exited with code 0" });

  return Date.now() - startTime;
};

export function AetherIDE() {
  const [fileName, setFileName] = useState("main.py");
  const [autoDetect, setAutoDetect] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>();

  const detectedLanguage = autoDetect ? detectLanguage(fileName, code) : undefined;

  const handleRun = useCallback(async () => {
    if (!code.trim() || isRunning) return;

    setIsRunning(true);
    setOutput([]);
    setExecutionTime(undefined);

    const language = detectedLanguage || "Unknown";
    
    const time = await simulateExecution(code, language, (line) => {
      setOutput((prev) => [...prev, line]);
    });

    setExecutionTime(time);
    setIsRunning(false);
  }, [code, detectedLanguage, isRunning]);

  const handleClearOutput = () => {
    setOutput([]);
    setExecutionTime(undefined);
  };

  return (
    <div className="flex flex-col h-screen w-full p-6 bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-aether-info/5 rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="relative flex flex-col flex-1 max-w-7xl mx-auto w-full rounded-2xl overflow-hidden shadow-lg border border-border/30">
        {/* Toolbar */}
        <Toolbar
          fileName={fileName}
          onFileNameChange={setFileName}
          autoDetect={autoDetect}
          onAutoDetectToggle={() => setAutoDetect(!autoDetect)}
          onRun={handleRun}
          isRunning={isRunning}
          detectedLanguage={detectedLanguage}
        />

        {/* Editor area */}
        <div className="flex-1 min-h-0 p-4 bg-card/50 border-x border-border/30">
          <CodeEditor
            code={code}
            onChange={setCode}
            language={detectedLanguage}
          />
        </div>

        {/* Output console */}
        <div className="px-4 pb-4 bg-card/50 border-x border-b border-border/30 rounded-b-2xl">
          <OutputConsole
            output={output}
            isRunning={isRunning}
            executionTime={executionTime}
            onClear={handleClearOutput}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Powered by</span>
        <span className="gradient-text font-medium">AETHER</span>
        <span>• Secure Isolated Execution</span>
      </div>
    </div>
  );
}
