"use client"

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function Timer({ 
  duration, 
  onComplete, 
  isRunning = true, 
  className 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(!isRunning);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    setIsPaused(!isRunning);
  }, [isRunning]);

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onComplete]);

  const percentLeft = (timeLeft / duration) * 100;
  
  // Different colors based on time left
  const getProgressColor = () => {
    if (percentLeft > 60) return "bg-emerald-500";
    if (percentLeft > 30) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-sm">
        <span>Time Left</span>
        <span>{timeLeft}s</span>
      </div>
      <Progress 
        value={percentLeft} 
        className="h-2"
        indicatorClassName={getProgressColor()}
      />
    </div>
  );
}