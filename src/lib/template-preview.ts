import { Template } from "@/lib/types";

const STARTER_TEMPLATE_SLUGS = new Set(["supportbot-pro", "docgenerator"]);

export interface TemplateVersionEntry {
  version: string;
  releasedAt: string;
  notes: string;
}

export interface TemplatePreviewContent {
  demoAssetType: "gif";
  demoAssetUrl: string;
  fileTree: string[];
  readmePreview: string;
  customizePreview: string;
  versionHistory: TemplateVersionEntry[];
  starterAvailable: boolean;
}

function getPreviousVersion(version: string): string {
  const [majorRaw, minorRaw, patchRaw] = version.split(".").map(Number);
  const major = Number.isFinite(majorRaw) ? majorRaw : 1;
  const minor = Number.isFinite(minorRaw) ? minorRaw : 0;
  const patch = Number.isFinite(patchRaw) ? patchRaw : 0;

  if (patch > 0) {
    return `${major}.${minor}.${patch - 1}`;
  }

  if (minor > 0) {
    return `${major}.${minor - 1}.0`;
  }

  return `${Math.max(major - 1, 0)}.0.0`;
}

function getVersionHistory(template: Template): TemplateVersionEntry[] {
  const currentReleasedAt = Date.parse(template.publishedAt);
  const previousReleasedAt = Number.isNaN(currentReleasedAt)
    ? new Date().toISOString()
    : new Date(currentReleasedAt - 21 * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      version: template.version,
      releasedAt: template.publishedAt,
      notes: "Current production release with tested prompt and tool updates."
    },
    {
      version: getPreviousVersion(template.version),
      releasedAt: previousReleasedAt,
      notes: "Previous release maintained for rollback guidance and migration diff."
    }
  ];
}

function buildReadmePreview(template: Template): string {
  return [
    `# ${template.title}`,
    "",
    template.longDescription,
    "",
    "## Included",
    ...template.includes.map((item) => `- ${item}`),
    "",
    "## Compatible Frameworks",
    ...template.frameworks.map((framework) => `- ${framework}`),
    "",
    "## Version",
    `${template.version} (${new Date(template.publishedAt).toLocaleDateString("en-US")})`
  ].join("\n");
}

function buildCustomizePreview(template: Template): string {
  return [
    "# CUSTOMIZE.md",
    "",
    "1. Define your environment and target user profile before editing prompts.",
    "2. Map tool credentials and connection ids in `tools/tool-configs.json`.",
    "3. Update guardrails to reflect your compliance and escalation policy.",
    "4. Run test scenarios under `tests/` before enabling autonomous actions.",
    "",
    `Recommended starting point for ${template.title}:`,
    `- Complexity: ${template.complexity}`,
    `- Category: ${template.category}`,
    `- Price tier: $${Math.round(template.priceCents / 100)}`
  ].join("\n");
}

function buildFileTree(template: Template): string[] {
  const coreFiles = [
    "SOUL.md",
    "IDENTITY.md",
    "AGENTS.md",
    "README.md",
    "CUSTOMIZE.md",
    "prompts/",
    "tools/tool-configs.json",
    "memory/schema.json",
    "guardrails/",
    "deploy/openclaw.yaml",
    "deploy/docker-compose.yml",
    "tests/"
  ];

  const previewPaths = template.previewFiles.map((file) => file.path);
  return Array.from(new Set([...coreFiles, ...previewPaths]));
}

export function isStarterTemplateAvailable(templateSlug: string): boolean {
  return STARTER_TEMPLATE_SLUGS.has(templateSlug);
}

export function buildTemplatePreview(template: Template): TemplatePreviewContent {
  return {
    demoAssetType: "gif",
    demoAssetUrl: `/demos/${template.slug}.gif`,
    fileTree: buildFileTree(template),
    readmePreview: buildReadmePreview(template),
    customizePreview: buildCustomizePreview(template),
    versionHistory: getVersionHistory(template),
    starterAvailable: isStarterTemplateAvailable(template.slug)
  };
}
