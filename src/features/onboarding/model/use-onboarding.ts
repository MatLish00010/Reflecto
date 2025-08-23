'use client';

import { useEffect, useState } from 'react';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    setIsCompleted(completed);
  }, []);

  const markAsCompleted = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setIsCompleted(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const reset = () => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    setIsCompleted(false);
    setCurrentStep(0);
  };

  return {
    isCompleted,
    currentStep,
    nextStep,
    prevStep,
    markAsCompleted,
    reset,
  };
}
