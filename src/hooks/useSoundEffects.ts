import { useCallback, useRef } from "react";

interface UseSoundEffectsReturn {
  playProcessingSound: () => void;
  playResponseSound: () => void;
  vibrateProcessing: () => void;
  vibrateResponse: () => void;
}

export const useSoundEffects = (): UseSoundEffectsReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Futuristic beep sound when processing starts
  const playProcessingSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Create oscillators for a futuristic chirp
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      // Frequency sweep from low to high (ascending beep)
      osc1.frequency.setValueAtTime(400, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      
      osc2.frequency.setValueAtTime(600, now);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

      // Volume envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);

      console.log("[JARVIS] Processing sound played");
    } catch (error) {
      console.warn("[JARVIS] Could not play processing sound:", error);
    }
  }, [getAudioContext]);

  // Confirmation sound when response is ready
  const playResponseSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";

      // Two-tone confirmation beep
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(800, now + 0.1);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gainNode.gain.setValueAtTime(0.1, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.12);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);

      console.log("[JARVIS] Response sound played");
    } catch (error) {
      console.warn("[JARVIS] Could not play response sound:", error);
    }
  }, [getAudioContext]);

  // Haptic vibration when processing starts (short double pulse)
  const vibrateProcessing = useCallback(() => {
    if ("vibrate" in navigator) {
      // Pattern: vibrate 50ms, pause 30ms, vibrate 50ms
      navigator.vibrate([50, 30, 50]);
      console.log("[JARVIS] Processing vibration triggered");
    }
  }, []);

  // Haptic vibration when response is ready (single longer pulse)
  const vibrateResponse = useCallback(() => {
    if ("vibrate" in navigator) {
      // Single 100ms vibration
      navigator.vibrate(100);
      console.log("[JARVIS] Response vibration triggered");
    }
  }, []);

  return {
    playProcessingSound,
    playResponseSound,
    vibrateProcessing,
    vibrateResponse,
  };
};
