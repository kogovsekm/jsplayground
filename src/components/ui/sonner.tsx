import { Toaster } from "sonner";

/**
 * @description Mounts the shared toast host used across the application.
 * @returns {JSX.Element} The configured toast host.
 */
export const Sonner = () => {
  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "border border-border/70 bg-popover/95 text-popover-foreground shadow-2xl shadow-black/30",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-secondary text-secondary-foreground",
        },
      }}
    />
  );
};
