import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * @description Renders a visual separator between adjacent interface regions.
 * @param {React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>} props - Separator props including orientation and decorative state.
 * @returns {JSX.Element} The separator element.
 */
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border/70",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className,
        )}
        {...props}
      />
    );
  },
);

Separator.displayName = SeparatorPrimitive.Root.displayName;
