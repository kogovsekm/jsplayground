import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ConsoleOutputViewer from "./ConsoleOutputViewer";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ConsoleOutputViewer", () => {
  test("renders values written to the console", async () => {
    vi.spyOn(console, "log").mockImplementation(function suppressTestLog() {});

    render(<ConsoleOutputViewer codeValue="console.log('ready')" />);

    expect(await screen.findByText('"ready"')).toBeVisible();
  });
});
