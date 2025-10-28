import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="max-w-md mx-auto">
      <LoaderIcon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin text-grey", className)}
        {...props}
      />
    </div>
  );
}

export { Spinner };
