import { describe, expect, test } from "vitest";

import { buildBrandThemeTokens } from "@/lib/brand";

describe("brand token resolution", () => {
  test("uses warm-neutral defaults when config is missing", () => {
    const tokens = buildBrandThemeTokens(undefined);

    expect(tokens["--bg-primary"]).toBe("#f8f6f1");
    expect(tokens["--accent"]).toBe("#c45d35");
    expect(tokens["--accent-hover"]).toBe("#ac522f");
    expect(tokens["--accent-soft"]).toBe("rgba(196, 93, 53, 0.12)");
    expect(tokens["--focus-ring"]).toBe("rgba(196, 93, 53, 0.36)");
  });

  test("applies accent color overrides and derives related accent tokens", () => {
    const tokens = buildBrandThemeTokens({
      accentColor: "#E85D3A"
    });

    expect(tokens["--accent"]).toBe("#e85d3a");
    expect(tokens["--accent-hover"]).toBe("#cc5233");
    expect(tokens["--accent-soft"]).toBe("rgba(232, 93, 58, 0.12)");
    expect(tokens["--focus-ring"]).toBe("rgba(232, 93, 58, 0.36)");
  });

  test("applies palette, font pairing, and custom token overrides", () => {
    const tokens = buildBrandThemeTokens({
      palette: "cool-professional",
      fontPairing: {
        heading: "Newsreader",
        body: "Plus Jakarta Sans"
      },
      customTokens: {
        "--radius-lg": "14px",
        "--space-8": "36px"
      }
    });

    expect(tokens["--bg-primary"]).toBe("#f3f6f8");
    expect(tokens["--accent"]).toBe("#2a6ea6");
    expect(tokens["--font-heading"]).toBe("\"Newsreader\", serif");
    expect(tokens["--font-body"]).toBe(
      "\"Plus Jakarta Sans\", system-ui, sans-serif"
    );
    expect(tokens["--radius-lg"]).toBe("14px");
    expect(tokens["--space-8"]).toBe("36px");
  });
});
