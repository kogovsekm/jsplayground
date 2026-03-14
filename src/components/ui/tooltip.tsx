import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * @description Renders tooltip content with the shared app surface styling.
 * @param {React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>} props - Tooltip content props including sideOffset and className.
 * @returns {JSX.Element} The tooltip content element.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-lg border border-border/70 bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-xl shadow-black/25",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
