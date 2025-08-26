import type React from 'react';
import { Card, CardContent } from '@/shared/client/ui/card';

interface MessageDisplayProps {
  message: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  return (
    <section className="flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Warning icon"
                role="img"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {message}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
