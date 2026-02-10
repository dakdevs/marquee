import { test, expect } from "bun:test";
import type { TemplateType, OverlayLayer, Scene } from "./types.ts";

test("TemplateType values are correctly typed", () => {
  const templates: TemplateType[] = [
    "lower-third",
    "title-card",
    "brb",
    "topic-bar",
    "ticker",
  ];
  expect(templates).toHaveLength(5);
});

test("OverlayLayer has required fields", () => {
  const layer: OverlayLayer = {
    id: "layer-1",
    label: "Test Layer",
    template: "lower-third",
    props: { name: "Test", title: "Host" },
  };
  expect(layer.id).toBe("layer-1");
  expect(layer.label).toBe("Test Layer");
  expect(layer.template).toBe("lower-third");
  expect(layer.props.name).toBe("Test");
});

test("Scene has draft and live arrays", () => {
  const scene: Scene = {
    id: "scene-1",
    name: "Main",
    draft: [],
    live: [],
    visible: true,
  };
  expect(scene.draft).toEqual([]);
  expect(scene.live).toEqual([]);
  expect(scene.visible).toBe(true);
});
