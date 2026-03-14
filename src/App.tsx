import { useEffect, useRef, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  PanelImperativeHandle,
} from "react-resizable-panels";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eraser,
  FileDown,
  FileUp,
  Info,
  Menu,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import "./App.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CodeEditor from "./components/code-editor/CodeEditor";
import CodeOutputViewer from "./components/code-output-viewer/CodeOutputViewer";
import ResizeHandle from "./components/resize-handle/ResizeHandle";
import {
  clearLocalStorage,
  getCodeFromLocalStorage,
} from "./helpers/local-storage.helpers";
import { CodeErrorValueAtom } from "./state/atoms/CodeErrorValueAtom";
import { CodeValueAtom } from "./state/atoms/CodeValueAtom";
import { CodeSanitizationSelector } from "./state/selectors/CodeSanitizationSelector";
import { CodeStatusSelector } from "./state/selectors/CodeStatusSelector";
import { useAtomValue, useSetAtom } from "jotai";

/**
 * @description Renders the interactive JavaScript playground shell, menu actions, and output panels.
 * @returns {JSX.Element} The application layout.
 */
const App = () => {
  const setCodeToEditor = useSetAtom(CodeValueAtom);
  const sanitizedCode = useAtomValue(CodeSanitizationSelector);
  const error = useAtomValue(CodeErrorValueAtom);
  const status = useAtomValue(CodeStatusSelector);
  const [debouncedCodeValue, setDebouncedCodeValue] = useState(sanitizedCode);
  const [windowWidth, setWindowWidth] = useState(() => {
    return window.innerWidth;
  });

  const errorAndLogsPanelRef = useRef<PanelImperativeHandle>(null);
  const isOnMobile = windowWidth < 992;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCodeValue(sanitizedCode);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sanitizedCode]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Imperatively collapse or expand the side panels based on the viewport size.
   */
  useEffect(() => {
    const sidePanels = errorAndLogsPanelRef.current;

    if (isOnMobile) {
      sidePanels?.collapse();
    } else {
      sidePanels?.expand();
    }
  }, [isOnMobile]);

  const applyCodeFromLocalStorage = () => {
    const code = getCodeFromLocalStorage();

    if (!code) {
      toast.error("No code found", {
        description: "No code was found in local storage.",
        icon: <AlertTriangle className="size-4" />,
      });
    } else {
      setCodeToEditor(code);
      toast.success("Code loaded", {
        description: "Your code has been loaded from local storage.",
        icon: <CheckCircle2 className="size-4" />,
      });
    }
  };

  const saveCodeToLocalStorage = () => {
    localStorage.setItem("code", sanitizedCode);

    toast.success("Code saved", {
      description: "Your code has been saved to local storage.",
      icon: <CheckCircle2 className="size-4" />,
    });
  };

  const clearStorage = () => {
    clearLocalStorage();

    toast.success("Local storage cleared", {
      description: "Your code has been cleared from local storage.",
      icon: <CheckCircle2 className="size-4" />,
    });
  };

  const statusMeta =
    status === "error"
      ? {
          badgeVariant: "destructive" as const,
          badgeText: "Error",
          borderClassName: "border-red-400/70 shadow-red-500/10",
        }
      : status === "success"
        ? {
            badgeVariant: "success" as const,
            badgeText: "Valid code",
            borderClassName: "border-emerald-300/60 shadow-emerald-500/10",
          }
        : {
            badgeVariant: "secondary" as const,
            badgeText: "No code",
            borderClassName: "border-slate-600/70 shadow-black/10",
          };

  return (
    <div className="relative flex min-h-screen flex-col px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
                Dark Sandbox
              </p>
              <h1 className="mt-1 font-[inherit] text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                JS playground
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="border-cyan-400/30 bg-slate-950/60 text-slate-100 hover:bg-cyan-400/10"
                  size="sm"
                  variant="outline"
                >
                  Menu
                  <Menu className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Application</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={status !== "success"}
                  onClick={saveCodeToLocalStorage}
                >
                  <FileDown className="size-4 text-cyan-300" />
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCodeToEditor("")}>
                  <Eraser className="size-4" />
                  Clear all code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={applyCodeFromLocalStorage}>
                  <FileUp className="size-4" />
                  Apply from cache
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Danger zone</DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-red-200 focus:bg-red-500/15 focus:text-red-100"
                  onClick={clearStorage}
                >
                  <Trash2 className="size-4" />
                  Clear cache
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <PanelGroup id="editorGroup" orientation="horizontal">
            <>
              <Panel className={"Panel"} collapsible={true} id="editor-panel">
                <div className={"PanelContent"}>
                  <section
                    className={`flex h-full w-full flex-col rounded-3xl border bg-card/95 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur ${statusMeta.borderClassName}`}
                  >
                    <div className="flex items-center justify-between gap-3 px-2 py-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Editor
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-card-foreground">
                          JavaScript input
                        </h2>
                      </div>
                      <Badge variant={statusMeta.badgeVariant}>
                        {statusMeta.badgeText}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div
                      className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/8"
                      style={{ backgroundColor: "var(--editor-background)" }}
                    >
                      <CodeEditor />
                    </div>
                  </section>
                </div>
              </Panel>
              <ResizeHandle />
            </>
            <>
              <Panel
                className={"Panel"}
                collapsible={true}
                id="side-panel"
                panelRef={errorAndLogsPanelRef}
              >
                {/* Output and errors grid */}

                <PanelGroup id="outputAndErrorGroup" orientation="vertical">
                  <>
                    <Panel
                      className="Panel"
                      collapsible={true}
                      id="output-panel"
                    >
                      <div className="PanelContent">
                        <section className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-card/95 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
                          <div className="flex items-center gap-2 px-2 py-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Output
                              </p>
                              <h2 className="mt-1 text-lg font-semibold text-card-foreground">
                                Code output
                              </h2>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label="Code output information"
                                  className="ml-auto inline-flex size-8 items-center justify-center rounded-full border border-border/70 bg-slate-900/60 text-cyan-300 transition-colors hover:bg-slate-800/80"
                                  type="button"
                                >
                                  <Info className="size-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Code output displays the evaluated value of
                                expressions run in the editor.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Separator className="my-3" />
                          <div className="min-h-0 flex-1 overflow-auto">
                            <CodeOutputViewer codeValue={debouncedCodeValue} />
                          </div>
                        </section>
                      </div>
                    </Panel>
                    <ResizeHandle />
                    <Panel
                      className="Panel"
                      collapsible={true}
                      id="error-panel"
                    >
                      <div className="PanelContent">
                        <section className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-card/95 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
                          <div className="flex items-center gap-2 px-2 py-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                Diagnostics
                              </p>
                              <h2
                                className={`mt-1 text-lg font-semibold ${error.message ? "text-red-300" : "text-card-foreground"}`}
                              >
                                Errors
                              </h2>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  aria-label="Error panel information"
                                  className="ml-auto inline-flex size-8 items-center justify-center rounded-full border border-border/70 bg-slate-900/60 text-cyan-300 transition-colors hover:bg-slate-800/80"
                                  type="button"
                                >
                                  <Info className="size-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Errors displays syntax and runtime issues raised
                                while the editor code runs.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Separator className="my-3" />
                          <div className="min-h-0 flex-1 overflow-auto">
                            {error.message ? (
                              <Alert
                                className="border-red-400/30 bg-red-500/8"
                                variant="destructive"
                              >
                                <AlertCircle className="size-4" />
                                <AlertTitle>
                                  {error.title ?? "Error"}
                                </AlertTitle>
                                <AlertDescription>
                                  <pre>{error.message ?? "Unknown error"}</pre>
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div
                                className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/70 px-4 text-center text-sm text-muted-foreground"
                                style={{
                                  backgroundColor: "var(--panel-muted)",
                                }}
                              >
                                No current errors. Invalid syntax or runtime
                                exceptions will appear here.
                              </div>
                            )}
                          </div>
                        </section>
                      </div>
                    </Panel>
                  </>
                </PanelGroup>
              </Panel>
            </>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default App;
