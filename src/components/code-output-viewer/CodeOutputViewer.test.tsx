import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import CodeOutputViewer from "./CodeOutputViewer";

afterEach(cleanup);

describe("CodeOutputViewer", () => {
  test("renders the evaluated value for valid code", async () => {
    render(<CodeOutputViewer codeValue="1 + 1" />);

    expect(await screen.findByText("2")).toBeVisible();
  });
});
