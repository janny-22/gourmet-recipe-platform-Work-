import React, { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '../types';
import { soundEffects } from '../services/soundEffects';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  ChefHat, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CookingFocusModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingFocusMode: React.FC<CookingFocusModeProps> = ({ recipe, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const step: RecipeStep | undefined = recipe.steps[currentStepIdx];
  const totalSteps = recipe.steps.length;

  // Initialize timer whenever step changes
  useEffect(() => {
    if (step && step.timerMinutes && step.timerMinutes > 0) {
      setTimerSeconds(step.timerMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [currentStepIdx, step]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            soundEffects.playTimerBell();
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C46836', '#43362E', '#D97706'],
        });
      } catch {
        // ignore
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D241E] text-[#FAF7F2] flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#43362E] bg-[#241C17]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C46836] flex items-center justify-center text-white">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#A6978A]">
              Kitchen Focus Mode · Hands-Free Assistant
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#A6978A] hover:text-white hover:bg-[#43362E] transition-colors cursor-pointer"
          aria-label="Exit kitchen focus mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Focus Canvas */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 flex flex-col justify-center items-center text-center">
        {isCompleted ? (
          <div className="space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="font-serif text-3xl font-bold text-white">
              Bravo, You Finished Cooking!
            </h3>
            <p className="text-sm text-[#D5C7BA] leading-relaxed">
              Your <strong>{recipe.title}</strong> is ready to be plated and enjoyed. Wishing you a delicious dining experience!
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-[#C46836] text-white font-bold text-sm shadow-xl hover:bg-[#A85427] transition-all cursor-pointer"
              >
                Back to Recipe Details
              </button>
            </div>
          </div>
        ) : step ? (
          <div className="w-full space-y-8 animate-in fade-in duration-150">
            {/* Step Counter Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#43362E] border border-[#5E5046] text-xs font-semibold text-[#E8DFD8]">
              <span>Step {step.stepNumber} of {totalSteps}</span>
            </div>

            {/* Step Title */}
            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white max-w-2xl mx-auto leading-tight">
              {step.title}
            </h3>

            {/* Giant Description */}
            <p className="text-base sm:text-xl text-[#E8DFD8] max-w-2xl mx-auto leading-relaxed font-light">
              {step.description}
            </p>

            {/* Big Countdown Timer if step has duration */}
            {step.timerMinutes && step.timerMinutes > 0 && (
              <div className="p-6 rounded-3xl bg-[#241C17] border border-[#43362E] max-w-xs mx-auto shadow-xl space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#A6978A]">
                  <Clock className="w-4 h-4 text-[#C46836]" />
                  <span>Step Duration</span>
                </div>
                
                <div className="font-mono text-5xl font-extrabold tracking-tight text-white tabular-nums">
                  {formatTimer(timerSeconds)}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C46836] hover:bg-[#A85427] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds((step.timerMinutes || 0) * 60);
                    }}
                    className="p-2.5 rounded-xl bg-[#43362E] hover:bg-[#5E5046] text-[#D5C7BA] transition-colors cursor-pointer"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Bottom Step Control Navigation */}
      {!isCompleted && (
        <div className="px-6 py-5 border-t border-[#43362E] bg-[#241C17] flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#43362E] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#5E5046] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Step</span>
          </button>

          {/* Step Progress indicators */}
          <div className="flex items-center gap-1.5">
            {recipe.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIdx(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === currentStepIdx
                    ? 'w-8 bg-[#C46836]'
                    : i < currentStepIdx
                    ? 'w-2 bg-[#8C7A6B]'
                    : 'w-2 bg-[#43362E]'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C46836] text-white text-xs font-bold hover:bg-[#A85427] transition-all shadow-md cursor-pointer"
          >
            <span>{currentStepIdx === totalSteps - 1 ? 'Finish Cooking' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
