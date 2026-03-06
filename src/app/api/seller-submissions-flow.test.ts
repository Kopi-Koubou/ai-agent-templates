import { beforeEach, describe, expect, test } from "vitest";

import {
  GET as listSubmissionsRoute,
  POST as createSubmissionRoute
} from "@/app/api/seller/submissions/route";
import { clearSellerSubmissionStoreForTests } from "@/lib/seller-submissions";

interface SellerSubmissionsResponse {
  count: number;
  sellerEmail: string | null;
  submissions: Array<{
    id: string;
    templateSlug: string;
    status: "pending-review" | "needs-updates" | "approved";
  }>;
}

describe("seller submissions API flow", () => {
  beforeEach(() => {
    clearSellerSubmissionStoreForTests();
  });

  test("creates a submission and persists seller session cookie", async () => {
    const response = await createSubmissionRoute(
      new Request("http://localhost/api/seller/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: "creator@example.com",
          sellerName: "Creator Labs",
          templateTitle: "Refund Guard Agent",
          templateSlug: "refund-guard-agent",
          category: "support",
          frameworks: ["claude-code", "openclaw"],
          priceUsd: 129,
          zipPath: "/uploads/refund-guard-agent.zip",
          includedFiles: [
            "SOUL.md",
            "IDENTITY.md",
            "AGENTS.md",
            "README.md",
            "CUSTOMIZE.md",
            "tools/tool-configs.json",
            "memory/schema.json",
            "tests/refund-cases.md"
          ],
          readmeWordCount: 220,
          testScenarioCount: 34
        })
      })
    );

    expect(response.status).toBe(201);
    const payload = (await response.json()) as {
      submission: SellerSubmissionsResponse["submissions"][number];
    };
    expect(payload.submission.id).toMatch(/^sub_/);
    expect(payload.submission.status).toBe("pending-review");
    expect(response.headers.get("set-cookie")).toContain("agentvault_seller_email=");
  });

  test("lists submissions scoped to seller cookie", async () => {
    await createSubmissionRoute(
      new Request("http://localhost/api/seller/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: "creator@example.com",
          sellerName: "Creator Labs",
          templateTitle: "Refund Guard Agent",
          templateSlug: "refund-guard-agent",
          category: "support",
          frameworks: ["claude-code"],
          priceUsd: 129,
          zipPath: "/uploads/refund-guard-agent.zip",
          includedFiles: [
            "SOUL.md",
            "IDENTITY.md",
            "AGENTS.md",
            "README.md",
            "CUSTOMIZE.md",
            "tools/tool-configs.json",
            "memory/schema.json",
            "tests/refund-cases.md"
          ],
          readmeWordCount: 220,
          testScenarioCount: 34
        })
      })
    );

    await createSubmissionRoute(
      new Request("http://localhost/api/seller/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: "other@example.com",
          sellerName: "Other Labs",
          templateTitle: "Lead Ops Agent",
          templateSlug: "lead-ops-agent",
          category: "data",
          frameworks: ["openclaw"],
          priceUsd: 99,
          zipPath: "/uploads/lead-ops-agent.zip",
          includedFiles: [
            "SOUL.md",
            "IDENTITY.md",
            "AGENTS.md",
            "README.md",
            "CUSTOMIZE.md",
            "tools/tool-configs.json",
            "memory/schema.json",
            "tests/scenarios.md"
          ],
          readmeWordCount: 180,
          testScenarioCount: 27
        })
      })
    );

    const response = await listSubmissionsRoute(
      new Request("http://localhost/api/seller/submissions", {
        headers: {
          cookie: "agentvault_seller_email=creator%40example.com"
        }
      })
    );

    expect(response.status).toBe(200);
    const payload = (await response.json()) as SellerSubmissionsResponse;
    expect(payload.sellerEmail).toBe("creator@example.com");
    expect(payload.count).toBe(1);
    expect(payload.submissions[0]?.templateSlug).toBe("refund-guard-agent");
  });

  test("rejects malformed submissions", async () => {
    const response = await createSubmissionRoute(
      new Request("http://localhost/api/seller/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerEmail: "invalid",
          sellerName: "x",
          templateTitle: "A",
          templateSlug: "a",
          category: "support",
          frameworks: [],
          priceUsd: -1,
          zipPath: "/a.zip",
          includedFiles: [],
          readmeWordCount: -1,
          testScenarioCount: -3
        })
      })
    );

    expect(response.status).toBe(400);
  });
});

