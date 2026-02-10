import { test, expect } from "bun:test";
import {
  templateDefaults,
  templateLabels,
  allTemplateTypes,
  getDefaultProps,
} from "./template-config.ts";

test("allTemplateTypes has all 5 templates", () => {
  expect(allTemplateTypes).toEqual([
    "lower-third",
    "title-card",
    "brb",
    "topic-bar",
    "ticker",
  ]);
});

test("templateLabels maps every template type", () => {
  for (const t of allTemplateTypes) {
    expect(templateLabels[t]).toBeDefined();
    expect(typeof templateLabels[t]).toBe("string");
  }
});

test("templateDefaults has fields for every template type", () => {
  for (const t of allTemplateTypes) {
    expect(templateDefaults[t]).toBeDefined();
    expect(Array.isArray(templateDefaults[t])).toBe(true);
    expect(templateDefaults[t]!.length).toBeGreaterThan(0);
  }
});

test("getDefaultProps returns correct props for lower-third", () => {
  const props = getDefaultProps("lower-third");
  expect(props.name).toBe("Guest Name");
  expect(props.title).toBe("Podcast Guest");
});

test("getDefaultProps returns correct props for title-card", () => {
  const props = getDefaultProps("title-card");
  expect(props.heading).toBe("Episode Title");
  expect(props.subtitle).toBe("Season 1 Episode 1");
});

test("getDefaultProps returns correct props for brb", () => {
  const props = getDefaultProps("brb");
  expect(props.message).toBe("Be Right Back");
});

test("getDefaultProps returns correct props for ticker", () => {
  const props = getDefaultProps("ticker");
  expect(props.label).toBe("HN");
});

test("each template field has label, key, and placeholder", () => {
  for (const t of allTemplateTypes) {
    for (const field of templateDefaults[t]!) {
      expect(typeof field.label).toBe("string");
      expect(typeof field.key).toBe("string");
      expect(field.placeholder).toBeDefined();
    }
  }
});
