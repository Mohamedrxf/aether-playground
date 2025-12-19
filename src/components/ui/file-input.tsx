import { cn } from "@/lib/utils";

interface FileInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FileInput({ 
  value, 
  onChange, 
  placeholder = "main.py",
  className 
}: FileInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="absolute left-3 w-2 h-2 rounded-full bg-aether-success" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-8 pl-7 pr-3 w-40 rounded-md",
          "bg-secondary/50 border border-border/50",
          "text-sm font-mono text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50",
          "transition-all duration-200"
        )}
      />
    </div>
  );
}
