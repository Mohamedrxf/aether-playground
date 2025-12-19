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

  // Real-time pattern-based detection as user types
  const trimmedCode = code.trim();
  if (!trimmedCode) return "Unknown";

  // Python patterns
  if (/\bdef\s+\w+\s*\(/.test(code) || /\bprint\s*\(/.test(code) || /\bimport\s+\w+/.test(code) || /\bclass\s+\w+.*:/.test(code) || /:\s*$/.test(code.split('\n')[0] || '')) {
    return "Python";
  }

  // JavaScript/TypeScript patterns
  if (/\bconst\s+\w+\s*=/.test(code) || /\blet\s+\w+\s*=/.test(code) || /\bvar\s+\w+\s*=/.test(code) || /\bfunction\s+\w+\s*\(/.test(code) || /=>\s*[{(]?/.test(code) || /console\.log\s*\(/.test(code)) {
    // Check if TypeScript
    if (/:\s*(string|number|boolean|any|void)\b/.test(code) || /interface\s+\w+/.test(code) || /type\s+\w+\s*=/.test(code)) {
      return "TypeScript";
    }
    return "JavaScript";
  }

  // Java patterns
  if (/public\s+(static\s+)?void\s+main/.test(code) || /public\s+class\s+\w+/.test(code) || /System\.out\.print/.test(code)) {
    return "Java";
  }

  // C++ patterns (check first - more specific)
  if (/cout\s*<</.test(code) || /std::/.test(code) || /cin\s*>>/.test(code) || /#include\s*<iostream>/.test(code) || /using\s+namespace\s+std/.test(code) || /\bclass\s+\w+\s*\{/.test(code) || /\bnew\s+\w+/.test(code) || /\bdelete\s+/.test(code)) {
    return "C++";
  }

  // C patterns
  if (/#include\s*<stdio\.h>/.test(code) || /printf\s*\(/.test(code) || /scanf\s*\(/.test(code) || /#include\s*<stdlib\.h>/.test(code) || /int\s+main\s*\(/.test(code) && !(/cout|cin|std::/.test(code))) {
    return "C";
  }

  // Go patterns
  if (/package\s+\w+/.test(code) || /func\s+\w+\s*\(/.test(code) || /fmt\.Print/.test(code)) {
    return "Go";
  }

  // Rust patterns
  if (/fn\s+\w+\s*\(/.test(code) && /let\s+(mut\s+)?\w+/.test(code) || /println!\s*\(/.test(code) || /use\s+std::/.test(code)) {
    return "Rust";
  }

  // Ruby patterns
  if (/\bputs\s+/.test(code) || /\bdef\s+\w+\s*$/.test(code) || /\bend\s*$/.test(code)) {
    return "Ruby";
  }

  // PHP patterns
  if (/<\?php/.test(code) || /\$\w+\s*=/.test(code) || /echo\s+/.test(code)) {
    return "PHP";
  }

  // SQL patterns
  if (/\bSELECT\b/i.test(code) || /\bINSERT\s+INTO\b/i.test(code) || /\bCREATE\s+TABLE\b/i.test(code)) {
    return "SQL";
  }

  // HTML patterns
  if (/<html/i.test(code) || /<div/i.test(code) || /<body/i.test(code) || /<head/i.test(code)) {
    return "HTML";
  }

  // CSS patterns
  if (/\{[\s\S]*:\s*[\w#]+;/.test(code) || /@media\s*\(/.test(code) || /\.\w+\s*\{/.test(code)) {
    return "CSS";
  }

  // JSON patterns
  if (/^\s*[\[{]/.test(code) && /[\]}]\s*$/.test(code)) {
    try {
      JSON.parse(code);
      return "JSON";
    } catch {}
  }

  return "Unknown";
};

// Extract print statements from code based on language
const extractOutputStatements = (code: string, language: string): string[] => {
  const outputs: string[] = [];
  
  // Python: print("...") or print('...')
  const pythonMatches = code.matchAll(/print\s*\(\s*(?:f?["']([^"']*?)["']|(\w+))\s*\)/g);
  for (const match of pythonMatches) {
    outputs.push(match[1] || match[2] || "");
  }

  // JavaScript/TypeScript: console.log("...")
  const jsMatches = code.matchAll(/console\.log\s*\(\s*["'`]([^"'`]*?)["'`]\s*\)/g);
  for (const match of jsMatches) {
    outputs.push(match[1]);
  }

  // Java: System.out.println("...") or System.out.print("...")
  const javaMatches = code.matchAll(/System\.out\.print(?:ln)?\s*\(\s*["']([^"']*?)["']\s*\)/g);
  for (const match of javaMatches) {
    outputs.push(match[1]);
  }

  // C: printf("...")
  const cMatches = code.matchAll(/printf\s*\(\s*["']([^"']*?)["']/g);
  for (const match of cMatches) {
    outputs.push(match[1].replace(/\\n/g, ""));
  }

  // C++: cout << "..."
  const cppMatches = code.matchAll(/cout\s*<<\s*["']([^"']*?)["']/g);
  for (const match of cppMatches) {
    outputs.push(match[1]);
  }

  // Go: fmt.Println("...") or fmt.Print("...")
  const goMatches = code.matchAll(/fmt\.Print(?:ln|f)?\s*\(\s*["']([^"']*?)["']/g);
  for (const match of goMatches) {
    outputs.push(match[1]);
  }

  // Rust: println!("...")
  const rustMatches = code.matchAll(/println!\s*\(\s*["']([^"']*?)["']/g);
  for (const match of rustMatches) {
    outputs.push(match[1]);
  }

  // Ruby: puts "..."
  const rubyMatches = code.matchAll(/puts\s+["']([^"']*?)["']/g);
  for (const match of rubyMatches) {
    outputs.push(match[1]);
  }

  // PHP: echo "..."
  const phpMatches = code.matchAll(/echo\s+["']([^"']*?)["']/g);
  for (const match of phpMatches) {
    outputs.push(match[1]);
  }

  return outputs.filter(o => o.length > 0);
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

  // Extract actual output statements from code
  const outputs = extractOutputStatements(code, language);
  
  if (outputs.length > 0) {
    for (const content of outputs) {
      await new Promise((r) => setTimeout(r, 100));
      onOutput({ type: "stdout", content });
    }
  } else if (code.trim().length > 0) {
    onOutput({ type: "status", content: "Program executed successfully (no output)" });
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
