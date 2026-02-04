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

// Scanner line component - rotating beam inside the orb
const ScannerLine = () => {
  return (
    <div className="absolute inset-0 animate-jarvis-scanner">
      <div 
        className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
        style={{
          background: "linear-gradient(90deg, hsl(185 100% 60% / 0.8) 0%, hsl(185 100% 50% / 0) 100%)",
          boxShadow: "0 0 10px hsl(185 100% 50% / 0.6)",
          transform: "translateY(-50%)",
        }}
      />
    </div>
  );
};

// Energy waves emanating from center
const EnergyWaves = () => {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-[45%] h-[45%] rounded-full border-2 border-primary/40"
          style={{
            animation: "jarvis-energy-wave 2s ease-out infinite",
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </>
  );
};

// Data particles orbiting the orb
const DataParticles = () => {
  const particles = [
    { delay: 0, duration: 3 },
    { delay: 0.5, duration: 4 },
    { delay: 1, duration: 3.5 },
    { delay: 1.5, duration: 4.5 },
    { delay: 2, duration: 3.2 },
    { delay: 2.5, duration: 3.8 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-full h-full"
          style={{
            animation: `jarvis-data-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <div 
            className="absolute w-1.5 h-1.5 bg-primary rounded-full left-1/2 -translate-x-1/2"
            style={{
              boxShadow: "0 0 8px hsl(185 100% 50% / 0.8), 0 0 16px hsl(185 100% 50% / 0.4)",
            }}
          />
        </div>
      ))}
    </>
  );
};

const VoiceOrb = ({ 
  state = "idle", 
  onPress, 
  assistantName = "JARVIS" 
}: VoiceOrbProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const isResponding = state === "responding";

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
            state === "listening" && "animate-jarvis-ring-expand",
            isResponding && "animate-jarvis-respond-rotate animate-jarvis-hologram"
          )}
          style={{
            animationDuration: isResponding ? "12s, 3s" : undefined,
          }}
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
            state === "processing" && "animate-jarvis-spin",
            isResponding && "animate-jarvis-respond-rotate-reverse"
          )}
          style={{
            animationDuration: isResponding ? "5s" : undefined,
          }}
        />

        {/* Ring 3 */}
        <div 
          className={cn(
            "absolute w-[65%] h-[65%] rounded-full border border-primary/40",
            state === "processing" && "animate-jarvis-spin-reverse",
            isResponding && "animate-jarvis-respond-rotate animate-jarvis-respond-pulse"
          )}
          style={{
            animationDuration: isResponding ? "7s, 2s" : undefined,
          }}
        />

        {/* Ring 4 - Inner ring */}
        <div 
          className={cn(
            "absolute w-[50%] h-[50%] rounded-full border border-primary/30",
            state === "processing" && "animate-jarvis-spin",
            isResponding && "animate-jarvis-respond-rotate-reverse"
          )}
          style={{ 
            animationDuration: state === "processing" ? "1.5s" : isResponding ? "4s" : undefined 
          }}
        />

        {/* Data particles when responding */}
        {isResponding && <DataParticles />}

        {/* Central Orb - Dark sphere with intense cyan glow at bottom */}
        <button
          onClick={handlePress}
          className={cn(
            "absolute w-[38%] h-[38%] rounded-full cursor-pointer",
            "flex items-center justify-center",
            "transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state === "listening" && "animate-jarvis-listening",
            isResponding && "animate-jarvis-respond-glow",
            isPressed && "scale-95"
          )}
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 100%, hsl(185 100% 45% / 0.6) 0%, transparent 50%),
              radial-gradient(ellipse 80% 50% at 50% 0%, hsl(200 20% 20% / 0.8) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(200 30% 12%) 0%, hsl(220 25% 8%) 50%, hsl(220 20% 5%) 100%)
            `,
            boxShadow: isResponding
              ? undefined // Let CSS animation handle it
              : state === "listening" 
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
          {/* Scanner line inside orb when responding */}
          {isResponding && <ScannerLine />}
          
          {/* Orb inner content */}
          <div className="flex flex-col items-center justify-center z-10">
            {state === "responding" ? (
              <AudioWaveform />
            ) : state === "processing" ? (
              <ProcessingIndicator />
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

        {/* Energy waves when responding */}
        {isResponding && <EnergyWaves />}
      </div>
    </div>
  );
};

// Processing indicator component
const ProcessingIndicator = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            style={{
              animation: "jarvis-processing-dot 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span 
        className="text-primary/70 font-light text-xs tracking-widest uppercase"
        style={{
          textShadow: "0 0 10px hsl(185 100% 50% / 0.5)"
        }}
      >
        Pensando
      </span>
    </div>
  );
};

// Enhanced Audio waveform component for responding state
const AudioWaveform = () => {
  const bars = [
    { delay: 0, maxHeight: 24 },
    { delay: 0.1, maxHeight: 28 },
    { delay: 0.15, maxHeight: 20 },
    { delay: 0.2, maxHeight: 32 },
    { delay: 0.25, maxHeight: 22 },
    { delay: 0.3, maxHeight: 26 },
    { delay: 0.35, maxHeight: 18 },
  ];

  return (
    <div className="flex items-center gap-1">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full"
          style={{
            animation: "jarvis-waveform-bar 0.6s ease-in-out infinite",
            animationDelay: `${bar.delay}s`,
            height: "12px",
            boxShadow: "0 0 8px hsl(185 100% 50% / 0.6), 0 0 16px hsl(185 100% 50% / 0.3)",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceOrb;
