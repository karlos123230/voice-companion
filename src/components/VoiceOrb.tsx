import { useState } from "react";
import { cn } from "@/lib/utils";

export type VoiceState = "idle" | "listening" | "processing" | "responding";

interface VoiceOrbProps {
  state?: VoiceState;
  onPress?: () => void;
  assistantName?: string;
}

// T-shaped marker component for the outer ring
const TMarker = ({ angle }: { angle: number }) => {
  const isVertical = angle === 0 || angle === 180;
  
  return (
    <div
      className="absolute"
      style={{
        left: `${50 + 47 * Math.cos((angle - 90) * (Math.PI / 180))}%`,
        top: `${50 + 47 * Math.sin((angle - 90) * (Math.PI / 180))}%`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
    >
      {/* Vertical line of T */}
      <div className="absolute w-[2px] h-4 bg-primary/80 -translate-x-1/2" style={{ top: '-16px' }} />
      {/* Horizontal line of T */}
      <div className="absolute w-4 h-[2px] bg-primary/80 -translate-x-1/2 -translate-y-1/2" style={{ top: '-16px' }} />
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
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        
        {/* Ring 1 - Outermost with T markers */}
        <div 
          className={cn(
            "absolute w-full h-full rounded-full border border-primary/40",
            state === "listening" && "animate-jarvis-ring-expand"
          )}
        >
          {/* T-shaped markers at cardinal positions */}
          {[0, 90, 180, 270].map((angle) => (
            <TMarker key={angle} angle={angle} />
          ))}
        </div>

        {/* Ring 2 */}
        <div 
          className={cn(
            "absolute w-[85%] h-[85%] rounded-full border border-primary/35",
            state === "processing" && "animate-jarvis-spin"
          )}
        />

        {/* Ring 3 */}
        <div 
          className="absolute w-[70%] h-[70%] rounded-full border border-primary/30"
        />

        {/* Ring 4 - Inner ring */}
        <div 
          className="absolute w-[55%] h-[55%] rounded-full border border-primary/25"
        />

        {/* Central Orb - Dark sphere with cyan glow */}
        <button
          onClick={handlePress}
          className={cn(
            "absolute w-[42%] h-[42%] rounded-full cursor-pointer",
            "flex items-center justify-center",
            "transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state === "listening" && "animate-jarvis-listening",
            isPressed && "scale-95"
          )}
          style={{
            background: "radial-gradient(circle at 50% 30%, hsl(200 30% 15%) 0%, hsl(220 20% 6%) 60%, hsl(220 20% 4%) 100%)",
            boxShadow: state === "listening" 
              ? `
                0 20px 40px -10px hsl(var(--jarvis-glow) / 0.6),
                0 30px 60px -10px hsl(var(--jarvis-glow) / 0.4),
                inset 0 -20px 40px -20px hsl(var(--jarvis-glow) / 0.3)
              `
              : `
                0 15px 30px -5px hsl(var(--jarvis-glow) / 0.4),
                0 25px 50px -10px hsl(var(--jarvis-glow) / 0.25),
                inset 0 -15px 30px -15px hsl(var(--jarvis-glow) / 0.2)
              `,
            border: "1px solid hsl(var(--primary) / 0.3)"
          }}
        >
          {/* Orb inner content */}
          <div className="flex flex-col items-center justify-center">
            {state === "responding" ? (
              <AudioWaveform />
            ) : (
              <span className="text-primary font-light text-sm md:text-base tracking-[0.4em] uppercase">
                {assistantName}
              </span>
            )}
          </div>
        </button>

        {/* Sound wave ripples when listening */}
        {state === "listening" && (
          <>
            <div className="absolute w-[50%] h-[50%] rounded-full border border-primary/30 animate-jarvis-ripple" />
            <div 
              className="absolute w-[50%] h-[50%] rounded-full border border-primary/20 animate-jarvis-ripple"
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
