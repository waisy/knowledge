'use client';

import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/useProgress";
import { Check, Circle } from 'lucide-react'; // Example icons

interface ProgressButtonProps {
  slug: string;
}

export function ProgressButton({ slug }: ProgressButtonProps) {
  const { isCompleted, toggleCompleted, isHydrated } = useProgress();

  // Avoid rendering the button incorrectly before hydration
  if (!isHydrated) {
    // You could return a placeholder or null
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  const completed = isCompleted(slug);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggleCompleted(slug)}
      className="flex items-center space-x-2"
    >
      {completed ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
      <span>{completed ? "Mark as Unread" : "Mark as Read"}</span>
    </Button>
  );
} 