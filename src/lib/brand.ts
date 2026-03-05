import { promises as fs } from "fs";
import path from "path";

const PALETTE_PRESETS = {
  "warm-neutral": {
    "--bg-primary": "#f8f6f1",
    "--bg-secondary": "#f1eee5",
    "--bg-surface": "#fcf9f2",
    "--bg-hover": "rgba(35, 28, 20, 0.04)",
    "--bg-active": "rgba(35, 28, 20, 0.08)",
    "--text-primary": "#1d1915",
    "--text-secondary": "#6d655b",
    "--text-tertiary": "#8e8479",
    "--text-inverted": "#f8f6f1",
    "--border-default": "rgba(37, 29, 20, 0.12)",
    "--border-strong": "rgba(37, 29, 20, 0.2)",
    "--accent": "#c45d35",
    "--success": "#1f8a4c",
    "--warning": "#b46d13",
    "--error": "#c23f36",
    "--error-soft": "rgba(194, 63, 54, 0.12)"
  },
  "cool-professional": {
    "--bg-primary": "#f3f6f8",
    "--bg-secondary": "#eaf0f3",
    "--bg-surface": "#f9fbfc",
    "--bg-hover": "rgba(21, 35, 48, 0.04)",
    "--bg-active": "rgba(21, 35, 48, 0.08)",
    "--text-primary": "#1a2430",
    "--text-secondary": "#5f6d79",
    "--text-tertiary": "#7f8d99",
    "--text-inverted": "#f3f6f8",
    "--border-default": "rgba(21, 35, 48, 0.12)",
    "--border-strong": "rgba(21, 35, 48, 0.2)",
    "--accent": "#2a6ea6",
    "--success": "#1f8a4c",
    "--warning": "#b46d13",
    "--error": "#c23f36",
    "--error-soft": "rgba(194, 63, 54, 0.12)"
  },
  "bold-minimal": {
    "--bg-primary": "#f7f4ed",
    "--bg-secondary": "#efe7d8",
    "--bg-surface": "#fcf8ee",
    "--bg-hover": "rgba(39, 27, 18, 0.04)",
    "--bg-active": "rgba(39, 27, 18, 0.08)",
    "--text-primary": "#22170f",
    "--text-secondary": "#695e55",
    "--text-tertiary": "#8b7f73",
    "--text-inverted": "#f7f4ed",
    "--border-default": "rgba(39, 27, 18, 0.12)",
    "--border-strong": "rgba(39, 27, 18, 0.2)",
    "--accent": "#be4f2b",
    "--success": "#1f8a4c",
    "--warning": "#b46d13",
    "--error": "#c23f36",
    "--error-soft": "rgba(194, 63, 54, 0.12)"
  },
  "dark-premium": {
    "--bg-primary": "#171412",
    "--bg-secondary": "#211d1a",
    "--bg-surface": "#25201c",
    "--bg-hover": "rgba(255, 240, 220, 0.06)",
    "--bg-active": "rgba(255, 240, 220, 0.1)",
    "--text-primary": "#ece4d8",
    "--text-secondary": "#b7ab9a",
    "--text-tertiary": "#958879",
    "--text-inverted": "#171412",
    "--border-default": "rgba(255, 235, 210, 0.12)",
    "--border-strong": "rgba(255, 235, 210, 0.22)",
    "--accent": "#d57d4a",
    "--success": "#48b472",
    "--warning": "#d69a3f",
    "--error": "#dd6b62",
    "--error-soft": "rgba(221, 107, 98, 0.14)"
  }
} as const;

type PaletteName = keyof typeof PALETTE_PRESETS;

interface BrandConfig {
  palette?: PaletteName;
  accentColor?: string;
  fontPairing?: {
    heading?: string;
    body?: string;
  };
  customTokens?: Record<string, string>;
}

type ThemeTokenMap = Record<`--${string}`, string>;

const DEFAULT_HEADING_FONT = "\"Source Serif 4\", \"Iowan Old Style\", serif";
const DEFAULT_BODY_FONT = "\"DM Sans\", \"Avenir Next\", \"Segoe UI\", sans-serif";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  const shortHexMatch = /^#([0-9a-fA-F]{3})$/.exec(trimmed);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return { r: 0, g: 0, b: 0 };
  }

  const value = normalized.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function toHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
}

function darkenHex(hex: string, ratio: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - ratio;
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveFontStack(
  input: string | undefined,
  fallbackStack: string,
  kind: "heading" | "body"
): string {
  if (!input) {
    return fallbackStack;
  }

  const normalized = input.trim();
  if (!normalized) {
    return fallbackStack;
  }

  const fallbackSuffix = kind === "heading" ? "serif" : "system-ui, sans-serif";
  const escaped = normalized.replace(/"/g, "");
  return `"${escaped}", ${fallbackSuffix}`;
}

function parseBrandConfig(raw: unknown): BrandConfig {
  if (!isObject(raw)) {
    return {};
  }

  const parsed: BrandConfig = {};

  if (
    typeof raw.palette === "string" &&
    raw.palette in PALETTE_PRESETS
  ) {
    parsed.palette = raw.palette as PaletteName;
  }

  if (typeof raw.accentColor === "string") {
    parsed.accentColor = raw.accentColor;
  }

  if (isObject(raw.fontPairing)) {
    parsed.fontPairing = {
      heading:
        typeof raw.fontPairing.heading === "string"
          ? raw.fontPairing.heading
          : undefined,
      body:
        typeof raw.fontPairing.body === "string"
          ? raw.fontPairing.body
          : undefined
    };
  }

  if (isObject(raw.customTokens)) {
    const tokenEntries = Object.entries(raw.customTokens).filter(
      ([key, value]) =>
        key.startsWith("--") && typeof value === "string" && value.trim().length > 0
    );

    if (tokenEntries.length > 0) {
      parsed.customTokens = Object.fromEntries(tokenEntries) as Record<
        string,
        string
      >;
    }
  }

  return parsed;
}

export function buildBrandThemeTokens(raw: unknown): ThemeTokenMap {
  const config = parseBrandConfig(raw);
  const paletteName: PaletteName = config.palette ?? "warm-neutral";
  const paletteTokens = PALETTE_PRESETS[paletteName];

  const accent =
    (typeof config.accentColor === "string" &&
      normalizeHexColor(config.accentColor)) ||
    paletteTokens["--accent"];

  const tokens: ThemeTokenMap = {
    ...paletteTokens,
    "--accent": accent,
    "--accent-hover": darkenHex(accent, 0.12),
    "--accent-soft": withAlpha(accent, 0.12),
    "--focus-ring": withAlpha(accent, 0.36),
    "--font-heading": resolveFontStack(
      config.fontPairing?.heading,
      DEFAULT_HEADING_FONT,
      "heading"
    ),
    "--font-body": resolveFontStack(
      config.fontPairing?.body,
      DEFAULT_BODY_FONT,
      "body"
    )
  };

  if (config.customTokens) {
    for (const [key, value] of Object.entries(config.customTokens)) {
      tokens[key as `--${string}`] = value;
    }
  }

  return tokens;
}

export async function loadProjectBrandThemeTokens(
  projectRoot: string = process.cwd()
): Promise<ThemeTokenMap | undefined> {
  const brandPath = path.join(projectRoot, "brand.json");

  try {
    const raw = await fs.readFile(brandPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return buildBrandThemeTokens(parsed);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return undefined;
    }

    return buildBrandThemeTokens({});
  }
}
