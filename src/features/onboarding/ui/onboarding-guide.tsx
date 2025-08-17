'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useOnboarding } from '../model/use-onboarding';
import { BookOpen, PenTool, Brain, Shield, Sparkles } from '@/shared/icons';

const STEPS = [
  {
    icon: BookOpen,
    titleKey: 'onboarding.welcome.title',
    descriptionKey: 'onboarding.welcome.description',
  },
  {
    icon: PenTool,
    titleKey: 'onboarding.entries.title',
    descriptionKey: 'onboarding.entries.description',
  },
  {
    icon: Brain,
    titleKey: 'onboarding.summary.title',
    descriptionKey: 'onboarding.summary.description',
  },
  {
    icon: Shield,
    titleKey: 'onboarding.security.title',
    descriptionKey: 'onboarding.security.description',
  },
  {
    icon: Sparkles,
    titleKey: 'onboarding.start.title',
    descriptionKey: 'onboarding.start.description',
  },
];

export function OnboardingGuide() {
  const { t } = useTranslation();
  const { isCompleted, currentStep, nextStep, prevStep, markAsCompleted } =
    useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  if (isCompleted === null) {
    return null;
  }

  if (isCompleted) {
    return null;
  }

  if (!isOpen) {
    setIsOpen(true);
  }

  const currentStepData = STEPS[currentStep];
  const IconComponent = currentStepData.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      markAsCompleted();
      setIsOpen(false);
    } else {
      nextStep();
    }
  };

  const handleClose = () => {
    markAsCompleted();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {t(currentStepData.titleKey)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center text-muted-foreground leading-relaxed">
            {t(currentStepData.descriptionKey)}
          </div>

          <div className="flex justify-center space-x-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index <= currentStep
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              {t('onboarding.back')}
            </Button>
            <Button variant="gradient" onClick={handleNext}>
              {isLastStep ? t('onboarding.finish') : t('onboarding.next')}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('onboarding.skip')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
