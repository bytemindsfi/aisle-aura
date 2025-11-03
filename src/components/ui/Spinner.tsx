import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SpinnerProps extends Omit<React.ComponentProps<"svg">, "fullscreen"> {
  fullscreen?: boolean;
}

function Spinner({ className, fullscreen = false, ...props }: SpinnerProps) {
  const spinner = (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin text-muted-foreground", className)}
      {...props}
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-8">
      {spinner}
    </div>
  );
}

export { Spinner };
