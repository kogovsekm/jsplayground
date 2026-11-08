import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, test } from "vitest";
import {
  Group as PanelGroup,
  type Orientation,
  Panel,
} from "react-resizable-panels";
import "../../App.css";
import ResizeHandle from "./ResizeHandle";

interface RenderResizeHandleParams {
  orientation: Orientation;
}

/**
 * Renders a resize handle between two panels using the requested group orientation.
 *
 * @param params - Fixture options.
 * @param params.orientation - Direction in which the panels are laid out.
 * @returns The rendered separator element.
 */
function renderResizeHandle({
  orientation,
}: RenderResizeHandleParams): HTMLElement {
  render(
    <PanelGroup orientation={orientation}>
      <Panel>Before</Panel>
      <ResizeHandle />
      <Panel>After</Panel>
    </PanelGroup>,
  );

  return screen.getByRole("separator");
}

afterEach(cleanup);

describe("ResizeHandle", () => {
  test.each([
    {
      groupOrientation: "horizontal" as const,
      separatorOrientation: "vertical",
    },
    {
      groupOrientation: "vertical" as const,
      separatorOrientation: "horizontal",
    },
  ])(
    "renders $separatorOrientation dots for a $groupOrientation panel group",
    ({ groupOrientation, separatorOrientation }) => {
      const separator = renderResizeHandle({ orientation: groupOrientation });
      const dots = separator.querySelector<HTMLElement>(".ResizeHandleDots");

      expect(separator).toHaveAttribute(
        "aria-orientation",
        separatorOrientation,
      );
      expect(dots).not.toBeNull();
      expect(dots).toHaveAttribute("aria-hidden", "true");
      expect(dots?.children).toHaveLength(3);
    },
  );
});
