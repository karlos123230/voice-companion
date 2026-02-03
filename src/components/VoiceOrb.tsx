import { useState } from "react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "processing" | "responding";

interface VoiceOrbProps {
  state?: VoiceState;
  onPress?: () => void;
  assistantName?: string;
}

// Cross marker component (+) for the outer ring
const CrossMarker = ({ angle }: { angle: number }) => {
  return (
    <div
      className="absolute"
      style={{
        left: `${50 + 50 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
        top: `${50 + 50 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Vertical line */}
      <div className="absolute w-[1px] h-5 bg-primary left-1/2 -translate-x-1/2 -translate-y-1/2" />
      {/* Horizontal line */}
      <div className="absolute w-5 h-[1px] bg-primary top-1/2 -translate-y-1/2 -translate-x-1/2" />
    </div>
  );
};

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

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer container with all rings */}
      <div className="relative w-80 h-80 md:w-[400px] md:h-[400px] flex items-center justify-center">
        
        {/* Ring 1 - Outermost with cross markers */}
        <div 
          className={cn(
            "absolute w-full h-full rounded-full border border-primary/60",
            state === "listening" && "animate-jarvis-ring-expand"
          )}
        >
          {/* Cross markers at cardinal positions */}
          {[0, 90, 180, 270].map((angle) => (
            <CrossMarker key={angle} angle={angle} />
          ))}
        </div>

        {/* Ring 2 */}
        <div 
          className={cn(
            "absolute w-[82%] h-[82%] rounded-full border border-primary/50",
            state === "processing" && "animate-jarvis-spin"
          )}
        />

        {/* Ring 3 */}
        <div 
          className="absolute w-[65%] h-[65%] rounded-full border border-primary/40"
        />

        {/* Ring 4 - Inner ring */}
        <div 
          className="absolute w-[50%] h-[50%] rounded-full border border-primary/30"
        />

        {/* Central Orb - Dark sphere with intense cyan glow at bottom */}
        <button
          onClick={handlePress}
          className={cn(
            "absolute w-[38%] h-[38%] rounded-full cursor-pointer",
            "flex items-center justify-center",
            "transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state === "listening" && "animate-jarvis-listening",
            isPressed && "scale-95"
          )}
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 100%, hsl(185 100% 45% / 0.6) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 50% 0%, hsl(200 20% 20% / 0.8) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(200 30% 12%) 0%, hsl(220 25% 8%) 50%, hsl(220 20% 5%) 100%)
            `,
            boxShadow: state === "listening" 
              ? `
                0 25px 50px -10px hsl(185 100% 50% / 0.7),
                0 40px 80px -20px hsl(185 100% 50% / 0.5),
                0 0 80px 20px hsl(185 100% 50% / 0.2),
                inset 0 -30px 50px -20px hsl(185 100% 50% / 0.4)
              `
              : `
                0 20px 40px -10px hsl(185 100% 50% / 0.5),
                0 30px 60px -15px hsl(185 100% 50% / 0.35),
                0 0 60px 10px hsl(185 100% 50% / 0.15),
                inset 0 -25px 40px -15px hsl(185 100% 50% / 0.3)
              `,
            border: "1px solid hsl(185 80% 40% / 0.4)"
          }}
        >
          {/* Orb inner content */}
          <div className="flex flex-col items-center justify-center">
            {state === "responding" ? (
              <AudioWaveform />
            ) : (
              <span 
                className="text-primary font-normal text-base md:text-lg tracking-[0.3em] uppercase"
                style={{
                  textShadow: "0 0 20px hsl(185 100% 50% / 0.8), 0 0 40px hsl(185 100% 50% / 0.4)"
                }}
              >
                {assistantName}
              </span>
            )}
          </div>
        </button>

        {/* Sound wave ripples when listening */}
        {state === "listening" && (
          <>
            <div className="absolute w-[45%] h-[45%] rounded-full border border-primary/30 animate-jarvis-ripple" />
            <div 
              className="absolute w-[45%] h-[45%] rounded-full border border-primary/20 animate-jarvis-ripple"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>
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
          className="w-1 bg-primary rounded-full"
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
