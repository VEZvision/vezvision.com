import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  normalizeContactEmail,
  normalizeContactText,
} from "./contactValidation.ts";

Deno.test("normalizeContactText enforces message minimum length", () => {
  assertEquals(normalizeContactText("short", 5000, 10), null);
  assertEquals(normalizeContactText("long enough msg", 5000, 10), "long enough msg");
});

Deno.test("normalizeContactEmail lowercases valid email", () => {
  assertEquals(normalizeContactEmail("  Test@Example.com "), "test@example.com");
});
