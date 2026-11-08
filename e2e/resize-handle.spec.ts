import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

const BASELINE_URL = "https://kogovsekm.github.io/jsplayground/";
const LOCAL_URL = "http://127.0.0.1:5173/jsplayground/";
const ALIGNMENT_TOLERANCE_PX = 0.5;
const DRAG_DISTANCE_PX = 60;

interface DotCenter {
  x: number;
  y: number;
}

interface CapturePageParams {
  page: Page;
  screenshotPath: string;
  url: string;
}

interface DragSeparatorParams {
  page: Page;
  separatorIndex: number;
  xOffset: number;
  yOffset: number;
}

/**
 * Records browser warnings, errors, and unhandled page exceptions for one pass.
 *
 * @param page - Browser page whose console should be observed.
 * @returns A mutable collection populated while the page is used.
 */
function captureBrowserIssues(page: Page): Array<string> {
  const issues: Array<string> = [];

  page.on("console", function handleConsoleMessage(message: ConsoleMessage) {
    const messageType = message.type();

    if (messageType === "warning" || messageType === "error") {
      issues.push(`${messageType}: ${message.text()}`);
    }
  });
  page.on("pageerror", function handlePageError(error: Error) {
    issues.push(`pageerror: ${error.message}`);
  });

  return issues;
}

/**
 * Loads an application pass and captures its full-page appearance.
 *
 * @param params - Capture options.
 * @param params.page - Isolated browser page to use.
 * @param params.screenshotPath - Output path for the screenshot.
 * @param params.url - Application URL to load.
 * @returns A promise that resolves after the screenshot is written.
 */
async function capturePage({
  page,
  screenshotPath,
  url,
}: CapturePageParams): Promise<void> {
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "JS playground" })).toBeVisible();
  await page.screenshot({ fullPage: true, path: screenshotPath });
}

/**
 * Returns the center point of every visible resize-handle dot.
 *
 * @param page - Page containing the resize handle.
 * @param separatorIndex - Zero-based separator index.
 * @returns Center coordinates for the separator's three dots.
 */
async function getDotCenters(
  page: Page,
  separatorIndex: number,
): Promise<Array<DotCenter>> {
  const dots = page
    .getByRole("separator")
    .nth(separatorIndex)
    .locator(".ResizeHandleDot");

  return dots.evaluateAll(function measureDotCenters(elements) {
    return elements.map(function getDotCenter(element) {
      const rect = element.getBoundingClientRect();

      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
    });
  });
}

/**
 * Drags a separator by a fixed offset and verifies its active-state contract.
 *
 * @param params - Drag options.
 * @param params.page - Page containing the separator.
 * @param params.separatorIndex - Zero-based separator index.
 * @param params.xOffset - Horizontal drag distance.
 * @param params.yOffset - Vertical drag distance.
 * @returns A promise that resolves after the drag completes.
 */
async function dragSeparator({
  page,
  separatorIndex,
  xOffset,
  yOffset,
}: DragSeparatorParams): Promise<void> {
  const separator = page.getByRole("separator").nth(separatorIndex);
  const box = await separator.boundingBox();

  expect(box).not.toBeNull();

  if (!box) {
    return;
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await expect(separator).toHaveAttribute("data-separator", "active");
  await expect
    .poll(async function getActiveBackgroundColor() {
      return separator
        .locator(".ResizeHandleDots")
        .evaluate(function readBackgroundColor(element) {
          return getComputedStyle(element).backgroundColor;
        });
    })
    .not.toBe("rgba(0, 0, 0, 0)");
  await page.mouse.move(startX + xOffset, startY + yOffset, { steps: 5 });
  await page.mouse.up();
}

test("resize grips match their dividers and remain interactive", async ({
  browser,
}) => {
  const baselinePage = await browser.newPage();
  const baselineIssues = captureBrowserIssues(baselinePage);

  await capturePage({
    page: baselinePage,
    screenshotPath: "test-results/resize-handle-before.png",
    url: BASELINE_URL,
  });
  await baselinePage.close();

  const page = await browser.newPage();
  const localIssues = captureBrowserIssues(page);

  await capturePage({
    page,
    screenshotPath: "test-results/resize-handle-after.png",
    url: LOCAL_URL,
  });

  const separators = page.getByRole("separator");
  const verticalSeparator = separators.nth(0);
  const horizontalSeparator = separators.nth(1);

  await expect(separators).toHaveCount(2);
  await expect(verticalSeparator).toHaveAttribute("aria-orientation", "vertical");
  await expect(horizontalSeparator).toHaveAttribute(
    "aria-orientation",
    "horizontal",
  );

  const verticalDotCenters = await getDotCenters(page, 0);
  const horizontalDotCenters = await getDotCenters(page, 1);
  const verticalXCoordinates = verticalDotCenters.map(({ x }) => x);
  const horizontalYCoordinates = horizontalDotCenters.map(({ y }) => y);

  expect(verticalDotCenters).toHaveLength(3);
  expect(horizontalDotCenters).toHaveLength(3);
  expect(Math.max(...verticalXCoordinates) - Math.min(...verticalXCoordinates)).toBeLessThanOrEqual(
    ALIGNMENT_TOLERANCE_PX,
  );
  expect(Math.max(...horizontalYCoordinates) - Math.min(...horizontalYCoordinates)).toBeLessThanOrEqual(
    ALIGNMENT_TOLERANCE_PX,
  );

  const editorPanel = page.locator("#editor-panel");
  const outputPanel = page.locator("#output-panel");
  const editorWidthBefore = await editorPanel.evaluate(function getPanelWidth(
    element,
  ) {
    return element.getBoundingClientRect().width;
  });
  const outputHeightBefore = await outputPanel.evaluate(function getPanelHeight(
    element,
  ) {
    return element.getBoundingClientRect().height;
  });

  await dragSeparator({
    page,
    separatorIndex: 0,
    xOffset: DRAG_DISTANCE_PX,
    yOffset: 0,
  });
  await dragSeparator({
    page,
    separatorIndex: 1,
    xOffset: 0,
    yOffset: DRAG_DISTANCE_PX,
  });

  const editorWidthAfter = await editorPanel.evaluate(function getPanelWidth(
    element,
  ) {
    return element.getBoundingClientRect().width;
  });
  const outputHeightAfter = await outputPanel.evaluate(function getPanelHeight(
    element,
  ) {
    return element.getBoundingClientRect().height;
  });

  expect(editorWidthAfter - editorWidthBefore).toBeGreaterThan(0);
  expect(outputHeightAfter - outputHeightBefore).toBeGreaterThan(0);
  expect(baselineIssues).toEqual([]);
  expect(localIssues).toEqual([]);

  await page.screenshot({
    fullPage: true,
    path: "test-results/resize-handle-after-interaction.png",
  });
  await page.close();
});
