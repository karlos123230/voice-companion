import { useState } from "react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "processing" | "responding";

interface VoiceOrbProps {
  state?: VoiceState;
  onPress?: () => void;
  assistantName?: string;
}

const VoiceOrb = ({ 
  state = "idle", 
  onPress, 
  assistantName = "JARVIS" 
}: VoiceOrbProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    onPress?.();
    setTimeout(() => setIsPressed(false), 150);
  };

  const getStateText = () => {
    switch (state) {
      case "listening":
        return "Ouvindo...";
      case "processing":
        return "Processando...";
      case "responding":
        return "Respondendo...";
      default:
        return "Toque para falar";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      {/* Outer container with all rings */}
      <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
        
        {/* Outermost ring with markers */}
        <div 
          className={cn(
            "absolute w-full h-full rounded-full border border-primary/30",
            state === "idle" && "animate-jarvis-breathe",
            state === "listening" && "animate-jarvis-ring-expand"
          )}
        >
          {/* HUD Markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              className="absolute w-2 h-2 bg-primary/60 rounded-full"
              style={{
                left: `${50 + 48 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                top: `${50 + 48 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Second ring - rotating */}
        <div 
          className={cn(
            "absolute w-[85%] h-[85%] rounded-full border border-primary/40",
            state === "processing" ? "animate-jarvis-spin" : "animate-jarvis-rotate"
          )}
        >
          {/* Accent marks */}
          {[0, 90, 180, 270].map((angle) => (
            <div
              key={angle}
              className="absolute w-3 h-1 bg-primary/80 rounded-full"
              style={{
                left: `${50 + 46 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                top: `${50 + 46 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>

        {/* Third ring - counter rotating */}
        <div 
          className={cn(
            "absolute w-[70%] h-[70%] rounded-full border border-primary/50",
            "animate-jarvis-rotate-reverse"
          )}
        >
          {/* Small dots */}
          {[30, 150, 270].map((angle) => (
            <div
              key={angle}
              className="absolute w-1.5 h-1.5 bg-primary rounded-full"
              style={{
                left: `${50 + 46 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
                top: `${50 + 46 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Inner glow ring */}
        <div 
          className={cn(
            "absolute w-[55%] h-[55%] rounded-full",
            "bg-gradient-to-br from-primary/10 to-transparent",
            "border border-primary/60",
            state === "listening" && "animate-jarvis-ring-expand"
          )}
        />

        {/* Central Orb - Interactive */}
        <button
          onClick={handlePress}
          className={cn(
            "absolute w-[40%] h-[40%] rounded-full cursor-pointer",
            "bg-gradient-to-br from-jarvis-orb-start to-jarvis-orb-end",
            "flex items-center justify-center",
            "transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state === "idle" && "animate-jarvis-glow-pulse",
            state === "listening" && "animate-jarvis-listening",
            state === "processing" && "animate-jarvis-glow-pulse",
            isPressed && "scale-95"
          )}
          style={{
            boxShadow: state === "listening" 
              ? "0 0 60px hsl(var(--jarvis-glow-intense) / 0.8), 0 0 100px hsl(var(--jarvis-glow) / 0.5)"
              : "0 0 30px hsl(var(--jarvis-glow) / 0.5), 0 0 60px hsl(var(--jarvis-glow) / 0.25)"
          }}
        >
          {/* Orb inner content */}
          <div className="flex flex-col items-center justify-center">
            {state === "responding" ? (
              <AudioWaveform />
            ) : (
              <span className="text-primary-foreground font-bold text-sm md:text-base tracking-widest">
                {assistantName}
              </span>
            )}
          </div>
        </button>

        {/* Sound wave ripples when listening */}
        {state === "listening" && (
          <>
            <div className="absolute w-[50%] h-[50%] rounded-full border border-primary/40 animate-jarvis-ripple" />
            <div 
              className="absolute w-[50%] h-[50%] rounded-full border border-primary/30 animate-jarvis-ripple"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>

      {/* Status text */}
      <p className="text-muted-foreground text-sm md:text-base tracking-wide animate-pulse">
        {getStateText()}
      </p>
    </div>
  );
};

// Audio waveform component for responding state
const AudioWaveform = () => {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary-foreground rounded-full"
          style={{
            animation: "jarvis-wave 0.8s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
            height: "12px",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceOrb;
