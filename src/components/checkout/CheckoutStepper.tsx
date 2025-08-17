'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  href: string;
}

interface CheckoutStepperProps {
  currentStep: string;
}

const steps: Step[] = [
  { id: 'address', title: 'כתובת', href: '/checkout/address' },
  { id: 'delivery', title: 'משלוח', href: '/checkout/delivery' },
  { id: 'payment', title: 'תשלום', href: '/checkout/payment' },
  { id: 'review', title: 'סיכום', href: '/checkout/review' },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="bg-white border border-border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium',
                  {
                    'bg-primary border-primary text-white': isCompleted,
                    'bg-white border-primary text-primary': isCurrent,
                    'bg-white border-gray-300 text-gray-500': isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Title */}
              <div className="mr-3">
                <h3
                  className={cn(
                    'text-sm font-medium',
                    {
                      'text-primary': isCompleted || isCurrent,
                      'text-gray-500': isUpcoming,
                    }
                  )}
                >
                  {step.title}
                </h3>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    {
                      'bg-primary': isCompleted,
                      'bg-gray-300': !isCompleted,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 