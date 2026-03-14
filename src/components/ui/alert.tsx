import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border px-4 py-3 text-sm grid gap-1.5 [&>svg~*]:pl-8 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

/**
 * @description Renders contextual feedback with optional icon and destructive styling.
 * @param {AlertProps} props - Alert props including variant, className, and native div attributes.
 * @returns {JSX.Element} The alert container.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Alert.displayName = "Alert";

/**
 * @description Displays the alert title content.
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Heading attributes and children.
 * @returns {JSX.Element} The alert title element.
 */
export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h5
      ref={ref}
      className={cn(
        "mb-1 font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
});

AlertTitle.displayName = "AlertTitle";

/**
 * @description Displays the descriptive content for an alert.
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Div attributes and children.
 * @returns {JSX.Element} The alert description element.
 */
export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";
