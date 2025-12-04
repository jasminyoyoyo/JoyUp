import React, { useState, useCallback } from 'react';

const GRID_SIZE = 30; // Number of bubbles

const BubbleWrap: React.FC = () => {
  const [popped, setPopped] = useState<boolean[]>(new Array(GRID_SIZE).fill(false));

  // Use Web Audio API to generate a satisfying pop sound without external assets
  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Random variation makes it feel more natural (250Hz - 350Hz start)
      const startFreq = 250 + Math.random() * 100;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
      // Rapid pitch drop to simulate the "thump" of a bubble
      oscillator.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);

      // Volume envelope for a sharp "pop"
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Ignore audio errors (e.g. if user hasn't interacted with page yet)
      console.error("Pop sound error", e);
    }
  };

  const handlePop = (index: number) => {
    if (!popped[index]) {
      // Audio feedback
      playPopSound();

      // Trigger visual/haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback on mobile
      }
      
      setPopped(prev => {
        const newPopped = [...prev];
        newPopped[index] = true;
        return newPopped;
      });
    }
  };

  const resetBubbles = useCallback(() => {
    setPopped(new Array(GRID_SIZE).fill(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 overflow-hidden">
      <h2 className="text-2xl font-bold text-purple-600 mb-2">捏泡泡解压</h2>
      <p className="text-gray-500 mb-6 text-sm">戳破它们，释放压力！</p>

      <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-4 bg-purple-200 p-6 rounded-3xl shadow-inner overflow-y-auto w-full max-w-[360px] no-scrollbar">
        {popped.map((isPopped, index) => (
          <button
            key={index}
            onClick={() => handlePop(index)}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-all duration-200
              flex items-center justify-center relative overflow-hidden shrink-0
              ${isPopped 
                ? 'bg-purple-100 border-purple-200 shadow-none scale-95 cursor-default' 
                : 'bg-purple-400 border-purple-300 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.2),inset_4px_4px_10px_rgba(255,255,255,0.4),0_4px_6px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 cursor-pointer'
              }
            `}
            aria-label={isPopped ? "Popped bubble" : "Bubble"}
          >
            {/* Highlight reflection for 3D effect */}
            {!isPopped && (
              <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-40 blur-[1px]"></div>
            )}
            {/* Pop animation visual */}
            {isPopped && (
               <span className="text-purple-300 font-bold text-xs select-none animate-ping">POP!</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={resetBubbles}
        className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all mt-auto mb-4"
      >
        再来一次 🔄
      </button>
    </div>
  );
};

export default BubbleWrap;