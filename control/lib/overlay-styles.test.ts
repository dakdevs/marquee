import { test, expect } from "bun:test";
import { overlayStyles, previewStyles } from "./overlay-styles.ts";
import { allTemplateTypes } from "./template-config.ts";

test("overlayStyles has an entry for every template type", () => {
  for (const t of allTemplateTypes) {
    expect(overlayStyles[t]).toBeDefined();
    expect(overlayStyles[t]!.container).toBeTruthy();
  }
});

test("previewStyles has an entry for every template type", () => {
  for (const t of allTemplateTypes) {
    expect(previewStyles[t]).toBeDefined();
    expect(previewStyles[t]!.container).toBeTruthy();
  }
});

test("overlayStyles and previewStyles have matching keys per template", () => {
  for (const t of allTemplateTypes) {
    const overlayKeys = Object.keys(overlayStyles[t]!).sort();
    const previewKeys = Object.keys(previewStyles[t]!).sort();
    expect(overlayKeys).toEqual(previewKeys);
  }
});
