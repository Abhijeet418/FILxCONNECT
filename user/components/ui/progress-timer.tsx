import { useEffect, useState } from 'react';

interface ProgressTimerProps {
  duration: number;
  onComplete: () => void;
}

export function ProgressTimer({ duration, onComplete }: ProgressTimerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const progressPercent = 100 - (remaining / (duration * 1000)) * 100;

      if (remaining <= 0) {
        clearInterval(timer);
        setProgress(100);
        onComplete();
      } else {
        setProgress(progressPercent);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <svg className="w-5 h-5 transform -rotate-90">
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="opacity-20"
      />
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray={`${progress * 0.502}, 50.2`}
        className="transition-all duration-200"
      />
    </svg>
  );
}