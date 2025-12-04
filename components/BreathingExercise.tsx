import React, { useState, useEffect } from 'react';

const BreathingExercise: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycles, setCycles] = useState(0);

  // 4-7-8 Breathing Technique
  const INHALE_TIME = 4;
  const HOLD_TIME = 7;
  const EXHALE_TIME = 8;

  useEffect(() => {
    let timer: number;

    if (phase === 'idle') return;

    if (timeLeft > 0) {
        timer = window.setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else {
        // Phase transition
        if (phase === 'inhale') {
            setPhase('hold');
            setTimeLeft(HOLD_TIME);
        } else if (phase === 'hold') {
            setPhase('exhale');
            setTimeLeft(EXHALE_TIME);
        } else if (phase === 'exhale') {
            setPhase('inhale');
            setTimeLeft(INHALE_TIME);
            setCycles(c => c + 1);
        }
    }

    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const startBreathing = () => {
    setPhase('inhale');
    setTimeLeft(INHALE_TIME);
    setCycles(0);
  };

  const stopBreathing = () => {
    setPhase('idle');
    setTimeLeft(0);
  };

  const getVisuals = () => {
    switch(phase) {
      case 'inhale': 
        return { 
            scale: 1.5, 
            color: 'bg-blue-400 shadow-blue-400/50', 
            label: '吸气 (Inhale)', 
            subLabel: '用鼻子深深吸气，感受清新的能量充满胸腔 🌿' 
        };
      case 'hold': 
        return { 
            scale: 1.5, 
            color: 'bg-indigo-400 shadow-indigo-400/50', 
            label: '屏气 (Hold)', 
            subLabel: '保持气息，放松肩膀，专注于当下的宁静 🧘' 
        };
      case 'exhale': 
        return { 
            scale: 1.0, 
            color: 'bg-emerald-400 shadow-emerald-400/50', 
            label: '呼气 (Exhale)', 
            subLabel: '用嘴缓慢呼气，想象压力随着气息排出体外 🍃' 
        };
      default: 
        return { 
            scale: 1.0, 
            color: 'bg-blue-300 shadow-blue-300/30', 
            label: '准备放松', 
            subLabel: '找一个舒适的姿势，跟随节奏，平复心情' 
        };
    }
  };

  const visuals = getVisuals();

  // Dynamic CSS transition duration based on phase to ensure smoothness
  const getTransitionDuration = () => {
    if (phase === 'inhale') return '4000ms';
    if (phase === 'exhale') return '8000ms';
    if (phase === 'hold') return '300ms'; // Quick response to color change
    return '1000ms';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative overflow-hidden">
        {/* Background ambience - Absolute positioned */}
        <div className={`absolute inset-0 opacity-10 transition-colors duration-[2000ms] pointer-events-none ${visuals.color.split(' ')[0]}`}></div>

        <div className="z-10 text-center mb-8 relative">
            <h2 className="text-2xl font-bold text-gray-700 mb-1">呼吸冥想</h2>
            <p className="text-gray-500 text-sm">4-7-8 放松呼吸法</p>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8 z-10">
            {/* Outer rippling rings (only active when breathing) */}
            {phase !== 'idle' && (
                <>
                    <div className={`absolute w-32 h-32 rounded-full opacity-20 animate-ping ${visuals.color.split(' ')[0]}`} style={{ animationDuration: '3s' }}></div>
                    <div className={`absolute w-40 h-40 rounded-full opacity-10 animate-ping ${visuals.color.split(' ')[0]}`} style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                </>
            )}

            {/* Main Circle */}
            <div 
                className={`
                    relative w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl
                    transition-all ease-in-out transform
                    ${visuals.color}
                `}
                style={{ 
                    transform: `scale(${visuals.scale})`,
                    transitionDuration: getTransitionDuration()
                }}
            >
                <span className="text-3xl font-bold transition-none duration-0">
                    {phase !== 'idle' ? timeLeft : 'Start'}
                </span>
                {phase !== 'idle' && <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1">{visuals.label.split(' ')[0]}</span>}
            </div>

            {/* Ghost circle for 'Hold' fixed size reference */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-gray-100 border-dashed pointer-events-none" style={{ transform: 'scale(1.5)', opacity: 0.3 }}></div>
            <div className="absolute w-32 h-32 rounded-full border-2 border-gray-100 border-dashed pointer-events-none opacity-30"></div>
        </div>

        {/* Instruction Text - Added relative z-10 */}
        <div className="min-h-[5rem] px-4 text-center relative z-10 flex flex-col items-center justify-center">
            <h3 className={`text-2xl font-bold transition-colors duration-500 ${phase === 'idle' ? 'text-gray-400' : 'text-gray-700'}`}>
                {visuals.label}
            </h3>
            <p className="text-gray-500 mt-2 text-sm sm:text-base transition-opacity duration-300 max-w-xs leading-relaxed">
                {visuals.subLabel}
            </p>
        </div>

        {/* Controls - Added relative z-10 */}
        <div className="mt-6 relative z-10">
            {phase === 'idle' ? (
                <button 
                    onClick={startBreathing}
                    className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-600 hover:shadow-blue-200 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>开始练习</span>
                </button>
            ) : (
                <button 
                    onClick={stopBreathing}
                    className="px-8 py-3 bg-white text-gray-500 font-medium rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                >
                    结束
                </button>
            )}
        </div>

        {/* Cycle Counter */}
        {cycles > 0 && phase !== 'idle' && (
            <div className="absolute bottom-6 text-xs text-gray-400 bg-white/50 px-3 py-1 rounded-full z-10">
                已完成 {cycles} 次循环
            </div>
        )}
    </div>
  );
};

export default BreathingExercise;