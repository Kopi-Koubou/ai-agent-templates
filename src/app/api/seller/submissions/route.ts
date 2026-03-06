import { NextResponse } from "next/server";
import { z } from "zod";

import { getCookieValue } from "@/lib/http";
import {
  createSellerSubmission,
  listSellerSubmissions,
  listSellerSubmissionsByEmail
} from "@/lib/seller-submissions";

const SELLER_EMAIL_COOKIE = "agentvault_seller_email";

const submissionSchema = z.object({
  sellerEmail: z.string().trim().email(),
  sellerName: z.string().trim().min(2).max(80),
  templateTitle: z.string().trim().min(3).max(120),
  templateSlug: z.string().trim().min(2).max(80),
  category: z.enum(["support", "content", "data", "devtools"]),
  frameworks: z
    .array(z.enum(["openclaw", "claude-code", "langgraph", "crewai"]))
    .min(1)
    .max(4),
  priceUsd: z.coerce.number().positive().max(9999),
  zipPath: z.string().trim().min(8).max(240),
  includedFiles: z.array(z.string().trim().min(1).max(200)).min(1).max(200),
  readmeWordCount: z.coerce.number().int().min(0).max(50000),
  testScenarioCount: z.coerce.number().int().min(0).max(5000)
});

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedSellerEmail = url.searchParams.get("sellerEmail");
  const sellerEmail =
    (typeof requestedSellerEmail === "string" &&
    requestedSellerEmail.trim().length > 0
      ? requestedSellerEmail.trim()
      : undefined) ?? getCookieValue(request, SELLER_EMAIL_COOKIE);

  const submissions = sellerEmail
    ? listSellerSubmissionsByEmail(sellerEmail)
    : listSellerSubmissions();

  return NextResponse.json({
    count: submissions.length,
    sellerEmail: sellerEmail ?? null,
    submissions
  });
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid seller submission payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const submission = createSellerSubmission({
    sellerEmail: parsed.data.sellerEmail,
    sellerName: parsed.data.sellerName,
    templateTitle: parsed.data.templateTitle,
    templateSlug: parsed.data.templateSlug,
    category: parsed.data.category,
    frameworks: parsed.data.frameworks,
    priceCents: Math.round(parsed.data.priceUsd * 100),
    zipPath: parsed.data.zipPath,
    includedFiles: parsed.data.includedFiles,
    readmeWordCount: parsed.data.readmeWordCount,
    testScenarioCount: parsed.data.testScenarioCount
  });

  const response = NextResponse.json({ submission }, { status: 201 });
  response.cookies.set(SELLER_EMAIL_COOKIE, submission.sellerEmail, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60
  });

  return response;
}

